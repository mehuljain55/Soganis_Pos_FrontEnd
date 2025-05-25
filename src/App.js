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
import TransactionView from './UserComponents/Transactions/TransactionView.js';
import Transaction from './UserComponents/Transactions/Transaction.js';


function App() {
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [serverOffline, setServerOffline] = useState(false);
  const[userLoginStatus,setLoginStatus]=useState(false);
  

  const saveUserData = (data, token) => {
    setUserData(data);
    setToken(token);

    sessionStorage.setItem('user', JSON.stringify(data));
    sessionStorage.setItem('token', token);
  };

 
  useEffect(() => {

    if(!userLoginStatus)
    {
      setUserData(null);
      sessionStorage.removeItem('user'); // Remove user data from session storage
      sessionStorage.removeItem('token'); // Remove user data from session storage  
      return;
    }
    const savedUserData = sessionStorage.getItem('user');
    const savedToken = sessionStorage.getItem('token');

    if (savedUserData && savedToken) {
      setUserData(JSON.parse(savedUserData));
      setToken(savedToken);
    }
  }, [userLoginStatus]);

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
                <Route path="/transaction" element={<Transaction />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;