import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './UserComponents/Login/Login';
import MainComponent from './UserComponents/Dashboard/MainComponent';
import FilterPage from './UserComponents/Inventory/FilterPage';
import FilterSalesPage from './UserComponents/SalesReport/FilterSalesPage';
import CustomerOrder from './UserComponents/OrderBook/CustomerOrder';
import OrderView from './UserComponents/OrderBook/OrderView';
import PurchaseOrderBook from './UserComponents/OrderBook/PurchaseOrderBook';


import './App.css'; // Custom CSS for styling

function App() {
  const [userData, setUserData] = useState(null);

  return (
    <Router>
      <div className="App">
        {!userData ? (
          <Login setUserData={setUserData} />
        ) : (
          <Routes>
            <Route path="/" element={<MainComponent userData={userData} />} />
            <Route path="/filter" element={<FilterPage />} />
            <Route path="/filter-sales" element={<FilterSalesPage />} />
            <Route path="/customer-order" element={<CustomerOrder />} />
            <Route path="/view_customer_order" element={<OrderView />} />
            <Route path="/purchase-order-book" element={<PurchaseOrderBook />} />
      
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
