import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewBillContainer from '../Billing/NewBillContainer.js'; 
import Salary from '../Salary/Salary.js';
import UserCashCollection from '../../CashCollectionReport/UserCashCollection.js'; 
import FilterPage from '../Inventory/FilterPage.js'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import './MainComponent.css'; 
import FilterSalesPage from '../SalesReport/FilterSalesPage.js'; 
import CustomerOrder from '../OrderBook/CustomerOrder.js'; 
import OrderView from '../OrderBook/OrderView.js'; 
import PurchaseOrderBook from '../OrderBook/PurchaseOrderBook.js'; 


import { API_BASE_URL } from '../Config.js';

const MainComponent = ({ userData }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [todayCashCollection, setTodayCashCollection] = useState(null);

  const fetchTodayCashCollection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getTodayUserCashCollection`, {
        params: { userId: userData.userId }
      });
      setTodayCashCollection(response.data);
    } catch (error) {
      console.error('Error fetching today\'s cash collection:', error);
      setTodayCashCollection(null);
    }
  };

  const handleMenuItemClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
  };

  useEffect(() => {
    fetchTodayCashCollection();
  }, []);

  return (
    <div className="container-fluid">
      {/* Top Bar */}
      <div className="top-bar">
        <h1>Soganis NX</h1>
        {userData && (
          <div>
            <span>User: {userData.sname}</span>
            <span style={{ marginLeft: '20px' }}>
              Today Cash Collection: {todayCashCollection}
              <button className="refresh-button" onClick={fetchTodayCashCollection}>
                <FontAwesomeIcon icon={faSyncAlt} />
              </button>
            </span>
          </div>
        )}
      </div>
      
      {/* Sidebar Navigation and Main Content */}
      <div className="main-content-wrapper">
        <div className="sidebar">
          <button onClick={() => handleMenuItemClick('New Bill')}>New Bill</button>
          <button onClick={() => handleMenuItemClick('Returns')}>Return</button>
          <button onClick={() => handleMenuItemClick('Inter Company Transaction')}>Inter Company</button>
        
          <button onClick={() => handleMenuItemClick('Add Order')}>Order Book</button>
          <button onClick={() => handleMenuItemClick('View Order')}>View Order Book</button>
          <button onClick={() => handleMenuItemClick('View Stock')}>View Stock</button>
          <button onClick={() => handleMenuItemClick('Purchase Order')}>Purchase Order</button>
          
          <button onClick={() => handleMenuItemClick('Cash Collection')}>Cash Collection</button>
          <button onClick={() => handleMenuItemClick('View Sales Report')}>Sale Report</button>
          <button onClick={() => handleMenuItemClick('Salary Register')}>Salary Register</button>
    
        </div>
        <main className="main-content">
          {selectedMenuItem === 'New Bill' && <NewBillContainer userData={userData} />}
          {selectedMenuItem === 'Salary Register' && <Salary />}
          {selectedMenuItem === 'Add Order' && <CustomerOrder />}
          {selectedMenuItem === 'View Order' && <OrderView />}
          {selectedMenuItem === 'Purchase Order' && <PurchaseOrderBook />}
       

          {selectedMenuItem === 'Cash Collection' && <UserCashCollection />}
          {selectedMenuItem === 'View Stock' && <FilterPage />}
          {selectedMenuItem === 'View Sales Report' && <FilterSalesPage />}
        
          {selectedMenuItem === "Today's Sale" && <p>Today's Sale Component</p>}
        
        </main>
      </div>
    </div>
  );
};

export default MainComponent;
