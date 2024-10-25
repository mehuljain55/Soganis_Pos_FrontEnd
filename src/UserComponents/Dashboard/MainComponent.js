import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faBars } from '@fortawesome/free-solid-svg-icons'; 
import { useSwipeable } from 'react-swipeable';
import './MainComponent.css'; 

import NewBillContainer from '../Billing/NewBillContainer.js'; 
import InterCompanyTranfer from '../Billing/InterCompanyTranfer.js'; 
import BillDetails from '../Billing/BillDetails.js'; 
import Salary from '../Salary/Salary.js';
import UserCashCollection from '../CashCollectionReport/UserCashCollection.js'; 
import FilterPage from '../Inventory/FilterPage.js'; 
import SearchModal from '../Inventory/SearchModal.js'; 
import FilterSalesPage from '../SalesReport/FilterSalesPage.js'; 
import CustomerOrder from '../OrderBook/CustomerOrder.js'; 
import OrderView from '../OrderBook/OrderView.js'; 
import PurchaseOrderBook from '../OrderBook/PurchaseOrderBook.js';
import AddInventoryItem from '../Inventory/AddInventoryItem.js'; 
import { API_BASE_URL } from '../Config.js';
import { LogoutButton, useLogout } from '../Login/LogoutPage.js'; 

const MainComponent = ({ userData }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [todayCashCollection, setTodayCashCollection] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const navigate = useNavigate(); 

  const fetchTodayCashCollection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/getTodayUserCashCollection`, {
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
    
    // Close sidebar on mobile after selecting an option
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleShortcutKey = (event) => { 
    if (event.ctrlKey && event.key === 'f') {
      event.preventDefault(); 
      setIsSearchModalOpen(true);
    }
  };

  useEffect(() => {
    fetchTodayCashCollection();
    window.addEventListener('keydown', handleShortcutKey); 
    return () => {
      window.removeEventListener('keydown', handleShortcutKey); 
    };
  }, []);

  const handleLogout = useLogout();

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Swipe functionality for mobile
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => setIsSidebarOpen(true),
    onSwipedLeft: () => setIsSidebarOpen(false),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div className="container-fluid" {...swipeHandlers}>
      {/* Top Bar */}
      <div className="top-bar">
        <h1>SOGANI NX</h1>
        {userData && (
          <div className="user-info">
            <span>User: {userData.sname}</span>
            <span>Shop: {userData.storeId}</span>
            <span className="cash-collection">
              Today Cash Collection: {todayCashCollection}
              <button className="refresh-button" onClick={fetchTodayCashCollection}>
                <FontAwesomeIcon icon={faSyncAlt} />
              </button>
            </span>
            <LogoutButton onClick={handleLogout} />
          </div>
        )}
        {/* Menu Toggle Button (Visible only on mobile) */}
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      {/* Menu Text for Desktop */}
      <button className="desktop-menu-toggle" onClick={toggleSidebar}>
        Menu
      </button>

      {/* Sidebar Navigation and Main Content */}
      <div className={`main-content-wrapper ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-buttons">
            <button onClick={() => handleMenuItemClick('New Bill')}>New Bill</button>
            <button onClick={() => handleMenuItemClick('Returns')}>Return/Exchange</button>
            <button onClick={() => handleMenuItemClick('Inter Company Transaction')}>Inter Company</button>
            <button onClick={() => handleMenuItemClick('Add Order')}>Customer Order Book</button>
            <button onClick={() => handleMenuItemClick('View Order')}>View Order Book</button>
            <button onClick={() => handleMenuItemClick('View Stock')}>View Stock</button>
            <button onClick={() => handleMenuItemClick('Purchase Order')}>Purchase Order</button>
            <button onClick={() => handleMenuItemClick('Cash Collection')}>Cash Collection</button>
            <button onClick={() => handleMenuItemClick('View Sales Report')}>Sale Report</button>
            <button onClick={() => handleMenuItemClick('Salary Register')}>Salary Register</button>
            <button onClick={() => navigate('/barcode')}>Open Barcode</button>
            <button onClick={() => handleMenuItemClick('Update Inventory')}>Update Inventory</button>
            <button onClick={() => window.open('/add_item', '_blank')}>Add Inventory</button>
          </div>
        </div>

        <main className="main-content">
          {selectedMenuItem === 'New Bill' && <NewBillContainer userData={userData} />}
          {selectedMenuItem === 'Inter Company Transaction' && <InterCompanyTranfer userData={userData} />}
          {selectedMenuItem === 'Returns' && <BillDetails userData={userData} />}
          {selectedMenuItem === 'Salary Register' && <Salary />}
          {selectedMenuItem === 'Add Order' && <CustomerOrder />}
          {selectedMenuItem === 'View Order' && <OrderView />}
          {selectedMenuItem === 'Purchase Order' && <PurchaseOrderBook />}
          {selectedMenuItem === 'Cash Collection' && <UserCashCollection />}
          {selectedMenuItem === 'View Stock' && <FilterPage />}
          {selectedMenuItem === 'View Sales Report' && <FilterSalesPage />}
          {selectedMenuItem === 'Update Inventory' && <AddInventoryItem />}
        </main>
      </div>
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
};

export default MainComponent;
