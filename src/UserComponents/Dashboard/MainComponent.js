import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faBars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useSwipeable } from 'react-swipeable';
import './MainComponent.css';

import NewBillContainer from '../Billing/NewBillContainer.js';
import InterCompanyTranfer from '../Billing/InterCompanyTranfer.js';
import BillDetails from '../Billing/BillDetails.js';
import BillViewer  from '../Billing/BillViewer .js';
import Salary from '../Salary/Salary.js';
import UserCashCollection from '../CashCollectionReport/UserCashCollection.js';
import FilterPage from '../Inventory/FilterPage.js';
import SearchModal from '../Inventory/SearchModal.js';
import FilterSalesPage from '../SalesReport/FilterSalesPage.js';
import CustomerOrder from '../OrderBook/CustomerOrder.js';
import OrderView from '../OrderBook/OrderView.js';
import PurchaseOrderBook from '../OrderBook/PurchaseOrderBook.js';
import AddInventoryItem from '../Inventory/AddInventoryItem.js';
import SchoolSalesReport from '../SalesReport/SchoolSalesReport.js';
import InventoryAdd from '../Inventory/InventoryAdd.js';
import { API_BASE_URL } from '../Config.js';
import { LogoutButton, useLogout } from '../Login/LogoutPage.js';
import ItemCodeFetcher from '../Billing/ItemCodeFetcher.js';
import CustomerDueList from '../Billing/CustomerDueList.js';
import Dashboard from './Dashboard.js';

const MainComponent = ({ userData }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('Dashboard');
  const [todayCashCollection, setTodayCashCollection] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
   const[storeName,setStoreName]=useState('');

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
    setIsSidebarOpen(false); // Close sidebar after menu selection on mobile
    
  };

  const fetchStore = async()=>{
    const store = await axios.get(`${API_BASE_URL}/store/getStoreName`, {
      params: { storeId: user.storeId }
    });
    setStoreName(store.data);
  }

  const handleHeadingClick = () => {
    handleMenuItemClick('Dashboard');
    setIsSidebarOpen(true);

  };

  useEffect(() => {
    fetchStore(); 
  }, []);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => setIsSidebarOpen(true),
    onSwipedLeft: () => setIsSidebarOpen(false),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div className="container-fluid" {...swipeHandlers}>
      <div className="top-bar">
      <h1 className="brand-heading" onClick={handleHeadingClick} style={{ cursor: 'pointer' }}>
        {storeName}
      </h1>
        {userData && (
          <div className="user-info">
            <span>User: {userData.sname}</span>
            <span>Shop: {userData.storeId}</span>
            <span className="cash-collection">
              <span>Cash Collection: {todayCashCollection}</span>
              <button className="refresh-button" onClick={fetchTodayCashCollection}>
                <FontAwesomeIcon icon={faSyncAlt} />
              </button>
            </span>
            <button className="logout-button" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        )}
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <div className={`main-content-wrapper ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="list-group">
            <button className="list-group-item" onClick={() => handleMenuItemClick('New Bill')}>New Bill</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('Returns')}>Return/Exchange</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('Inter Company Transaction')}>Inter Company</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('Recent Bills')}>Recent Bills</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('Customer Due List')}>Customer Due List</button>
    
            <button className="list-group-item" onClick={() => handleMenuItemClick('Add Order')}>Customer Order Book</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('View Order')}>View Order Book</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('View Stock')}>View Stock</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('Purchase Order')}>Purchase Order</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('Cash Collection')}>Cash Collection</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('View Sales Report')}>Sale Report</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('School Sales')}>School Report</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('Salary Register')}>Salary Register</button>
            <button className="list-group-item" onClick={() => navigate('/barcode')}>Open Barcode</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('Update Inventory')}>Add Inventory(Qty)</button>
            <button className="list-group-item" onClick={() => handleMenuItemClick('Add New Item')}>Update Item List</button>
            </div>
        </div>

        <main className="main-content">
          {selectedMenuItem === 'Dashboard' && <Dashboard />}
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
          {selectedMenuItem === 'School Sales' && <SchoolSalesReport />}
          {selectedMenuItem === 'Update Inventory' && <AddInventoryItem />}
          {selectedMenuItem === 'Add New Item' && <InventoryAdd />}
          {selectedMenuItem === 'Recent Bills' && <BillViewer  />}
          {selectedMenuItem === 'Customer Due List' && <CustomerDueList  />}

        </main>
      </div>

      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  );
};

export default MainComponent;