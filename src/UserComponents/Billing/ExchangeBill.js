import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styles from './ExchangeBill.module.css';
import { API_BASE_URL } from '../Config.js';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import BillPopup from './BillPopup';
import printJS from "print-js";

const ExchangeBill = ({ userData, itemsToExchange = [], exchangeAmount, billNo, schoolNameBill, onClose }) => {
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
  const selectedSchoolRef = useRef(null);

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
          value: `${school.schoolName} (${school.schoolCode})`,
          label: `${school.schoolName} (${school.schoolCode})`,
          schoolName: school.schoolName,
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

          const response = await axios.get(`${API_BASE_URL}/inventory/getAllItems`, {
            params: {
              searchTerm: searchTerm,
              storeId: storeId,
            }
          });

          setSearchResults(response.data || []);
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
    setIsTableFocused(false);
  };

  const handleSelectBlur = () => {
    setIsTableFocused(true);
  }

  useEffect(() => {
    if (isBarcodeMode && barcode.trim() !== '') {
      const fetchItemByBarcode = async () => {
        try {
          const user = JSON.parse(sessionStorage.getItem('user'));
          const storeId = user?.storeId;

          const response = await axios.get(`${API_BASE_URL}/user/search/item_code`, {
            params: {
              barcode: barcode.trim(),
              storeId: storeId
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
          setBarcode('');
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

        if (itemTop < 0) {
          dropdown.scrollTop += itemTop - 15;
        } else if (itemBottom > visibleHeight) {
          dropdown.scrollTop += itemBottom - visibleHeight + 15;
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
    handleSubmit();
  };

  const handlePopupCancel = () => {
    setShowPopup(false);
  };

  const handleItemTableKeyDown = (e, rowItemTableIndex, colItemTableIndex) => {
    if (!isTableFocused) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (rowItemTableIndex > 0 && inputRefs.current[rowItemTableIndex - 1]?.[colItemTableIndex]) {
          inputRefs.current[rowItemTableIndex - 1][colItemTableIndex].focus();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
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

    setTimeout(() => {
      const tableBody = document.querySelector(`.${styles.itemsTable} tbody`);
      if (tableBody) {
        const lastRow = tableBody.lastElementChild;
        if (lastRow) {
          lastRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    }, 100);
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
      total_quantity = total_quantity + item.quantity;
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
      return;
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
      billNo: billNo,
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
    URL.revokeObjectURL(pdfData);
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
      searchInputRef.current.focus();
    }
  }, []);

  const handleAddCustomItem = () => {
    const newItem = {
      itemBarcodeID: customItem.itemBarcodeID,
      itemCode: customItem.itemBarcodeID,
      itemType: customItem.itemType,
      itemColor: customItem.itemColor,
      itemSize: customItem.itemSize,
      itemCategory: customItem.itemCategory,
      itemName: `${customItem.itemCategory} ${customItem.itemType}`,
      quantity: customItem.quantity,
      price: customItem.sellPrice,
      amount: (customItem.quantity) * (customItem.sellPrice),
    };

    setSelectedItems([...selectedItems, newItem]);
    setShowCustomItemModal(false);
  };

  const toggleBarcodeMode = () => {
    setIsBarcodeMode((prevMode) => {
      const newMode = !prevMode;

      if (newMode) {
        setTimeout(() => barcodeInputRef.current.focus(), 0);
      } else {
        setTimeout(() => searchInputRef.current.focus(), 0);
      }

      return newMode;
    });
  };

  const handleArrowKeyCustomerDetail = (e, fieldName) => {
    const fields = ['customerName', 'customerMobileNo', 'schoolName'];
    const currentIndex = fields.indexOf(fieldName);

    if (e.key === 'ArrowLeft') {
      if (currentIndex > 0) {
        document.querySelector(`[name=${fields[currentIndex - 1]}]`).focus();
      }
    } else if (e.key === 'ArrowRight') {
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
        setShowCustomItemModal(true);
        setSomeState(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [someState]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Shift') {
        const currentTime = new Date().getTime();

        if (shiftPressTime && currentTime - shiftPressTime < 500) {
          toggleBarcodeMode();
          setShiftPressTime(null);
        } else {
          setShiftPressTime(currentTime);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shiftPressTime]);

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: '300px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      '&:hover': {
        borderColor: '#3b82f6',
      },
      '&:focus-within': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.scrollableContent}>
        <div className={styles.header}>
          <div className={styles.modeToggle}>
            <button 
              className={`${styles.modeBtn} ${isBarcodeMode ? styles.barcodeModeActive : styles.searchModeActive}`}
              onClick={toggleBarcodeMode}
            >
              {isBarcodeMode ? '📱 Barcode Mode' : '🔍 Search Mode'}
            </button>
          </div>

          <div className={styles.titleSection}>
            <h1 className={styles.title}>Exchange Bill</h1>
          </div>

          <div className={styles.barcodeSection}>
            <input
              type="text"
              className={styles.barcodeInput}
              placeholder="Scan or enter barcode and press Enter"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              ref={barcodeInputRef}
              onFocus={() => setIsBarcodeMode(true)}
            />
          </div>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="🔍 Search by item code"
              value={searchTerm}
              ref={searchInputRef}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) => {
                setSearchTerm(e.target.value);
                setDropdownOpen(true);
              }}
              onKeyDown={handleArrowNavigation}
            />
            {dropdownOpen && searchResults.length > 0 && (
              <div className={styles.dropdown} ref={dropdownRef}>
                <table className={styles.dropdownTable}>
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
                        className={index === selectedIndex ? styles.selectedRow : ''}
                      >
                        <td>{item.itemCode}</td>
                        <td>{item.itemName}</td>
                        <td>{item.itemType}</td>
                        <td>{item.itemColor}</td>
                        <td>{item.itemSize}</td>
                        <td>₹{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.creditInfo}>
            <span className={styles.creditLabel}>Credit Available:</span>
            <span className={styles.creditAmount}>₹{exchangeAmount}</span>
          </div>

          <div className={styles.schoolInfo}>
            <label className={styles.schoolLabel}>School Name:</label>
            <Select
              options={allSchools}
              onFocus={handleSelectFocus}
              onBlur={handleSelectBlur}
              ref={selectedSchoolRef}
              value={allSchools.find((school) => school.schoolName === schoolName) || null}
              onChange={handleSelectChange}
              placeholder="Select a school"
              styles={customSelectStyles}
              filterOption={(option, inputValue) =>
                option.data.schoolName.toLowerCase().includes(inputValue.toLowerCase()) ||
                option.data.schoolCode.toLowerCase().includes(inputValue.toLowerCase())
              }
            />
          </div>
        </div>

        <div className={styles.exchangeItemsSection}>
          <h3 className={styles.sectionTitle}>Exchange Items</h3>
          <div className={styles.tableContainer}>
            <table className={styles.exchangeTable}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Bill Type</th>
                  <th>Item Type</th>
                  <th>School</th>
                  <th>Price</th>
                  <th>Return Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {itemsToExchange.map((item, index) => (
                  <tr key={index}>
                    <td>{item.sno}</td>
                    <td>{item.billCategory}</td>
                    <td>{item.itemType}</td>
                    <td>{item.itemCategory}</td>
                    <td>₹{item.price}</td>
                    <td>{item.return_quantity}</td>
                    <td>₹{item.return_quantity * item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.billingItemsSection}>
          <h3 className={styles.sectionTitle}>Billing Items</h3>
          <div
            className={styles.itemsTableContainer}
            onFocus={() => setIsTableFocused(true)}
            onBlur={() => setIsTableFocused(false)}
            tabIndex={0}
          >
            <table className={styles.itemsTable}>
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
                    <td>₹{item.price}</td>
                    <td>
                      <input
                        type="number"
                        className={styles.quantityInput}
                        value={item.quantity}
                        ref={(el) => {
                          if (!inputRefs.current[rowItemTableIndex]) inputRefs.current[rowItemTableIndex] = [];
                          inputRefs.current[rowItemTableIndex][4] = el;
                        }}
                        onChange={(e) =>
                          handleQuantityChange(rowItemTableIndex, parseInt(e.target.value, 10))
                        }
                        onKeyDown={(e) => {
                          handleItemTableKeyDown(e, rowItemTableIndex, 4);
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                          }
                        }}
                        min="1"
                      />
                    </td>
                    <td>₹{item.amount.toFixed(2)}</td>
                    <td>
                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeItemFromBill(rowItemTableIndex)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.customItemSection}>
          <button 
            className={styles.customItemBtn}
            onClick={() => setShowCustomItemModal(true)}
          >
            + Custom Item
          </button>
        </div>

        <div className={styles.summarySection}>
          <div className={`${styles.totalAmount} ${
            (calculateTotalAmount() - exchangeAmount) < 0 ? styles.negativeAmount : styles.positiveAmount
          }`}>
            Net Amount: ₹{(calculateTotalAmount() - exchangeAmount).toFixed(2)}
          </div>
          <div className={styles.totalQuantity}>
            Total Quantity: {calculateTotalQuantity()}
          </div>
        </div>

        <div className={styles.paymentSection}>
          <div className={styles.paymentMode}>
            <label>Payment Mode:</label>
            <select 
              className={styles.paymentSelect}
              value={paymentMode} 
              onChange={handlePaymentModeChange}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Upi">UPI</option>
            </select>
          </div>
          <button className={styles.billBtn} onClick={handleSubmit}>
            Generate Bill
          </button>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.closeBtn} onClick={onClose}>
          Close
        </button>
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

      <Modal show={showCustomItemModal} onHide={() => setShowCustomItemModal(false)} className={styles.customItemModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Custom Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className={styles.customItemForm}>
            <div className={styles.formGroup}>
              <label>Item Barcode ID:</label>
              <input
                type="text"
                name="itemBarcodeID"
                value={customItem.itemBarcodeID}
                onChange={handleCustomItemChange}
                readOnly
              />
            </div>
            <div className={styles.formGroup}>
              <label>Item Type:</label>
              <input
                type="text"
                name="itemType"
                value={customItem.itemType}
                onChange={handleCustomItemChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Item Color:</label>
              <input
                type="text"
                name="itemColor"
                value={customItem.itemColor}
                onChange={handleCustomItemChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Item Size:</label>
              <input
                type="text"
                name="itemSize"
                value={customItem.itemSize}
                onChange={handleCustomItemChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Item Category:</label>
              <input
                type="text"
                name="itemCategory"
                value={customItem.itemCategory}
                onChange={handleCustomItemChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Price:</label>
              <input
                type="number"
                name="sellPrice"
                value={customItem.sellPrice}
                onChange={handleCustomItemChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={customItem.quantity}
                onChange={handleCustomItemChange}
                min="1"
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className={styles.modalCloseBtn} onClick={() => setShowCustomItemModal(false)}>
            Close
          </button>
          <Button variant="primary" onClick={handleAddCustomItem}>
            Add Item
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExchangeBill;