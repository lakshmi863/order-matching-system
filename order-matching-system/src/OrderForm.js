import React, { useState } from 'react';
import './App.css'
import './Order.css'
const OrderForm = () => {
    const [formData, setFormData] = useState({
        buyerQty: '',
        buyerPrice: '',
        sellerPrice: '',
        sellerQty: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/createOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    buyer_qty: formData.buyerQty,  
                    buyer_price: formData.buyerPrice,
                    seller_price: formData.sellerPrice,
                    seller_qty: formData.sellerQty
                })
            });
            
            if (response.ok) {
                alert('Order placed successfully!');
            } else {
                alert('Unexpected response from the server');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to place order');
        }
    };
    
    return (
        <div className="container">
          
        <form onSubmit={handleSubmit}>
            <input type="number" name="buyerQty" placeholder="Buyer Qty" value={formData.buyerQty} onChange={handleChange} />
            <input type="number" name="buyerPrice" placeholder="Buyer Price" value={formData.buyerPrice} onChange={handleChange} />
            <input type="number" name="sellerPrice" placeholder="Seller Price" value={formData.sellerPrice} onChange={handleChange} />
            <input type="number" name="sellerQty" placeholder="Seller Qty" value={formData.sellerQty} onChange={handleChange} />
            <center>
            <button type="submit">Place Order</button>
            </center>
           
        </form>
       
       
        </div>
    );
};

export default OrderForm;
