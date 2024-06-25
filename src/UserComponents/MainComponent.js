import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewBillContainer from './NewBillContainer'; // Import NewBillContainer
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import './MainComponent.css'; // Import MainComponent specific CSS
import Sidebar from './Sidebar'; // Import Sidebar component
import { API_BASE_URL } from './Config.js';

const MainComponent = ({ userData }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [todayCashCollection, setTodayCashCollection] = useState(null);

  const fetchTodayCashCollection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getTodayUserCashCollection`, {
        params: { userId: userData.userId }
      });
      console.log('Today\'s cash collection:', response.data);
      setTodayCashCollection(response.data);
    } catch (error) {
      console.error('Error fetching today\'s cash collection:', error);
      setTodayCashCollection(null); // Reset today's cash collection on error
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
      <div className="row">
        <Sidebar handleMenuItemClick={handleMenuItemClick} />
        
        <main className="col-md-9 ml-sm-auto col-lg-10 px-md-4 main-content">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Soganis Billing</h1>
          </div>
          {userData && (
            <div className="mb-4">
              <h4>User: {userData.sname}</h4>
              <p>Today Cash Collection: {todayCashCollection}
                <button className="btn btn-outline-secondary ml-2" onClick={fetchTodayCashCollection}>
                  <FontAwesomeIcon icon={faSyncAlt} />
                </button>
              </p>
            </div>
          )}

          {/* Render different components based on selected menu item */}
          {selectedMenuItem === 'New Bill' && <NewBillContainer userData={userData} />}
          {selectedMenuItem === 'View Stock' && <p>View Stock Component</p>}
          {selectedMenuItem === 'Cash Collection' && <p>Cash Collection Component</p>}
          {selectedMenuItem === 'Today\'s Sale' && <p>Today's Sale Component</p>}
        </main>
      </div>
    </div>
  );
};

export default MainComponent;
