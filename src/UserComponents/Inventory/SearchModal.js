import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SearchModal.css'; // Updated CSS file
import { API_BASE_URL } from '../Config.js';

const SearchModal = ({ isOpen, onClose }) => {
  const [barcode, setBarcode] = useState('');
  const [items, setItems] = useState([]);
  const [orderedItems, setOrderedItems] = useState(new Set());
  const barcodeInputRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    if (isOpen && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleFocus = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        barcodeInputRef.current.focus();
      }
    };

    document.addEventListener('mousedown', handleFocus);
    return () => {
      document.removeEventListener('mousedown', handleFocus);
    };
  }, [items]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/search/item_code`, {
        params: { barcode }
      });

      const newItem = response.data;

      if (newItem && newItem.itemBarcodeID) {
        if (!items.find(item => item.itemBarcodeID === newItem.itemBarcodeID)) {
          setItems([...items, newItem]);
          setBarcode('');
        }
      } else {
        alert("Item not found");
      }
    } catch (error) {
      console.error('Error fetching item data:', error);
    }
  };

  const handleClear = () => {
    setBarcode('');
    setItems([]);
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePlaceOrder = async (barcodedId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/create_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ barcodedId }),
      });

      if (!response.ok) {
        console.error('Response Status:', response.status);
        console.error('Response Text:', await response.text());
        throw new Error('Failed to place order.');
      }

      const status = await response.text();
      setOrderedItems(prev => new Set(prev).add(barcodedId)); // Update state to mark item as ordered
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing the order.');
    }
  };

  const reset = () => {
    setBarcode('');
    setItems([]);
    setOrderedItems(new Set());
  };

  const handleModalClose = () => {
    reset();
    onClose();
  };

  return (
    isOpen ? (
      <div className="item-search-box-overlay" onClick={handleModalClose}>
        <div className="item-search-box-content" onClick={e => e.stopPropagation()}>
          <button className="close-button" onClick={handleModalClose}>×</button>
          <h2>Search Item</h2>
          <input
            ref={barcodeInputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter barcode"
          />
          <button onClick={handleSearch}>Search</button>
          <button className="clear-button" onClick={handleClear}>Clear</button>
          {items.length > 0 && (
            <div ref={tableRef}>
              <table>
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Type</th>
                    <th>School</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Retail Price</th>
                    <th>Wholesale Price</th>
                    <th>Stock Quantity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.itemCode}</td>
                      <td>{item.itemName}</td>
                      <td>{item.itemType}</td>
                      <td>{item.itemCategory}</td>
                      <td>{item.itemColor}</td>
                      <td>{item.itemSize}</td>
                      <td>{item.price}</td>
                      <td>{item.wholeSalePrice}</td>
                      <td>{item.quantity}</td>
                      <td>
                        {orderedItems.has(item.itemBarcodeID) ? (
                          <span className="order-placed">Order Placed</span>
                        ) : (
                          <button onClick={() => handlePlaceOrder(item.itemBarcodeID)}>Place Order</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button className="close-button" onClick={handleModalClose}>Close</button>
        </div>
      </div>
    ) : null
  );
};

export default SearchModal;
