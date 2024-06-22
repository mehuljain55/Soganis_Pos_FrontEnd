import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewBillContainer from './NewBillContainer'; // Import NewBillContainer

const MainComponent = ({ userData }) => {
  const [itemList, setItemList] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(''); // State to manage selected menu item

  useEffect(() => {
    if (userData && itemList.length === 0) {
      fetchItems();
    }
  }, [userData, itemList]);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:8080/getAllItems');
      console.log('Items fetched:', response.data);
      setItemList(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      // Handle error if needed
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
        <h2>Main Component</h2>
        {userData && (
          <div>
            <p>User ID: {userData.userId}</p>
            <p>Name: {userData.name}</p> {/* Corrected to userData.name */}
            <p>Mobile Number: {userData.mobile_no}</p>
          </div>
        )}

        {/* Conditionally render components based on selectedMenuItem */}
        {selectedMenuItem === 'New Bill' && <NewBillContainer itemList={itemList} />}
        {selectedMenuItem === 'View Stock' && <p>View Stock Component</p>}
        {selectedMenuItem === 'Cash Collection' && <p>Cash Collection Component</p>}
        {selectedMenuItem === 'Today\'s Sale' && <p>Today's Sale Component</p>}
      </div>
    </div>
  );
};

export default MainComponent;
