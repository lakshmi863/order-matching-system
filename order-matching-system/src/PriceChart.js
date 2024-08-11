import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import Axios from 'axios';
import './App.css';

const PriceChart = () => {
    const [completedOrders, setCompletedOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);

    useEffect(() => {
        // Fetch completed orders
        Axios.get('/getCompletedOrders')
            .then(response => setCompletedOrders(response.data))
            .catch(error => console.error('Error fetching completed orders:', error));

        // Fetch pending orders
        Axios.get('/getPendingOrders')
            .then(response => setPendingOrders(response.data))
            .catch(error => console.error('Error fetching pending orders:', error));
    }, []);

    // Combine data
    const combinedData = [
        ...completedOrders.map(item => ({ ...item, type: 'Completed' })),
        ...pendingOrders.map(item => ({ ...item, type: 'Pending' }))
    ];

    return (
        <div className="container">
            <LineChart width={500} height={300} data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8884d8"
                    name="Completed Orders"
                    data={completedOrders}
                />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#82ca9d"
                    name="Pending Orders"
                    data={pendingOrders}
                />
            </LineChart>
        </div>
    );
};

export default PriceChart;
