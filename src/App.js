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
import Bill from './UserComponents/Billing/Bill';
import { API_BASE_URL } from './UserComponents/Config.js';
import StoreComponent from './UserComponents/Store/StoreComponent'; 
import StoreLogin from './UserComponents/Store/StoreLogin'; 
import Invoice from './UserComponents/Invoice/Invoice'; 
import SchoolSalesReport from './UserComponents/SalesReport/SchoolSalesReport'; 
import SalesReportGraph from './UserComponents/SalesReport/SalesReportGraph'; 
import ExchangeBill from './UserComponents/Billing/ExchangeBill.js';

import './App.css'; 


function App() {
  const [userData, setUserData] = useState(null);
  const [serverOffline, setServerOffline] = useState(false);

  const saveUserData = (data) => {
    setUserData(data);
    localStorage.setItem('user', JSON.stringify(data)); 
    sessionStorage.setItem('user', JSON.stringify(data)); 
    };

  useEffect(() => {
    const savedUserData = sessionStorage.getItem('userData');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/health-check`);
        if (response.ok) {
          setServerOffline(false);
        } else {
          setServerOffline(true);
        }
      } catch (error) {
        setServerOffline(true);
      }
    };

    checkServerStatus(); 
    const interval = setInterval(checkServerStatus, 20000); // Check every 20 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
    <div className="App">
      {serverOffline && (
        <div className="offline-dialog">
          <p>Server is offline. Please check your connection.</p>
        </div>
      )}
    <Routes>
          <Route path="/store/login" element={<StoreLogin />} />
          <Route path="/store/dashboard" element={<StoreComponent />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/exchange" element={<ExchangeBill />} />
          

      
          {!userData ? (
            <Route path="*" element={<Login setUserData={saveUserData} />} />
          ) : (
            <>
              <Route path="/" element={<MainComponent userData={userData} />} />
              <Route path="/barcode" element={<BarcodePrintPage />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;