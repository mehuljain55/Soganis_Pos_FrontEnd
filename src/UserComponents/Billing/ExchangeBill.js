import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ExchangeBill.css';
import { API_BASE_URL } from '../Config.js';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Select from 'react-select'; // Import Select
import BillPopup from './BillPopup'; // Import the popup component
import printJS from "print-js";


const ExchangeBill = ({ userData,itemsToExchange=[], exchangeAmount,billNo, schoolNameBill,onClose }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobileNo, setCustomerMobileNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [schoolName, setSchoolName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [shiftPressTime, setShiftPressTime] = useState(null); 
  const [isBarcodeMode, setIsBarcodeMode] = useState(false);
  const [barcode, setBarcode] = useState('');
  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const pdfModalRef = useRef(null);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const inputRefs = useRef([]);
  const [isTableFocused, setIsTableFocused] = useState(false); 
  const [showPopup, setShowPopup] = useState(false);
  const [someState, setSomeState] = useState(false); 
  const [allSchools, setAllSchools] = useState([]);
  const selectedSchoolRef = useRef(null); // Renamed to avoid collision

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

  const fetchAllSchools = async () => {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const storeId = user?.storeId;
        const response = await axios.get(`${API_BASE_URL}/user/filter/getSchoolNameandCode`, {
            params: {
                storeId: storeId,
            },
        });

        if (Array.isArray(response.data)) {
            const schoolOptions = response.data.map((school) => ({
                value: `${school.schoolName} (${school.schoolCode})`, // Combined for display
                label: `${school.schoolName} (${school.schoolCode})`, // Combined for display
                schoolName: school.schoolName, // Separate property for easy access
                schoolCode: school.schoolCode,
            }));
            setAllSchools(schoolOptions);
        } else {
            console.error('Expected an array of schools, but got:', response.data);
        }
    } catch (error) {
        console.error('Error fetching school names:', error);
    }
};

const handleSelectChange = (selectedOption) => {
  // Set only the school name without the code
  setSchoolName(selectedOption ? selectedOption.schoolName : '');
};


useEffect(() => {
  setSchoolName(schoolNameBill);  
}, []);


  useEffect(() => {
    fetchAllSchools();
  }, []);

 
  useEffect(() => {
    if (searchTerm.trim() !== '') {
      const fetchItems = async () => {
        try {
         
          const user = JSON.parse(sessionStorage.getItem("user"));
          const storeId = user ? user.storeId : '';
  
          // Make API call with searchTerm and storeId
          const response = await axios.get(`${API_BASE_URL}/inventory/getAllItems`, {
            params: {
              searchTerm: searchTerm,
              storeId: storeId, 
            }
          });
  
          setSearchResults(response.data || []); // Set search results or empty array
          setSelectedIndex(-1);
          setDropdownOpen(true);
        } catch (error) {
          console.error('Error fetching items:', error);
          setSearchResults([]);
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

  
  const handleSelectFocus = () => {
    setIsTableFocused(false); // Set table focus to false when Select is focused
  };

  const handleSelectBlur = () => {
    setIsTableFocused(true); // Set table focus back to true when Select is blurred
  }


  
  useEffect(() => {
    if (isBarcodeMode && barcode.trim() !== '') {
      const fetchItemByBarcode = async () => {
        try {
          const user = JSON.parse(sessionStorage.getItem('user'));
          const storeId = user?.storeId; // Retrieve storeId from user data
    
          const response = await axios.get(`${API_BASE_URL}/user/search/item_code`, {
            params: {
              barcode: barcode.trim(),
              storeId: storeId // Include storeId as a query parameter
            }
          });
          if (response.data) {
            addItemToBill(response.data);
          } else {
            console.error('Item not found for barcode:', barcode);
          }
        } catch (error) {
          console.error('Error fetching item by barcode:', error);
        } finally {
          setBarcode(''); // Clear barcode field
          barcodeInputRef.current.focus();
        }
      };
      fetchItemByBarcode();
    }
  }, [barcode, isBarcodeMode]);

  useEffect(() => {
    if (dropdownRef.current && selectedIndex >= 0) {
      const dropdown = dropdownRef.current;
      const items = dropdown.querySelectorAll('tr');
      if (items.length > 0) {
        const item = items[selectedIndex];
        const dropdownRect = dropdown.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const dropdownTop = dropdownRect.top;
        const dropdownBottom = dropdownRect.bottom;
        const itemTop = itemRect.top - dropdownTop;
        const itemBottom = itemRect.bottom - dropdownTop;
        const visibleHeight = 150;
        
        // Scroll the dropdown so the selected item is in view
        if (itemTop < 0) {
          // Item is above the visible area
          dropdown.scrollTop += itemTop - 15; // Adjust scrolling position to show the item
        } else if (itemBottom > visibleHeight) {
          // Item is below the visible area
          dropdown.scrollTop += itemBottom - visibleHeight + 15; // Adjust scrolling position to show the item
        }
      }
    }
  }, [selectedIndex]);
   
  const handleKeyDown = (event, item) => {
    if (event.key === 'Enter') {
      addItemToBill(item);
    }
  };

  const handlePopupConfirm = () => {
    setShowPopup(false);
    handleSubmit(); // Call handleSubmit when confirmed
  };

  const handlePopupCancel = () => {
    setShowPopup(false); // Close the popup without submitting
  };

  const handleItemTableKeyDown = (e, rowItemTableIndex, colItemTableIndex) => {
    if (!isTableFocused) return; // Only handle arrow keys when table is focused

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault(); // Prevent quantity field from changing on ArrowUp
        if (rowItemTableIndex > 0 && inputRefs.current[rowItemTableIndex - 1]?.[colItemTableIndex]) {
          inputRefs.current[rowItemTableIndex - 1][colItemTableIndex].focus();
        }
        break;
      case 'ArrowDown':
        e.preventDefault(); // Prevent quantity field from changing on ArrowDown
        if (rowItemTableIndex < selectedItems.length - 1 && inputRefs.current[rowItemTableIndex + 1]?.[colItemTableIndex]) {
          inputRefs.current[rowItemTableIndex + 1][colItemTableIndex].focus();
        }
        break;
      case 'ArrowLeft':
        if (colItemTableIndex > 0 && inputRefs.current[rowItemTableIndex]?.[colItemTableIndex - 1]) {
          inputRefs.current[rowItemTableIndex][colItemTableIndex - 1].focus();
        }
        break;
      case 'ArrowRight':
        if (colItemTableIndex < inputRefs.current[rowItemTableIndex]?.length - 1 && inputRefs.current[rowItemTableIndex]?.[colItemTableIndex + 1]) {
          inputRefs.current[rowItemTableIndex][colItemTableIndex + 1].focus();
        }
        break;
      default:
        break;
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
    setSearchResults([]);
    setDropdownOpen(false);
  
    if (!isBarcodeMode) {
     
      requestAnimationFrame(() => {
          searchInputRef.current.focus();
      });
  
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); 
        setShowPopup(true); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);



  
  
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

  const calculateTotalQuantity = () => {
    let total_quantity = 0;
    selectedItems.forEach((item) => {
      total_quantity=total_quantity+item.quantity;
    });
    
    return total_quantity;
  };


  const handleArrowNavigation = (e) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, searchResults.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      e.preventDefault();
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      addItemToBill(searchResults[selectedIndex]);
      e.preventDefault();
    }
  };

  const handleSubmit = async () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const storeId = user ? user.storeId : '';

    if (!schoolName) {
      alert("School Name is required")
      
      return; // Prevent API call if validation fails
  }


    const billData = {
      userId: user.userId,
      customerName: customerName,
      customerMobileNo: customerMobileNo,
      paymentMode: paymentMode,
      schoolName: schoolName,
      balanceAmount: exchangeAmount,
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
  
    const exchangeData = itemsToExchange.map((item) => ({
      sno: item.sno,
      barcodedId: item.barcodedId,
      price: item.price,
      return_quantity: item.return_quantity,
    }));

    const userData = JSON.parse(sessionStorage.getItem('user'));
  
    const requestData = {
      billNo:billNo,
      bill: billData,
      itemModel: exchangeData,
      user: userData,
    };
  
console.log(requestData);

    try {
      const response = await axios.post(`${API_BASE_URL}/user/exchange/billRequest`, requestData, {
        responseType: 'arraybuffer',
      });

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
  
      printJS({
        printable: pdfUrl,
        type: "pdf",
    
      });

      setSelectedItems([]);
      setCustomerName('');
      setCustomerMobileNo('');
      setPaymentMode('Cash');
      setSchoolName('');
      onClose();

    } catch (error) {
      console.error('Error generating bill:', error);
    }
  };
 
  const handlePrint = () => {
    if (pdfModalRef.current) {
      pdfModalRef.current.focus();
      pdfModalRef.current.contentWindow.print();
      onClose();
    }
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    URL.revokeObjectURL(pdfData); // Clean up the object URL
    setPdfData(null);
    onClose();
    
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

  useEffect(() => {
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();  // Automatically focus the input
    }
  }, []);

  const handleAddCustomItem = () => {
  
    // Create the new item object
    const newItem = {
      itemBarcodeID:customItem.itemBarcodeID,
      itemCode: customItem.itemBarcodeID,
      itemType: customItem.itemType,
      itemColor: customItem.itemColor,
      itemSize: customItem.itemSize,
      itemCategory: customItem.itemCategory,
      itemName: `${customItem.itemCategory} ${customItem.itemType}`,

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
    setIsBarcodeMode((prevMode) => {
      const newMode = !prevMode;

      // Use requestAnimationFrame to ensure the DOM updates before focusing
      if (newMode) {
        // Barcode mode - focus on the barcode input
        setTimeout(() => barcodeInputRef.current.focus(), 0);
      } else {
        // Search mode - focus on the search input
        setTimeout(() => searchInputRef.current.focus(), 0);
      }

      return newMode;
    });
  };

  const handleArrowKeyCustomerDetail = (e, fieldName) => {
    const fields = ['customerName', 'customerMobileNo', 'schoolName'];
    const currentIndex = fields.indexOf(fieldName);
  
    if (e.key === 'ArrowLeft') {
      // Move to the previous field if it exists
      if (currentIndex > 0) {
        document.querySelector(`[name=${fields[currentIndex - 1]}]`).focus();
      }
    } else if (e.key === 'ArrowRight') {
      // Move to the next field if it exists
      if (currentIndex < fields.length - 1) {
        document.querySelector(`[name=${fields[currentIndex + 1]}]`).focus();
      }
    }
  };
  
  useEffect(() => {
    if (showCustomItemModal) {
      setCustomItem({
        itemBarcodeID: 'SG9999999',
        itemType: '',
        itemColor: '',
        itemSize: '',
        itemCategory: '',
        sellPrice: 0,
        quantity: 1,
        amount: 0,
      });
    }
  }, [showCustomItemModal]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'c') {
        setShowCustomItemModal(true);  // Open the modal
        setSomeState(true);  // Simultaneously set a variable or state
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [someState]); // Dependency array with `someState`

  // Effect to listen for Shift key press and toggle mode
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Shift') {
        const currentTime = new Date().getTime(); // Get current time

        // Check if Shift was pressed twice within 500ms (or adjust as needed)
        if (shiftPressTime && currentTime - shiftPressTime < 500) {
          toggleBarcodeMode(); // Change mode if Shift is pressed twice quickly
          setShiftPressTime(null); // Reset the time
        } else {
          setShiftPressTime(currentTime); // Store the time of the first Shift press
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shiftPressTime]); // Track shiftPressTime changes



  return (
    <div className="new-bill-container">
   <div className="mode-toggle">
        <button onClick={toggleBarcodeMode}>
          {isBarcodeMode ? 'Barcode Mode' : 'Search Mode'}
        </button>
      </div>

      <div className="billing-container">
  <div className="billing-head">
    <h2>Exchange Bill</h2>
  </div>
  <div className="barcode-input">
      <input
        type="text"
        placeholder="Scan or enter barcode and press Enter"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        ref={barcodeInputRef}
        onFocus={() => setIsBarcodeMode(true)} // Focus switches to barcode mode
      />
   </div>
</div>

      <div className="search-bar-container">
      {/* Barcode input */}
      
      <div className="search-bar" tabIndex="0">
      <input
        type="text"
 
        placeholder="Search by item code"
        value={searchTerm}
        ref={searchInputRef} 
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={(e) => {
          setSearchTerm(e.target.value); // Ensure searchTerm is set on focus
          setDropdownOpen(true);
        }}
        onKeyDown={handleArrowNavigation}
      />
      {dropdownOpen && (
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
                  key={item.itemBarcodeID}
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
    </div>


      {/* Customer Details */}
      <div className="customer-details">
      <div className="credit-info">

     Credit Available: {exchangeAmount}
      </div>

      <div className="school-info">
        <label className="school-label"><b>School Name:</b></label>
        <Select
          options={allSchools}
          onFocus={handleSelectFocus}
          onBlur={handleSelectBlur}
          ref={selectedSchoolRef}
          value={allSchools.find((school) => school.schoolName === schoolName) || null}
          onChange={handleSelectChange}
          placeholder="Select a school"
          styles={{ control: (base) => ({ ...base, width: '250px' }) }}
          filterOption={(option, inputValue) => 
            option.data.schoolName.toLowerCase().includes(inputValue.toLowerCase()) || 
            option.data.schoolCode.toLowerCase().includes(inputValue.toLowerCase())
          }
        />
      </div>
    </div>




<div className="exchange-item-table">
      <h5>Exchange Items</h5>
      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Bill Type</th>
            <th>Item Type</th>
            <th>School</th>
            <th>Price</th>
            <th>Return Quantity</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {itemsToExchange.map((item, index) => (
            <tr key={index}>
              <td>{item.sno}</td>
              <td> {item.billCategory} </td>
              <td>{item.itemType}</td>
              <td> {item.itemCategory}</td>   
              <td>{item.price}</td>
              <td>{item.return_quantity}</td>
              <td>
              {item.return_quantity * item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Billing Items Table */}
      <div
      className="items-table-container"
      onFocus={() => setIsTableFocused(true)}   // Set table focus
      onBlur={() => setIsTableFocused(false)}  // Remove focus when out of table
      tabIndex={0}  // Make div focusable
    >
      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Color</th>
              <th>Size</th>
              <th>Price</th>
             
              <th>Quantity</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item, rowItemTableIndex) => (
              <tr key={rowItemTableIndex}>
                <td>{item.itemCode}</td>
                <td>{item.itemName}</td>
                <td>{item.itemColor}</td>
                <td>{item.itemSize}</td>
                <td>{item.price}</td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    ref={(el) => {
                      if (!inputRefs.current[rowItemTableIndex]) inputRefs.current[rowItemTableIndex] = [];
                      inputRefs.current[rowItemTableIndex][4] = el; // 4 corresponds to the "Quantity" column
                    }}
                    onChange={(e) =>
                      handleQuantityChange(rowItemTableIndex, parseInt(e.target.value, 10))
                    }
                    onKeyDown={(e) => {
                      handleItemTableKeyDown(e, rowItemTableIndex, 4); // Handle arrow keys for table navigation
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault(); // Prevent default behavior of incrementing/decrementing quantity
                      }
                    }}
                    min="1"
                    
                  />
                </td>
                <td>{item.amount.toFixed(2)}</td>
                <td>
                  <button onClick={() => removeItemFromBill(rowItemTableIndex)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
      {/* Summary */}
      <div className="summary">
  <div className="custom-btn">
    <button onClick={() => setShowCustomItemModal(true)}>Custom Item</button>
  </div>
  <div className="item-summary">
  <h3>Total Amount: {(calculateTotalAmount() - exchangeAmount).toFixed(2)} Rs</h3>
  <h4>Total Quantity: {calculateTotalQuantity()}</h4>
  
  </div>
  <div className="payment-section">
    <div className="payment-mode">
      <label>
        Payment Mode:
        <select value={paymentMode} onChange={handlePaymentModeChange}>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Upi">UPI</option>
        </select>
      </label>
      <button  id='submit-btn' onClick={handleSubmit}>Bill</button>
 
    </div>
    
  </div>
</div>



      {showPopup && (
        <BillPopup
          onConfirm={handlePopupConfirm}
          onCancel={handlePopupCancel}
        />
      )}

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
  <button  className="exchange-close-btn" onClick={() => setShowCustomItemModal(false)}>
  Close
</button>

    <Button variant="primary" onClick={handleAddCustomItem}>
      Add Item
    </Button>
  </Modal.Footer>
</Modal>

<button className="exchange-close-button" onClick={onClose}>Close</button>
    </div>
  );
};

export default ExchangeBill;
