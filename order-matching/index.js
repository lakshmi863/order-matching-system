const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:3000', 
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type',
};

app.use(cors(corsOptions));

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'lakshmi',
    database: 'ordermatchingdb',
});

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');

    // Use the database
    db.query('USE OrderMatchingDB', (err, result) => {
        if (err) throw err;

        // Create PendingOrderTable
        const createPendingOrderTable = `
            CREATE TABLE IF NOT EXISTS PendingOrderTable (
                id INT AUTO_INCREMENT PRIMARY KEY,
                buyer_qty INT,
                buyer_price DECIMAL(10, 2),
                seller_price DECIMAL(10, 2),
                seller_qty INT,
                INDEX (buyer_price),
                INDEX (seller_price)
            )
        `;
        db.query(createPendingOrderTable, (err, result) => {
            if (err) throw err;
            console.log('PendingOrderTable created or already exists');
        });

        // Create CompletedOrderTable
        const createCompletedOrderTable = `
            CREATE TABLE IF NOT EXISTS CompletedOrderTable (
                id INT AUTO_INCREMENT PRIMARY KEY,
                price DECIMAL(10, 2),
                qty INT
            )
        `;
        db.query(createCompletedOrderTable, (err, result) => {
            if (err) throw err;
            console.log('CompletedOrderTable created or already exists');
        });
    });
});

// API to create a new order
app.post('/createOrder', (req, res) => {
    const { buyer_qty, buyer_price, seller_price, seller_qty } = req.body;
    const query = 'INSERT INTO PendingOrderTable (buyer_qty, buyer_price, seller_price, seller_qty) VALUES (?, ?, ?, ?)';
    db.query(query, [buyer_qty, buyer_price, seller_price, seller_qty], (err, result) => {
        if (err) throw err;
        matchOrders();
        res.send('Order created successfully');
    });
});

// API to match orders
function matchOrders() {
    const selectQuery = `SELECT * FROM PendingOrderTable WHERE buyer_price >= seller_price ORDER BY buyer_price DESC, seller_price ASC LIMIT 1`;
    db.query(selectQuery, (err, rows) => {
        if (err) throw err;

        if (rows.length) {
            const order = rows[0];
            const buyerQty = order.buyer_qty;
            const sellerQty = order.seller_qty;
            const qtyToMatch = Math.min(buyerQty, sellerQty);

            // Move matched quantity to CompletedOrderTable
            const insertQuery = `INSERT INTO CompletedOrderTable (price, qty) VALUES (?, ?)`;
            db.query(insertQuery, [order.seller_price, qtyToMatch], (err, result) => {
                if (err) throw err;

                if (buyerQty > sellerQty) {
                    // Update PendingOrderTable with remaining buyer quantity
                    const remainingBuyerQty = buyerQty - qtyToMatch;
                    const updateQuery = `
                        UPDATE PendingOrderTable 
                        SET buyer_qty = ?, seller_qty = ?
                        WHERE id = ?
                    `;
                    db.query(updateQuery, [remainingBuyerQty, sellerQty, order.id], (err, result) => {
                        if (err) throw err;
                    });
                } else if (buyerQty < sellerQty) {
                    // Update PendingOrderTable with remaining seller quantity
                    const remainingSellerQty = sellerQty - qtyToMatch;
                    const updateQuery = `
                        UPDATE PendingOrderTable 
                        SET buyer_qty = ?, seller_qty = ?
                        WHERE id = ?
                    `;
                    db.query(updateQuery, [buyerQty, remainingSellerQty, order.id], (err, result) => {
                        if (err) throw err;
                    });
                } else {
                    // If quantities are equal, remove the order from PendingOrderTable
                    const deleteQuery = `DELETE FROM PendingOrderTable WHERE id = ?`;
                    db.query(deleteQuery, [order.id], (err, result) => {
                        if (err) throw err;
                    });
                }
            });
        }
    });
}
// API to get all orders
app.get('/getOrders', (req, res) => {
    // Fetch data from database
    const pendingQuery = 'SELECT * FROM PendingOrderTable';
    const completedQuery = 'SELECT * FROM CompletedOrderTable';

    db.query(pendingQuery, (err, pendingOrders) => {
        if (err) return res.status(500).json({ error: 'Error fetching pending orders' });

        db.query(completedQuery, (err, completedOrders) => {
            if (err) return res.status(500).json({ error: 'Error fetching completed orders' });

            res.json({ pendingOrders, completedOrders });
        });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
