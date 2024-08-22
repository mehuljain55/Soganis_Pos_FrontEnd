import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './Config.js';
import './PurchaseOrderBook.css'; // Import custom CSS for styling


const PurchaseOrderBook = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the order list data from the API
  useEffect(() => {
    axios.get(`${API_BASE_URL}/view-order`)
      .then(response => {
        setOrders(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  // Handle quantity change
  const handleQuantityChange = (index, value) => {
    const newOrders = [...orders];
    newOrders[index].quantity = value;
    setOrders(newOrders);
  };

  // Handle generate order
  const handleGenerateOrder = () => {
    axios.post(`${API_BASE_URL}/generate_order`, orders)
      .then(response => {
        alert('Order generated successfully!');
      })
      .catch(error => {
        alert('Failed to generate order: ' + error.message);
      });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="purchase-order-book-container">
      <h1>Purchase Order Book</h1>
      <table className="purchase-order-book-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Description</th>
            <th>Size</th>
            <th>Current Stock</th>
            <th>Quantity</th>
            <th>Item Type</th>
            <th>School</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{order.description}</td>
              <td>{order.size}</td>
              <td>{order.currentStock}</td>
              <td>
                <input
                  type="number"
                  value={order.quantity}
                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                />
              </td>
              <td>{order.itemType}</td>
              <td>{order.school}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleGenerateOrder} className="generate-order-button">Generate Order</button>
    </div>
  );
};

export default PurchaseOrderBook;
