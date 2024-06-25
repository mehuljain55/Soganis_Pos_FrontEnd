import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewBillContainer from './NewBillContainer'; // Import NewBillContainer
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import './MainComponent.css'; // Import the CSS file

const MainComponent = ({ userData }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState(''); 
  const [todayCashCollection, setTodayCashCollection] = useState(null); 

  const fetchTodayCashCollection = async () => {
    try {
      const response = await axios.get('http://localhost:8080/getTodayUserCashCollection', {
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
        <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
          <div className="sidebar-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => handleMenuItemClick('New Bill')}>New Bill</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => handleMenuItemClick('View Stock')}>View Stock</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => handleMenuItemClick('Cash Collection')}>Cash Collection</button>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={() => handleMenuItemClick('Today\'s Sale')}>Today's Sale</button>
              </li>
            </ul>
          </div>
        </nav>

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

          {/* Conditionally render components based on selectedMenuItem */}
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
