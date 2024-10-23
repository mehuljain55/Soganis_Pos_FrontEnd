import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SearchModal.css'; // Updated CSS file
import { API_BASE_URL } from '../Config.js';

const SearchModal = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([]);
  const [orderedItems, setOrderedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    const handleFocus = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target) && !searchInputRef.current.contains(event.target)) {
        searchInputRef.current.focus();
      }
    };

    document.addEventListener('mousedown', handleFocus);
    return () => {
      document.removeEventListener('mousedown', handleFocus);
    };
  }, [items]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const storeId = user ? user.storeId : '';

        const response = await axios.get(`${API_BASE_URL}/inventory/getAllItems`, {
          params: {
            searchTerm: searchTerm,
            storeId: storeId,
          }
        });
        setSearchResults(response.data || []); // Set search results or empty array
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching items:', error);
        setSearchResults([]);
      }
    };
    if (searchTerm.length > 0) {
      fetchItems();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

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

  const addItemToBill = (item) => {
    if (!items.find(existingItem => existingItem.itemBarcodeID === item.itemBarcodeID)) {
      setItems([...items, item]);
      setSearchTerm('');
      setDropdownOpen(false);
  
      // Ensure the input field is focused after adding an item
      requestAnimationFrame(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      });
    }
  };
  
  

  const handleArrowNavigation = (event) => {
    if (event.key === 'ArrowDown') {
      setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
    } else if (event.key === 'ArrowUp') {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      addItemToBill(searchResults[selectedIndex]);
    }
  };

  const handleKeyDown = (event, item) => {
    if (event.key === 'Enter') {
      addItemToBill(item);
    }
  };

  const reset = () => {
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
          <div className="search-bar" ref={searchInputRef} tabIndex="0">
            <input
              type="text"
              placeholder="Search by item code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setDropdownOpen(true)}
              onKeyDown={handleArrowNavigation}
            />
            {dropdownOpen && searchResults.length > 0 && (
              <div className="dropdown" ref={dropdownRef}>
                <table>
                  <thead>
                    <tr>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>Type</th>
                      <th>Color</th>
                      <th>Size</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((item, index) => (
                      <tr
                        key={item.id}
                        onClick={() => addItemToBill(item)}
                        onKeyDown={(e) => handleKeyDown(e, item)}
                        tabIndex="0"
                        style={{
                          backgroundColor: index === selectedIndex ? 'lightblue' : 'transparent'
                        }}
                      >
                        <td>{item.itemCode}</td>
                        <td>{item.itemName}</td>
                        <td>{item.itemType}</td>
                        <td>{item.itemColor}</td>
                        <td>{item.itemSize}</td>
                        <td>{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
