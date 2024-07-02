import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './NewBillContainer.css'; 
import { API_BASE_URL } from './Config.js';

const NewBillContainer = ({ userData }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobileNo, setCustomerMobileNo] = useState('');
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

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
    const newItem = {
      ...item,
      quantity: 1, // Initial quantity set to 1
      amount: item.price * 1 // Initial amount based on price and quantity
    };
    setSelectedItems([...selectedItems, newItem]);
    setSearchTerm('');
    setDropdownOpen(false);
    searchInputRef.current.focus(); // Focus back on the search input after selecting an item
  };

  // Remove item from selectedItems
  const removeItemFromBill = (index) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
  };

  // Handle quantity change
  const handleQuantityChange = (index, quantity) => {
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: quantity,
      amount: quantity * updatedItems[index].price // Calculate amount based on quantity and price
    };
    setSelectedItems(updatedItems);
  };

  // Handle key events for dropdown navigation
  const handleDropdownKeyEvents = (event) => {
    const items = dropdownRef.current.querySelectorAll('tr');
    const currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
  
    if (event.key === 'ArrowDown' && currentIndex < items.length - 1) {
      event.preventDefault(); // Prevent page scrolling
      items[currentIndex + 1].focus();
    } else if (event.key === 'ArrowUp' && currentIndex > 0) {
      event.preventDefault(); // Prevent page scrolling
      items[currentIndex - 1].focus();
    } else if (event.key === 'Escape') {
      setDropdownOpen(false);
      searchInputRef.current.focus(); // Focus back on the search input on escape
    } else if (event.key === 'Enter' && currentIndex >= 0) {
      addItemToBill(searchResults[currentIndex]); 
    }
  };

  useEffect(() => {
    if (dropdownOpen && searchResults.length > 0 && dropdownRef.current) {
      dropdownRef.current.firstChild.focus();
    }
  }, [dropdownOpen, searchResults]);

  // Calculate total amount
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
      customerMobileNo: customerMobileNo,
      item_count: selectedItems.length,
      bill: selectedItems.map(item => ({
        itemBarcodeID: item.itemBarcodeID,
        itemType: item.itemType,
        itemColor: item.itemColor,
        itemSize: item.itemSize,
        itemCategory: item.itemCategory,
        sellPrice: item.price,
        quantity: item.quantity,
        total_amount: item.amount
      }))
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/billRequest`, billData);
      console.log('Bill generated:', response.data);

      setSelectedItems([]);
      closeModal();
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  };

  
  const openModal = () => {
    modalRef.current.style.display = 'block';
  };

  const closeModal = () => {
    modalRef.current.style.display = 'none';
    setCustomerName('');
    setCustomerMobileNo('');
  };

 
  const handleNameChange = (e) => {
    setCustomerName(e.target.value);
  };

  const handleMobileNoChange = (e) => {
    setCustomerMobileNo(e.target.value);
  };

  return (
    <div>
      <h2>New Bill Container</h2>

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
                  <th>Category</th>
                  <th>Type</th>
                  <th>Color</th>
                  <th>Size</th>
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
                    <td>{item.itemCategory}</td>
                    <td>{item.itemType}</td>
                    <td>{item.itemColor}</td>
                    <td>{item.itemSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Billing items table */}
      <table>
        <thead>
          <tr>
            <th>Barcode ID</th>
            <th>Item Code</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {selectedItems.map((item, index) => (
            <tr key={index}>
              <td>{item.itemBarcodeID}</td>
              <td>{item.itemCode}</td>
              <td>{`${item.itemCategory} ${item.itemType} ${item.itemSize}`}</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                />
              </td>
              <td>{item.price}</td>
              <td>{item.amount}</td>
              <td>
                <button onClick={() => removeItemFromBill(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5" style={{ textAlign: 'right' }}>Total:</td>
            <td>{calculateTotalAmount()}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      {/* Modal for customer details */}
      <div ref={modalRef} className="modal">
        <div className="modal-content">
          <div className="customer-detail">
            <h5>Customer Details</h5>
            <span className="close" onClick={closeModal}>&times;</span>
          </div>
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            className='customer-detail'
            onChange={handleNameChange}
          />
          <input
            type="text"
            placeholder="Customer Mobile No"
            value={customerMobileNo}
            className='customer-detail'
            onChange={handleMobileNoChange}
          />
          <button onClick={handleSubmit}>Generate and Print</button>
        </div>
      </div>

      {/* Button to open modal */}
      <button onClick={openModal}>Bill</button>
    </div>
  );
};

export default NewBillContainer;
