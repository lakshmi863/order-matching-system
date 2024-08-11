import React from 'react';
import OrderForm from './OrderForm';
import OrderTable from './OrderTable';
import PriceChart from './PriceChart';

function App() {
    return (
        <div className="App">
            <OrderForm />
            <OrderTable />
            <PriceChart />
        </div>
    );
}

export default App;
