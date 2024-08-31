import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './NewBillContainer.css';
import { API_BASE_URL } from '../Config.js';

const NewBillContainer = ({ userData }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobileNo, setCustomerMobileNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [schoolName, setSchoolName] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('search'); // State to handle mode

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (mode === 'search' && searchTerm) {
      const fetchItems = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/getAllItems?searchTerm=${searchTerm}`);
          setSearchResults(response.data);
        } catch (error) {
          console.error('Error fetching items:', error);
        }
      };
      fetchItems();
    }
  }, [searchTerm, mode]);

  const handleKeyDown = async (event) => {
    if (mode === 'barcode' && event.key === 'Enter') {
      event.preventDefault();
      try {
        const response = await axios.get(`${API_BASE_URL}/search/item_code?barcode=${searchTerm}`);
        if (response.data) {
          addItemToBill(response.data);
        }
      } catch (error) {
        console.error('Error fetching item by barcode:', error);
      }
      setSearchTerm('');
    }
  };

  const handleKey = (event, item) => {
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
      existingItem.amount = existingItem.quantity * existingItem.price;
      setSelectedItems(updatedItems);
    } else {
      const newItem = {
        ...item,
        quantity: 1,
        amount: item.price * 1,
      };
      setSelectedItems([...selectedItems, newItem]);
    }
  
    setSearchTerm('');
    setDropdownOpen(false);
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
      amount: quantity * updatedItems[index].price,
    };
    setSelectedItems(updatedItems);
  };

  const handleDropdownKeyEvents = (event) => {
    const items = dropdownRef.current.querySelectorAll('tr');
    const currentIndex = Array.from(items).findIndex((item) => item === document.activeElement);

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

  // Focus input field on mode change and when item is added
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mode, selectedItems]);

  useEffect(() => {
    if (dropdownOpen && searchResults.length > 0 && dropdownRef.current) {
      dropdownRef.current.firstChild.focus();
    }
  }, [dropdownOpen, searchResults]);

  const calculateTotalAmount = () => {
    let total = 0;
    selectedItems.forEach((item) => {
      total += item.amount;
    });
    return total;
  };

  const handleSubmit = async () => {
    const billData = {
      userId: userData.userId,
      customerName: customerName,
      customerMobileNo: customerMobileNo,
      paymentMode: paymentMode,
      schoolName: schoolName,
      item_count: selectedItems.length,
      bill: selectedItems.map((item) => ({
        itemBarcodeID: item.itemBarcodeID,
        itemType: item.itemType,
        itemColor: item.itemColor,
        itemSize: item.itemSize,
        itemCategory: item.itemCategory,
        sellPrice: item.price,
        quantity: item.quantity,
        total_amount: item.amount,
      })),
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/billRequest`, billData);
      console.log('Bill generated:', response.data);

      // Clear form data
      setSelectedItems([]);
      setCustomerName('');
      setCustomerMobileNo('');
      setPaymentMode('Cash');

      // Set the PDF URL and show the modal
      setPdfUrl(response.data.pdfUrl); // Assuming pdfUrl is the path to the generated PDF
      setShowModal(true);
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  };

  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = pdfUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    document.body.removeChild(iframe);
  };

  const closeModal = () => {
    setShowModal(false);
    setPdfUrl('');
  };

  const handleNameChange = (e) => {
    setCustomerName(e.target.value);
  };

  const handleSchoolNameChange = (e) => {
    setSchoolName(e.target.value);
  };

  const handleMobileNoChange = (e) => {
    setCustomerMobileNo(e.target.value);
  };

  const handlePaymentModeChange = (e) => {
    setPaymentMode(e.target.value);
  };

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'search' ? 'barcode' : 'search'));
    setSearchTerm('');
  };


  return (
    <div className="new-bill-container">
      <h2>Billing</h2>

      <button onClick={toggleMode}>
        Switch to {mode === 'search' ? 'Barcode Scanner' : 'Search'} Mode
      </button>

      {/* Search bar or barcode scanner input */}
      <div className="search-bar">
        <input
          type="text"
          placeholder={mode === 'search' ? 'Search by item code' : 'Scan barcode'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setDropdownOpen(mode === 'search')}
          onKeyDown={mode === 'barcode' ? handleKeyDown : handleDropdownKeyEvents}
          ref={searchInputRef}  // Ensure the ref is correctly attached
          autoFocus  // Automatically focus on render
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
                {searchResults.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => addItemToBill(item)}
                    onKeyDown={(e) => handleKey(e, item)}
                    tabIndex="0"
                  >
                    <td>{item.itemCode}</td>
                    <td>{item.itemName}</td>
                    <td>{item.itemCategory}</td>
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

      <div className="customer-details">
        <h2>Customer Details</h2>
        <div className="customer-details-box">
          
        <label>
          Customer Name:
          <input
            type="text"
            value={customerName}
            onChange={handleNameChange}
            required
          />
        </label>
        <label>
          Customer Mobile No:
          <input
            type="text"
            value={customerMobileNo}
            onChange={handleMobileNoChange}
            required
          />
        </label>

        <label>
          School Name
          <input
            type="text"
            value={schoolName}
            onChange={handleSchoolNameChange}
            required
          />
        </label>
        </div>
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
                      onChange={(e) =>
                        handleQuantityChange(index, parseInt(e.target.value, 10))
                      }
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
      </div>

      {/* Total amount */}
      <div className="summary">
        <h3>Total Amount: ${calculateTotalAmount().toFixed(2)}</h3>
        <h4>Item Count: {selectedItems.length}</h4>
      </div>

     <div>      <label>
          Payment Mode:
          <select value={paymentMode} onChange={handlePaymentModeChange}>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </label>
        </div>

        <button onClick={handleSubmit}>Submit</button>
     
    </div>
  );
};

export default NewBillContainer;
