import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewBillContainer from './NewBillContainer'; // Import NewBillContainer

const MainComponent = ({ userData }) => {
  const [itemList, setItemList] = useState([]);

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

  return (
    <div className="container">
      <h2>Main Component</h2>
      {userData && (
        <div>
          <p>User ID: {userData.userId}</p>
          <p>Name: {userData.name}</p> {/* Corrected to userData.name */}
          <p>Mobile Number: {userData.mobile_no}</p>
        </div>
      )}

      {/* Pass itemList to NewBillContainer */}
      <NewBillContainer itemList={itemList} />
    </div>
  );
};

export default MainComponent;
