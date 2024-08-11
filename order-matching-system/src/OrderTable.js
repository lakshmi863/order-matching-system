import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import './OrderTable.css'
const OrderTable = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const pendingRes = await axios.get('http://localhost:5000/getOrders'); // Updated URL
                // Assuming the backend returns both pending and completed orders in a single response
                const { pendingOrders, completedOrders } = pendingRes.data;
                setPendingOrders(pendingOrders);
                setCompletedOrders(completedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className='container'>
          
            <div>
            <h2>Pending Orders</h2>
            <table className="pending-orders-table">
                <thead>
                    <tr>
                        <th>Buyer Qty</th>
                        <th>Buyer Price</th>
                        <th>Seller Price</th>
                        <th>Seller Qty</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingOrders.map(order => (
                        <tr key={order.id}>
                            <td>{order.buyer_qty}</td>
                            <td>{order.buyer_price}</td>
                            <td>{order.seller_price}</td>
                            <td>{order.seller_qty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            
            
            <div className='table_con'>

            <h2>Completed Orders</h2>
            <table className="completed-orders-table">
                <thead>
                    <tr>
                        <th>Price</th>
                        <th>Qty</th>
                    </tr>
                </thead>
                <tbody>
                    {completedOrders.map(order => (
                        <tr key={order.id}>
                            <td>{order.price}</td>
                            <td>{order.qty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            </div>
    );
};

export default OrderTable;
