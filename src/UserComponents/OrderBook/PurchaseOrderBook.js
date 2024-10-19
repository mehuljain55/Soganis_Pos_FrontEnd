import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import './PurchaseOrderBook.css'; // Import custom CSS for styling


const PurchaseOrderBook = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the order list data from the API
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const user = JSON.parse(localStorage.getItem('user'));
    const storeId = user?.storeId; // Retrieve storeId from localStorage

    if (storeId) {
      axios.get(`${API_BASE_URL}/user/view-order`, {
        params: {
          storeId: storeId // Pass storeId as a query parameter
        }
      })
      .then(response => {
        setOrders(response.data); // Set the fetched orders to the state
        setIsLoading(false); // Loading is done
      })
      .catch(error => {
        setError(error.message); // Set error state if the request fails
        setIsLoading(false); // Stop loading if there is an error
      });
    } else {
      setError("Store ID not found in user data.");
      setIsLoading(false);
    }
  }, []);



  const fetchOrders = () => {
    setIsLoading(true);
    setError(null);

    const user = JSON.parse(localStorage.getItem('user'));
    const storeId = user?.storeId; // Retrieve storeId from localStorage

    if (storeId) {
        axios.get(`${API_BASE_URL}/user/view-order`, {
            params: {
                storeId: storeId // Pass storeId as a query parameter
            }
        })
        .then(response => {
            setOrders(response.data); // Set the orders from the response
            console.log("Order");
            console.log(orders);
            setIsLoading(false);
        })
        .catch(error => {
            setError(error.message);
            setIsLoading(false);
        });
    } else {
        console.error("storeId not found in user data.");
        setError("Store ID not found.");
        setIsLoading(false);
    }
};


  // Handle quantity change
  const handleQuantityChange = (index, value) => {
    const newOrders = [...orders];
    newOrders[index].quantity = value;
    setOrders(newOrders);
  };

  
  const handleDeleteOrder = (orderId) => {
    axios.post(`${API_BASE_URL}/inventory/order/delete_order`, null, { params: { orderId } })
      .then(response => {
        if (response.data === "Success") {
          setOrders(orders.filter(order => order.orderId !== orderId)); // Remove the deleted order from the list
          fetchOrders();
        }
      })
      .catch(error => {
        alert('Failed to delete order: ' + error.message);
      });
  };

  const handleGenerateOrder = () => {
    if (orders.length === 0) {
      alert('No orders to generate.');
      return;
    }
  
    // Fetch user from local storage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('User not found in local storage.');
      return;
    }
  
    // Prepare order data including user information
    const purchaseOrderModel = {
      purchaseOrderBookList: orders, // Assuming `orders` contains the purchase order books
      user: user // Attach user fetched from local storage
    };
  
    axios.post(`${API_BASE_URL}/inventory/generate_order`, purchaseOrderModel, {
      responseType: 'blob' 
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'order.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      fetchOrders();
      alert('Order generated and downloaded successfully!');
    })
    .catch(error => {
      alert('Failed to generate order: ' + error.message);
    });
  };
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (

    <div>
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
            <th>Action</th>
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
              <td>
                  <button 
                    onClick={() => handleDeleteOrder(order.orderId)} 
                    className="delete-order-button">
                    Delete
                  </button> {/* Delete button */}
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <button onClick={handleGenerateOrder} className="generate-order-button">Generate Order</button>
    
    </div>
  );
};

export default PurchaseOrderBook;
