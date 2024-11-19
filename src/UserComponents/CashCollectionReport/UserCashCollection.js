import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import './UserCashCollection.css';

const UserCashCollection = () => {
  const [userCashCollection, setUserCashCollection] = useState([]);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchUserCashCollection = async () => {
    try {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const storeId = userData?.storeId;

      if (storeId && startDate && endDate) {
        const response = await axios.get(`${API_BASE_URL}/user/getUserCashCollection`, {
          params: { storeId, startDate, endDate },
        });
        setUserCashCollection(response.data);
        console.log(response.data);  // Log the fetched data here
      } else {
        console.error('Store ID, start date, or end date not found');
      }
    } catch (err) {
      setError(err);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

 

  const calculateTotal = (key) => {
    return userCashCollection.reduce((total, item) => total + (item[key] || 0), 0).toFixed(2);
  };
  const handleFetchClick = () => {
    if (startDate && endDate) {
      setUserCashCollection([]); // Clear data before new fetch
      setError(null);
      fetchUserCashCollection(); // Fetch data on button click
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="user-cash-collection">
      <h2>User Cash Collection</h2>
      <div className="date-selection">
        <label>Start Date: </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label>End Date: </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={handleFetchClick}>Fetch Data</button>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Collection Date</th>
              <th>User Name</th>
              <th>Cash Collection</th>
              <th>UPI Collection</th>
              <th>Card Collection</th>
              
              <th>Cash out</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {userCashCollection.map((item) => (
              <tr key={`${item.userId}-${item.collection_date}`}>
                <td>{item.userId}</td>
                <td>{formatDate(item.collection_date)}</td>
                <td>{item.userName}</td>
                <td>{item.cash_collection}</td>
                <td>{item.upi_collection}</td>
             
                <td>{item.card_collection}</td>
                <td>{item.cash_return}</td>
             
                <td>{item.final_cash_collection}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
           
              <td colSpan="3"><strong>Total</strong></td>
              <td><strong>{calculateTotal('cash_collection')}</strong></td>
              <td><strong>{calculateTotal('upi_collection')}</strong></td>
              <td><strong>{calculateTotal('card_collection')}</strong></td>
              <td><strong>{calculateTotal('cash_return')}</strong></td>
              <td><strong>{calculateTotal('final_cash_collection')}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default UserCashCollection;
