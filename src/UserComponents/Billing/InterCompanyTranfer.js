import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './NewBillContainer.css';
import { API_BASE_URL } from '../Config.js';

const InterCompanyTranfer = ({ userData }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobileNo, setCustomerMobileNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/getAllItems?searchTerm=${searchTerm}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, [searchTerm]);

  const handleKeyDown = (event, item) => {
    if (event.key === 'Enter') {
      addItemToBill(item);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addItemToBill = (item) => {
    const existingItemIndex = selectedItems.findIndex(
      (selectedItem) => selectedItem.itemBarcodeID === item.itemBarcodeID
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...selectedItems];
      const existingItem = updatedItems[existingItemIndex];
      existingItem.quantity += 1;
      existingItem.amount = existingItem.quantity * existingItem.wholeSalePrice;
      setSelectedItems(updatedItems);
    } else {
      const newItem = {
        ...item,
        quantity: 1,
        amount: item.wholeSalePrice * 1
      };
      setSelectedItems([...selectedItems, newItem]);
    }

    setSearchTerm('');
    setDropdownOpen(false);
    searchInputRef.current.focus();
  };

  const removeItemFromBill = (index) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: quantity,
      amount: quantity * updatedItems[index].wholeSalePrice
    };
    setSelectedItems(updatedItems);
  };

  const handleDropdownKeyEvents = (event) => {
    const items = dropdownRef.current.querySelectorAll('tr');
    const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);

    if (event.key === 'ArrowDown' && currentIndex < items.length - 1) {
      event.preventDefault();
      items[currentIndex + 1].focus();
    } else if (event.key === 'ArrowUp' && currentIndex > 0) {
      event.preventDefault();
      items[currentIndex - 1].focus();
    } else if (event.key === 'Escape') {
      setDropdownOpen(false);
      searchInputRef.current.focus();
    } else if (event.key === 'Enter' && currentIndex >= 0) {
      addItemToBill(searchResults[currentIndex]);
    }
  };

  useEffect(() => {
    if (dropdownOpen && searchResults.length > 0 && dropdownRef.current) {
      dropdownRef.current.firstChild.focus();
    }
  }, [dropdownOpen, searchResults]);

  const calculateTotalAmount = () => {
    let total = 0;
    selectedItems.forEach(item => {
      total += item.amount;
    });
    return total;
  };

  const handleSubmit = async () => {
    const billData = {
      userId: userData.userId,
      customerName: customerName,
      paymentMode: paymentMode,
      item_count: selectedItems.length,
      bill: selectedItems.map(item => ({
        itemBarcodeID: item.itemBarcodeID,
        itemType: item.itemType,
        itemColor: item.itemColor,
        itemSize: item.itemSize,
        itemCategory: item.itemCategory,
        sellPrice: item.wholeSalePrice,
        quantity: item.quantity,
        total_amount: item.amount
      }))
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/intercompany/billRequest`, billData);
      console.log('Bill generated:', response.data);

      setSelectedItems([]);
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  };

  const handleNameChange = (e) => {
    setCustomerName(e.target.value);
  };

  const handleMobileNoChange = (e) => {
    setCustomerMobileNo(e.target.value);
  };

  const handlePaymentModeChange = (e) => {
    setPaymentMode(e.target.value);
  };

  return (
    <div className="new-bill-container">
      <h2>Inter Company Transfer</h2>

      {/* Search bar */}
      <div className="search-bar" ref={searchInputRef} tabIndex="0">
        <input
          type="text"
          placeholder="Search by item code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={handleDropdownKeyEvents}
        />
        {dropdownOpen && (
          <div className="dropdown" ref={dropdownRef}>
            <table>
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => addItemToBill(item)}
                    onKeyDown={(e) => handleKeyDown(e, item)}
                    tabIndex="0"
                  >
                    <td>{item.itemCode}</td>
                    <td>{item.itemName}</td>
                    <td>{item.itemCategory}</td>
                    <td>{item.itemType}</td>
                    <td>{item.itemColor}</td>
                    <td>{item.itemSize}</td>
                    <td>{item.wholeSalePrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details */}
      <div className="customer-details">
        <h3>Customer Details</h3>
        <label>
          Customer Name:
          <input
            type="text"
            value={customerName}
            onChange={handleNameChange}
            placeholder="Enter customer name"
          />
        </label>
        <label>
          Customer Mobile No:
          <input
            type="text"
            value={customerMobileNo}
            onChange={handleMobileNoChange}
            placeholder="Enter customer mobile no"
          />
        </label>
        
      </div>

      {/* Billing items table */}
      <div className="items-table-container">
        <div className="items-table">
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Type</th>
                <th>Color</th>
                <th>Size</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.itemBarcodeID}</td>
                  <td>{item.itemType}</td>
                  <td>{item.itemColor}</td>
                  <td>{item.itemSize}</td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                      min="1"
                    />
                  </td>
                  <td>{item.amount.toFixed(2)}</td>
                  <td>
                    <button onClick={() => removeItemFromBill(index)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div><label>
          Payment Mode:
          <select value={paymentMode} onChange={handlePaymentModeChange}>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </label></div>
        <div className="total-amount">
          <strong>Total Amount:</strong> {calculateTotalAmount().toFixed(2)}
        </div>
      </div>

      {/* Submit button */}
      <button onClick={handleSubmit} className="generate-bill-button">Generate Bill</button>
    </div>
  );
};

export default InterCompanyTranfer;
