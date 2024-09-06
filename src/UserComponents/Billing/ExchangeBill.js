import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './NewBillContainer.css';
import { API_BASE_URL } from '../Config.js';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ExchangeBillModal from './ExchangeBillModal'; // Import the new modal component

const ExchangeBill = ({ userData }, {ExchangeAmount}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobileNo, setCustomerMobileNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [schoolName, setSchoolName] = useState('');
  
  const [isBarcodeMode, setIsBarcodeMode] = useState(false);
  const [barcode, setBarcode] = useState('');

  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const pdfModalRef = useRef(null);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItem, setCustomItem] = useState({
    itemBarcodeID: 'SG9999999',
    itemType: '',
    itemColor: '',
    itemSize: '',
    itemCategory: '',
    sellPrice: 0,
    quantity: 1,
    amount: 0,
  });


  useEffect(() => {
    if (!isBarcodeMode && searchTerm.trim() !== '') {
      const fetchItems = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/getAllItems?searchTerm=${searchTerm}`);
          if (response.data) {
            setSearchResults(response.data);
          } else {
            setSearchResults([]); // Set an empty array if data is null or undefined
          }
        } catch (error) {
          console.error('Error fetching items:', error);
          setSearchResults([]); // Optionally handle errors by setting an empty array
        }
      };
      fetchItems();
    }
  }, [searchTerm, isBarcodeMode]);

  const handleCustomItemChange = (e) => {
    const { name, value } = e.target;
    setCustomItem((prev) => ({
      ...prev,
      [name]: value,
      amount: name === 'quantity' || name === 'sellPrice' 
        ? customItem.sellPrice * customItem.quantity
        : prev.amount,
    }));
  };

  

  // Fetch item based on barcode (for barcode scanning)
  useEffect(() => {
    if (isBarcodeMode && barcode.trim() !== '') {
      const fetchItemByBarcode = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/search/item_code`, {
            params: { barcode: barcode.trim() },
          });
          if (response.data) {
            addItemToBill(response.data);
          } else {
            console.error('Item not found for barcode:', barcode);
          }
        } catch (error) {
          console.error('Error fetching item by barcode:', error);
        } finally {
          setBarcode('');
          barcodeInputRef.current.focus();
        }
      };
      fetchItemByBarcode();
    }
  }, [barcode, isBarcodeMode]);

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
  
    if (!isBarcodeMode) {
      setSearchTerm('');
      setDropdownOpen(false);
      searchInputRef.current.focus();
    }
  
    // Scroll to the latest item added
    setTimeout(() => {
      const tableBody = document.querySelector('.items-table tbody');
      if (tableBody) {
        const lastRow = tableBody.lastElementChild;
        if (lastRow) {
          lastRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    }, 100); // Delay to ensure the item is added to the DOM
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
      const response = await axios.post(`${API_BASE_URL}/billRequest`, billData, { responseType: 'arraybuffer' });
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setPdfData(pdfUrl);
      setShowPdfModal(true);

      setSelectedItems([]);
      // Clear customer details
      setCustomerName('');
      setCustomerMobileNo('');
      setPaymentMode('Cash');
      setSchoolName('');
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  };

  const handlePrint = () => {
    if (pdfModalRef.current) {
      pdfModalRef.current.focus();
      pdfModalRef.current.contentWindow.print();
    }
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    URL.revokeObjectURL(pdfData); // Clean up the object URL
    setPdfData(null);
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

  const handleAddCustomItem = () => {
    // Calculate amount
    const amount = customItem.sellPrice * customItem.quantity;
  
    // Create the new item object
    const newItem = {
      itemBarcodeID:customItem.itemBarcodeID,
      itemCode: customItem.itemBarcodeID,
      itemType: customItem.itemType,
      itemColor: customItem.itemColor,
      itemSize: customItem.itemSize,
      itemCategory: customItem.itemCategory,
      quantity: customItem.quantity,
      price:customItem.sellPrice,
      amount:(customItem.quantity)*(customItem.sellPrice),
    };
  
    // Update the selectedItems state
    setSelectedItems([...selectedItems, newItem]);
  
    // Close the modal
    setShowCustomItemModal(false);
  };
  

  const toggleBarcodeMode = () => {
    setIsBarcodeMode(!isBarcodeMode);
    setSearchTerm('');
    setDropdownOpen(false);
    setBarcode('');
    if (!isBarcodeMode) {
      // If switching to barcode mode, focus on barcode input
      setTimeout(() => {
        barcodeInputRef.current.focus();
      }, 100);
    } else {
      // If switching to manual mode, focus on search input
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  };

  return (
    <div className="new-bill-container">
   <div className="mode-toggle">
        <button onClick={toggleBarcodeMode}>
          {isBarcodeMode ? 'Barcode Mode' : 'Search Mode'}
        </button>
      </div>
      <h2>Billing</h2>

 

      {/* Search Bar or Barcode Input */}
      <div className="search-bar-container">
        {isBarcodeMode ? (
          <div className="barcode-input" ref={barcodeInputRef}>
            <label>
              Item Code (Barcode):
              <input
                type="text"
                placeholder="Scan or enter barcode and press Enter"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // The useEffect will handle fetching the item
                    e.preventDefault();
                  }
                }}
                autoFocus
              />
            </label>
          </div>
        ) : (
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
                    {searchResults.map((item, index) => (
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
                        <td>{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Details */}
      <div className="customer-details">
        <h5>Customer Details</h5>
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
            School Name:
            <input
              type="text"
              value={schoolName}
              onChange={handleSchoolNameChange}
              required
            />
          </label>
        </div>
      </div>

      {/* Billing Items Table */}
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
                  <td>{item.itemCode}</td>
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

              <tr>  <button onClick={() => setShowCustomItemModal(true)}>Add Custom Item</button></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="summary">
        <h3>Total Amount: {calculateTotalAmount().toFixed(2)} Rs</h3>
        <h4>Item Count: {selectedItems.length}</h4>
      </div>

      {/* Payment Mode */}
      <div className="payment-mode">
        <label>
          Payment Mode:
          <select value={paymentMode} onChange={handlePaymentModeChange}>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>
        </label>
      </div>
      <div className="submit-button">
        <button onClick={handleSubmit}>Submit</button>
      </div>
      <Modal show={showPdfModal} onHide={handleClosePdfModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bill PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfData && (
            <iframe
              ref={pdfModalRef}
              src={pdfData}
              width="100%"
              height="500px"
              title="Bill PDF"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePdfModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            Print
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCustomItemModal} onHide={() => setShowCustomItemModal(false)} className="custom-item-modal">
  <Modal.Header closeButton>
    <Modal.Title>Add Custom Item</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form>
      <div className="form-group">
        <label>Item Barcode ID:</label>
        <input
          type="text"
          name="itemBarcodeID"
          value={customItem.itemBarcodeID}
          onChange={handleCustomItemChange}
          readOnly
        />
      </div>
      <div className="form-group">
        <label>Item Type:</label>
        <input
          type="text"
          name="itemType"
          value={customItem.itemType}
          onChange={handleCustomItemChange}
        />
      </div>
      <div className="form-group">
        <label>Item Color:</label>
        <input
          type="text"
          name="itemColor"
          value={customItem.itemColor}
          onChange={handleCustomItemChange}
        />
      </div>
      <div className="form-group">
        <label>Item Size:</label>
        <input
          type="text"
          name="itemSize"
          value={customItem.itemSize}
          onChange={handleCustomItemChange}
        />
      </div>
      <div className="form-group">
        <label>Item Category:</label>
        <input
          type="text"
          name="itemCategory"
          value={customItem.itemCategory}
          onChange={handleCustomItemChange}
        />
      </div>
      <div className="form-group">
        <label>Price:</label>
        <input
          type="number"
          name="sellPrice"
          value={customItem.sellPrice}
          onChange={handleCustomItemChange}
        />
      </div>
      <div className="form-group">
        <label>Quantity:</label>
        <input
          type="number"
          name="quantity"
          value={customItem.quantity}
          onChange={handleCustomItemChange}
          min="1"
        />
      </div>
      <div className="form-group">
       
      </div>
    </form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowCustomItemModal(false)}>
      Close
    </Button>
    <Button variant="primary" onClick={handleAddCustomItem}>
      Add Item
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};

export default ExchangeBill;
