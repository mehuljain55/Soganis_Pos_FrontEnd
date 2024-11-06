import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import './PurchaseOrderBook.css';

const PurchaseOrderBook = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [customOrder, setCustomOrder] = useState({
    description: '',
    size: '',
    color: '',
    quantity: 0,
    itemType: '',
    school: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setIsLoading(true);
    setError(null);
    const user = JSON.parse(sessionStorage.getItem('user'));
    const storeId = user?.storeId;

    if (storeId) {
      axios.get(`${API_BASE_URL}/user/view-order`, {
        params: { storeId: storeId }
      })
      .then(response => {
        setOrders(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setIsLoading(false);
      });
    } else {
      setError("Store ID not found in user data.");
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (index, value) => {
    const newOrders = [...orders];
    newOrders[index].quantity = value;
    setOrders(newOrders);
  };

  const handleDeleteOrder = (orderId) => {
    axios.post(`${API_BASE_URL}/inventory/order/delete_order`, null, { params: { orderId } })
      .then(response => {
        if (response.data === "Success") {
          setOrders(orders.filter(order => order.orderId !== orderId));
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
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user) {
      alert('User not found in session storage.');
      return;
    }
    const purchaseOrderModel = { purchaseOrderBookList: orders, user: user };
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

  const handleAddCustomOrder = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const storeId = user?.storeId;
    if (!storeId) {
      alert('Store ID not found in session storage.');
      return;
    }
    axios.post(`${API_BASE_URL}/user/purchase-order`, customOrder, {
      params: { storeId: storeId }
    })
    .then(response => {
      if (response.data === "Success") {
        alert('Custom order added successfully!');
        setIsPopupOpen(false);
        fetchOrders();
      }
    })
    .catch(error => {
      alert('Failed to add custom order: ' + error.message);
    });
  };

  const handleCustomOrderChange = (e) => {
    setCustomOrder({ ...customOrder, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="purchase-order-container">
        <h1 className="purchase-order-title">Purchase Order Book</h1>
      
        <table className="purchase-order-table">
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
                  <button onClick={() => handleDeleteOrder(order.orderId)} className="purchase-order-delete-button">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       
      </div>
     
      <div  className="purchase-order-action-btn">
      <button onClick={handleGenerateOrder} className="purchase-order-button">Generate Order</button>
      <button onClick={() => setIsPopupOpen(true)} className="purchase-order-button">Add Custom Order</button>
      </div>
      
      {isPopupOpen && (
        <div className="purchase-order-popup">
          
          <h2>Add Custom Order</h2>
          <input type="text" name="description" placeholder="Description" onChange={handleCustomOrderChange} />    
          <input type="text" name="size" placeholder="Size" onChange={handleCustomOrderChange} />
          <input type="text" name="color" placeholder="Color" onChange={handleCustomOrderChange} />
          <input type="number" name="quantity" placeholder="Quantity" onChange={handleCustomOrderChange} />
          <input type="text" name="itemType" placeholder="Item Type" onChange={handleCustomOrderChange} />
          <input type="text" name="school" placeholder="School" onChange={handleCustomOrderChange} />
        
          <div className="purchase-order-btn">
        
          <button onClick={handleAddCustomOrder}>Create Order</button>
         
 
          </div>
          <button onClick={() => setIsPopupOpen(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderBook;
