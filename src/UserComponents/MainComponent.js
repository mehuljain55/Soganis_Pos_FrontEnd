import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewBillContainer from './NewBillContainer'; // Import NewBillContainer
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';


const MainComponent = ({ userData }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState(''); // State to manage selected menu item
  const [todayCashCollection, setTodayCashCollection] = useState(null); // State to store today's cash collection


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

  return (
    <div className="container">
      <div className="sidebar">
        <button onClick={() => handleMenuItemClick('New Bill')}>New Bill</button>
        <button onClick={() => handleMenuItemClick('View Stock')}>View Stock</button>
        <button onClick={() => handleMenuItemClick('Cash Collection')}>Cash Collection</button>
        <button onClick={() => handleMenuItemClick('Today\'s Sale')}>Today's Sale</button>
      </div>
      
      <div className="content">
        <h2>Soganis Billing</h2>
        {userData && (
          <div>
            <p>User: {userData.sname}</p> {/* Corrected to userData.name */}
            <p> Today Cash Collection: {todayCashCollection} 
            <button className="btn btn-outline-secondary refresh-button" onClick={fetchTodayCashCollection}>
            <FontAwesomeIcon icon={faSyncAlt} className="text-black" />  
            </button>
            </p>
            

          </div>
        )}

        {/* Conditionally render components based on selectedMenuItem */}
        {selectedMenuItem === 'New Bill' && <NewBillContainer  userData={userData} />}
        {selectedMenuItem === 'View Stock' && <p>View Stock Component</p>}
        {selectedMenuItem === 'Cash Collection' && <p>Cash Collection Component</p>}
        {selectedMenuItem === 'Today\'s Sale' && <p>Today's Sale Component</p>}
      </div>
    </div>
  );
};

export default MainComponent;
