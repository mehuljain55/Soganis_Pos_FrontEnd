import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faCloudUploadAlt ,faBars, faSignOutAlt, faRotateRight  } from '@fortawesome/free-solid-svg-icons';
import { useSwipeable } from 'react-swipeable';
import './MainComponent.css';

import NewBillContainer from '../Billing/NewBillContainer.js';
import InterCompanyTranfer from '../Billing/InterCompanyTranfer.js';
import BillDetails from '../Billing/BillDetails.js';
import BillViewer  from '../Billing/BillViewer.js';
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
import DailyTransactionForm from '../Transactions/DailyTransactionForm.js';
import Transaction from '../Transactions/Transaction.js';

const MainComponent = ({ userData }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('Dashboard');
  const [todayCashCollection, setTodayCashCollection] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [storeName,setStoreName]=useState('');
  const [showConfirm, setShowConfirm] = useState(false);

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

  useEffect(() => {
      fetchTodayCashCollection();
      const intervalId = setInterval(() => {
      fetchTodayCashCollection();
      }, 15000);

      return () => clearInterval(intervalId);
  }, []);

  const handleBackup = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/backup`);
      alert(response.data);
    } catch (error) {
      console.error("Error creating backup:", error);
    }
  };

const reboot = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/server/restart`);
    // Reload the page correctly
    alert(response.data);
    window.location.reload();
  } catch (error) {
    console.error("Error restarting service:", error);
  }
};


  const handleMenuItemClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setIsSidebarOpen(false); 
    
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
    <div className="dashboard-container-fluid" {...swipeHandlers}>
      <div className="dashboard-top-bar">
        <h1 className="dashboard-brand-heading" onClick={handleHeadingClick} style={{ cursor: 'pointer' }}>
          {storeName}
        </h1>
        {userData && (
          <div className="dashboard-user-info">
            <span>User: {userData.sname}</span>
            <span>Shop: {userData.storeId}</span>
            <span className="dashboard-cash-collection">
              <span>Cash Collection: {todayCashCollection}</span>
              <button className="dashboard-refresh-button" onClick={fetchTodayCashCollection}>
                <FontAwesomeIcon icon={faSyncAlt} />
              </button>
            </span>
           
              <button className="dashboard-logout-button" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
      
              <button className="dashboard-backup-button" onClick={handleBackup}>
              <FontAwesomeIcon icon={faCloudUploadAlt} className="backup-icon" /> Backup
              </button>

              {/* <button className="dashboard-reload-button" onClick={() => setShowConfirm(true)}>
              <FontAwesomeIcon icon={faRotateRight} className="reload-icon" />
              Restart Server
              </button> */}



          </div>
        )}
        <button className="dashboard-menu-toggle" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
  
      <div className={`dashboard-main-content-wrapper ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="dashboard-list-group">
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('New Bill')}>New Bill</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('Returns')}>Return/Exchange</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('Inter Company Transaction')}>Inter Company</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('Recent Bills')}>Recent Bills</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('Customer Due List')}>Customer Due List</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('Daily Cash')}>Daily Cash</button>
        
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('Add Order')}>Customer Order Book</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('View Order')}>View Order Book</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('View Stock')}>View Stock</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('Purchase Order')}>Purchase Order</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('Cash Collection')}>Cash Collection</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('View Sales Report')}>Sale Report</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('School Sales')}>School Report</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('Salary Register')}>Salary Register</button>
            <button className="dashboard-list-group-item" onClick={() => navigate('/barcode')}>Open Barcode</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('Update Inventory')}>Add Inventory(Qty)</button>
            <button className="dashboard-list-group-item" onClick={() => handleMenuItemClick('Add New Item')}>Update Item List</button>
        
          </div>
        </div>
  
        <main className="dashboard-main-content">
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
          {selectedMenuItem === 'Recent Bills' && <BillViewer />}
          {selectedMenuItem === 'Customer Due List' && <CustomerDueList />}
          {selectedMenuItem === 'Daily Cash' && <Transaction />}
          
        </main>

        
      </div>
  
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

 {showConfirm && (
  <div className="custom-confirm-overlay">
    <div className="custom-confirm-dialog">
      
      {/* Header */}
      <div className="custom-confirm-header">
        <div className="custom-confirm-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h3 className="custom-confirm-title">Confirm Server Restart</h3>
      </div>

      {/* Body */}
      <div className="custom-confirm-content">
        <p className="custom-confirm-message">
          Are you sure you want to restart the server? This action may cause temporary service interruption.
        </p>
      </div>

      {/* Footer */}
      <div className="custom-confirm-actions">
        <button
          className="custom-btn custom-btn-cancel"
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </button>
        <button
          className="custom-btn custom-btn-danger"
          onClick={reboot}
        >
          Restart
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default MainComponent;