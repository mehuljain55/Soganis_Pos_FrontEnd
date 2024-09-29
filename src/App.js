import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './UserComponents/Login/Login';
import MainComponent from './UserComponents/Dashboard/MainComponent';
import FilterPage from './UserComponents/Inventory/FilterPage';
import FilterSalesPage from './UserComponents/SalesReport/FilterSalesPage';
import CustomerOrder from './UserComponents/OrderBook/CustomerOrder';
import OrderView from './UserComponents/OrderBook/OrderView';
import AddItemStock from './UserComponents/Inventory/AddItemStock';
import AddInventoryItem from './UserComponents/Inventory/AddInventoryItem';

import PurchaseOrderBook from './UserComponents/OrderBook/PurchaseOrderBook';
import BarcodePrintPage from './UserComponents/Billing/BarcodePrintPage';

import './App.css'; // Custom CSS for styling
import Bill from './UserComponents/Billing/Bill';

function App() {
  const [userData, setUserData] = useState(null);
  const [serverOffline, setServerOffline] = useState(false);

  // Function to save userData to localStorage
  const saveUserData = (data) => {
    setUserData(data);
    localStorage.setItem('userData', JSON.stringify(data)); // Store in localStorage
  };

  // Retrieve userData from localStorage when the app loads
  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  // Function to check the server status
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:8080/health-check');
        if (response.ok) {
          setServerOffline(false);
        } else {
          setServerOffline(true);
        }
      } catch (error) {
        setServerOffline(true);
      }
    };

    checkServerStatus(); // Initial check on mount
    const interval = setInterval(checkServerStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <Router>
      <div className="App">
        {serverOffline && (
          <div className="offline-dialog">
            <p>Server is offline. Please check your connection.</p>
          </div>
        )}
        {!userData ? (
          // Pass the saveUserData function to Login component
          <Login setUserData={saveUserData} />
        ) : (
          <Routes>
            <Route path="/" element={<MainComponent userData={userData} />} />
            <Route path="/filter" element={<FilterPage />} />
            <Route path="/filter-sales" element={<FilterSalesPage />} />
            <Route path="/customer-order" element={<CustomerOrder />} />
            <Route path="/view_customer_order" element={<OrderView />} />
            <Route path="/purchase-order-book" element={<PurchaseOrderBook />} />
            <Route path="/barcode" element={<BarcodePrintPage />} />
            <Route path="/bill" element={<Bill />} />
            <Route path="/add_item" element={<AddItemStock />} />
            <Route path="/inventory/update" element={<AddInventoryItem />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
