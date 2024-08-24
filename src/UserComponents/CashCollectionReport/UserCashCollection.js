// src/components/UserCashCollection.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';

const UserCashCollection = () => {
  const [userCashCollection, setUserCashCollection] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCashCollection = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/getUserCashCollection`);
        setUserCashCollection(response.data);
      } catch (err) {
        setError(err);
      }
    };

    fetchUserCashCollection();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const calculateTotalCashCollection = () => {
    return userCashCollection.reduce((total, item) => total + item.cash_collection, 0);
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>User Cash Collection</h2>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Collection Date</th>
            <th>User Name</th>
            <th>Cash Collection</th>
          </tr>
        </thead>
        <tbody>
          {userCashCollection.map((item) => (
            <tr key={`${item.userId}-${item.collection_date}`}>
              <td>{item.userId}</td>
              <td>{formatDate(item.collection_date)}</td>
              <td>{item.userName}</td>
              <td>{item.cash_collection}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3"><strong>Today's Total Sale</strong></td>
            <td><strong>{calculateTotalCashCollection()}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default UserCashCollection;
