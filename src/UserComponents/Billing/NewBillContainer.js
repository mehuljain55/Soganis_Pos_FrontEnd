import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './NewBillContainer.css';
import { API_BASE_URL } from '../Config.js';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import BillPopup from './BillPopup'; 
import printJS from "print-js";

const NewBillContainer = ({ userData }) => {
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
  const [loading, setLoading] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);
 
  const [transactionalModel, setTransactionalModel] = useState({
    cash: 0,
    upi: 0,
    card: 0,
  });
  const [paymentEntries, setPaymentEntries] = useState([
    { id: 1, type: "Cash", value: 0 },
  ]);
  const [transactionError, setTransactionError] = useState("");

  
 

  const [allSchools, setAllSchools] = useState([]);
  const selectedSchoolRef = useRef(null); 
  const [customItem, setCustomItem] = useState({
    itemBarcodeID: 'SG9999999',
    itemType: '',
    itemColor: '',
    itemSize: '',
    itemCategory: '',
    price :0,
    discount: 0,
    sellPrice: 0,
    quantity: 1,
    amount: 0,
  });

  const [heldBills, setHeldBills] = useState(() => {
    const bills = JSON.parse(sessionStorage.getItem('heldBills')) || [];
    return bills;
  });

  const handleHoldBill = () => {
    if(selectedItems.length<=0)
      {
        alert("Item is empty");
        return;
      }
    if (!schoolName.trim()) {
      alert('School name is required to hold a bill.');
      return;
    }

   
    const newBill = {
      selectedItems,
      customerName,
      customerMobileNo,
      schoolName,
      discountPercentage,
      paymentMode,
    };
  
    if (heldBills.length < 2) {
      const updatedBills = [...heldBills, newBill];
      sessionStorage.setItem('heldBills', JSON.stringify(updatedBills));
      setHeldBills(updatedBills);
  
      // Clear current bill state to start a new bill
      resetBillState();
    } else {
      alert('You can only hold a maximum of 2 bills.');
    }
  };
  
  const handleLoadBill = (billIndex) => {
    const billToLoad = heldBills[billIndex];
    if (billToLoad) {
      // Load the bill into the current state
      setSelectedItems(billToLoad.selectedItems);
      setCustomerName(billToLoad.customerName);
      setCustomerMobileNo(billToLoad.customerMobileNo);
      setSchoolName(billToLoad.schoolName);
      setDiscountPercentage(billToLoad.discountPercentage);
      setPaymentMode(billToLoad.paymentMode);
  
      // Remove loaded bill from session storage
      const updatedBills = heldBills.filter((_, index) => index !== billIndex);
      sessionStorage.setItem('heldBills', JSON.stringify(updatedBills));
      setHeldBills(updatedBills);
    }
  };
  
  const resetBillState = () => {
    setSelectedItems([]);
    setCustomerName('');
    setCustomerMobileNo('');
    setSchoolName('');
    setDiscountPercentage(0);
    setPaymentMode('Cash');
  };

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
    fetchAllSchools();
  }, []);

 
  // Fetch items based on search term (for manual search)
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
  }, [searchTerm]);
  

  
  useEffect(() => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) => {
        const itemDiscount = item.discount === 'Yes' ? item.discountAmount || 0 : 0;
        const effectiveDiscount = discountPercentage > 0 ? discountPercentage : itemDiscount;
        const discountedPrice = item.price * (1 - effectiveDiscount / 100);
        const amount = discountedPrice * item.quantity;
  
        return {
          ...item,
          amount, // Update amount with the recalculated value
        };
      })
    );
  }, [discountPercentage]);
  
  const handleCustomItemKeyDown = (e) => {
    // Prevent event propagation to stop parent handlers
    e.stopPropagation();
    
    const inputs = document.querySelectorAll('.billing-custom-item-modal input');
    const currentIndex = Array.from(inputs).findIndex(input => input === document.activeElement);
    
    switch (e.key) {
      case 'ArrowRight':
        // Check if we're at the end of a row (even indices 0,2,4,6...)
        if (currentIndex % 2 === 0 && currentIndex < inputs.length - 1) {
          inputs[currentIndex + 1].focus();
          e.preventDefault();
        }
        break;
        
      case 'ArrowLeft':
        // Check if we're at the start of a row (odd indices 1,3,5,7...)
        if (currentIndex % 2 === 1) {
          inputs[currentIndex - 1].focus();
          e.preventDefault();
        }
        break;
        
      case 'ArrowDown':
        // Move down to the next row (add 2 to index)
        if (currentIndex < inputs.length - 2) {
          inputs[currentIndex + 2].focus();
          e.preventDefault();
        }
        break;
        
      case 'ArrowUp':
        // Move up to the previous row (subtract 2 from index)
        if (currentIndex >= 2) {
          inputs[currentIndex - 2].focus();
          e.preventDefault();
        }
        break;
        
      case 'Enter':
        // If Enter is pressed on Add Item button
        if (e.target.textContent === 'Add Item') {
          handleAddCustomItem();
          e.preventDefault();
        } else if (currentIndex === inputs.length - 1) {
          // If we're on the last input, simulate clicking the Add Item button
          document.querySelector('.billing-custom-item-modal .btn-primary').click();
          e.preventDefault();
        } else {
          // Move to the next input
          const nextInput = inputs[currentIndex + 1];
          if (nextInput) {
            nextInput.focus();
            e.preventDefault();
          }
        }
        break;
        
      case 'Escape':
        setShowCustomItemModal(false);
        e.preventDefault();
        break;
        
      default:
        break;
    }
  };

  const handleCustomItemChange = (e) => {
    const { name, value } = e.target;
  
    setCustomItem((prev) => {
      const updatedItem = { ...prev, [name]: value };
  
      // Auto-calculate sell price when price or discount changes
      if (name === "price" || name === "discount") {
        const price = parseFloat(updatedItem.price) || 0;
        const discount = parseFloat(updatedItem.discount) || 0;
        updatedItem.sellPrice = (price - (price * discount / 100)).toFixed(2);
      }
  
      // Auto-calculate amount when quantity or sellPrice changes
      if (name === "quantity" || name === "sellPrice" || name === "price" || name === "discount") {
        const quantity = parseFloat(updatedItem.quantity) || 1;
        updatedItem.amount = (parseFloat(updatedItem.sellPrice) * quantity).toFixed(2);
      }
  
      return updatedItem;
    });
  };

  useEffect(() => {
    if (showCustomItemModal) {
      window.addEventListener('keydown', handleCustomItemKeyDown);
      
     } else {
      window.removeEventListener('keydown', handleCustomItemKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleCustomItemKeyDown);
    };
  }, [showCustomItemModal]);
  
  

  useEffect(() => {
    if (isBarcodeMode && barcode.trim() !== '') {
      const fetchItemByBarcode = async () => {
        try {
          toggleBarcodeMode(true);
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
  

  // Function to handle focus change
  const handleSelectFocus = () => {
    setIsTableFocused(false); // Set table focus to false when Select is focused
  };

  const handleSelectBlur = () => {
    setIsTableFocused(true); // Set table focus back to true when Select is blurred
  }


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
      
      // Preserve the existing discountAmount or discount logic when the quantity increases
      const discountAmount = existingItem.discountAmount || 0; // Keep the previous discount amount if it exists
      existingItem.quantity += 1;
      existingItem.amount = existingItem.quantity * existingItem.price * (1 - discountAmount / 100); // Apply discount to updated amount
  
      setSelectedItems(updatedItems);
    } else {
      const newItem = {
        ...item,
        quantity: 1,
        amount: item.price * 1, // Default amount without discount
        discountAmount: item.discountAmount || 0, // Preserve the discount value from the item
      };
      setSelectedItems([...selectedItems, newItem]);
    }
  
    setSearchTerm('');
    setSearchResults([]);
    setDropdownOpen(false);

    if (!isBarcodeMode) {
      requestAnimationFrame(() => {
        setSearchTerm('');
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
    const existingItem = updatedItems[index];
    
    // Preserve the discountAmount when recalculating the amount
    const discountAmount = existingItem.discountAmount || 0;  // Keep the previous discount amount if it exists
    
    // Calculate the new amount considering the discount
    existingItem.quantity = quantity;
    existingItem.amount = quantity * existingItem.price * (1 - discountAmount / 100); // Apply discount to updated amount
    
    setSelectedItems(updatedItems);
  };
  
  useEffect(() => {

    // save the bill

    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); // Prevent the browser's default Save action
        setShowPopup(true); // Show the custom popup
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
      const discount = discountPercentage > 0 ? discountPercentage : item.discountAmount || 0;
      const discountedPrice = item.price * (1 - discount / 100);
      total += discountedPrice * item.quantity;
    });
    
    // Round total to the nearest 5 or 10
    const remainder = total % 10;
    if (remainder < 5) {
      total = total - remainder + (remainder >= 2.5 ? 5 : 0);
    } else {
      total = total - remainder + (remainder >= 7.5 ? 10 : 5);
    }
    return total;
  };

  const calculateTotalQuantity = () => {
    let total_quantity = 0; // Use let for reassignment
    selectedItems.forEach((item) => {
      total_quantity += Number(item.quantity); // Convert item.quantity to a number
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
    // Validations
    if (selectedItems.length === 0) {
      alert("The item list cannot be empty. Please add at least one item.");
      return;
    }
  
    if (!schoolName) {
      alert("School Name is required");
      return;
    }
  
    if (customerMobileNo && !/^\d{10}$/.test(customerMobileNo)) {
      alert("Customer mobile number must be exactly 10 digits");
      return;
    }
  
    if (paymentMode === "Partial") {
      const total = calculateTotalAmount();
      const { cash, upi, card } = transactionalModel;
      const nonZeroCount = [cash, upi, card].filter((value) => value > 0).length;
  
      // Validate that at least two payment modes are used
      if (nonZeroCount < 2) {
        setTransactionError("At least two payment methods must be used for partial payment.");
        setShowTransactionPopup(true);
        return;
      }
  
      // Validate that the total sum matches the calculated total amount
      const totalPayments = cash + upi + card;
  
      if (totalPayments > total) {
        setTransactionError("The payment amount exceeds the total amount.");
        setShowTransactionPopup(true);
        return;
      }
  
      if (totalPayments < total) {
        setTransactionError("The payment amount is less than the total amount.");
        setShowTransactionPopup(true);
        return;
      }
    }

    if (paymentMode === 'Due') {
      if (!customerMobileNo?.trim() || !customerName?.trim()) {
        alert("Customer mobile number and name are required for 'Due' payment mode.");
        return; // Prevent API call
      }
    }

    if(discountPercentage>0)
    {
      if (!customerName?.trim()) {
        alert("Customer Name is required");
        return; // Prevent API call
      }
    }
  
    // Process items
    const updatedItems = selectedItems.map((item) => {
      const discountAmount = item.discountAmount || 0;
      const discountedPrice = item.price * (1 - discountAmount / 100);
      const amount = item.quantity * discountedPrice;
  
      return {
        ...item,
        discountedPrice,
        amount,
      };
    });
  
    // Prepare billing and transaction models
    const billData = {
      userId: userData.userId,
      customerName: customerName,
      customerMobileNo: customerMobileNo,
      paymentMode: paymentMode,
      schoolName: schoolName,
      discount: discountPercentage,
      item_count: updatedItems.length,
      bill: updatedItems.map((item) => ({
        itemBarcodeID: item.itemBarcodeID,
        itemType: item.itemType,
        itemColor: item.itemColor,
        itemSize: item.itemSize,
        itemCategory: item.itemCategory,
        sellPrice: item.discountAmount ? item.discountedPrice : item.price,
        quantity: item.quantity,
        total_amount: item.amount,
      })),
    };
  
    const billingModel = {
      billing: billData,
      transactionModel: transactionalModel, // Use the transactional model directly
    };
  
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/user/billRequest`, billingModel, {
        responseType: "arraybuffer",
      });
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
  
      printJS({
        printable: pdfUrl,
        type: "pdf",
    
      });
      // Reset form
      setDiscountPercentage(0);
      setSelectedItems([]);
      setCustomerName("");
      setCustomerMobileNo("");
      setPaymentMode("Cash");
      setSchoolName("");
    } catch (error) {
      console.error("Error generating bill:", error);
    } finally {
      setLoading(false);
      setTransactionalModel({ cash: 0, upi: 0, card: 0 });
      setPaymentEntries([{ id: 1, type: "Cash", value: 0 }]);
      setTransactionError("");
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


  const handleMobileNoChange = (e) => {
    setCustomerMobileNo(e.target.value);
  };

  const handlePaymentModeChange = (e) => {
    const mode = e.target.value;
    setPaymentMode(mode);
    if(mode==="Partial")
    {
      setShowTransactionPopup(true);
    }

  };

  const handlePaymentUpdate = () => {
    let updatedModel = {};
    if (paymentMode === "Cash") {
      updatedModel = { cash: calculateTotalAmount(), upi: 0, card: 0 };
    } else if (paymentMode === "UPI") {
      updatedModel = { cash: 0, upi: calculateTotalAmount(), card: 0 };
    } else if (paymentMode === "Card") {
      updatedModel = { cash: 0, upi: 0, card: calculateTotalAmount() };
    }
    console.log("Payment Mode:", paymentMode, "Updated Model:", updatedModel);
    return updatedModel; // Return the computed value instead of updating state
  };
  

  const handleAddRow = () => {
    const totalAmount = calculateTotalAmount();
    const currentSum = paymentEntries.reduce((sum, entry) => sum + entry.value, 0);
    const remainingAmount = Math.max(totalAmount - currentSum, 0); // Ensure no negative values
  
    if (remainingAmount === 0) {
      alert("The total payment is already covered. Cannot add more rows.");
      return;
    }
  
    setPaymentEntries([
      ...paymentEntries,
      { id: Date.now(), type: "", value: remainingAmount },
    ]);
  };
  
  const handleDiscardBill = (billIndex) => {
    // Remove the bill from the heldBills array
    const updatedBills = heldBills.filter((_, index) => index !== billIndex);
    sessionStorage.setItem('heldBills', JSON.stringify(updatedBills));
    setHeldBills(updatedBills);
  };
  

  const handleRemoveRow = (id) => {
    setPaymentEntries(paymentEntries.filter((entry) => entry.id !== id));
  };

  const handleEntryChange = (id, field, value) => {
    const updatedEntries = paymentEntries.map((entry) => {
      if (entry.id === id) {
        return { ...entry, [field]: field === "value" ? parseFloat(value) || 0 : value };
      }
      return entry;
    });
    setPaymentEntries(updatedEntries);
  };

  const getAvailableTypes = (currentId) => {
    const selectedTypes = paymentEntries
      .filter((entry) => entry.id !== currentId && entry.type !== "")
      .map((entry) => entry.type);
    const allTypes = ["Cash", "UPI", "Card"];
    return allTypes.filter((type) => !selectedTypes.includes(type));
  };

  const handleTransactionSubmit = () => {
    const total = paymentEntries.reduce((sum, entry) => sum + entry.value, 0);
    const totalAmount = calculateTotalAmount();
    let isValid = true;
  
    // Validate all entries
    const updatedEntries = paymentEntries.map((entry) => {
      const errors = {};
      if (!entry.type) {
        errors.type = "Payment type is required.";
        isValid = false;
      }
      if (entry.value <= 0) {
        errors.value = "Amount must be greater than 0.";
        isValid = false;
      }
      return { ...entry, errors };
    });
  
    setPaymentEntries(updatedEntries);
  
    // Check if the total matches
    if (total !== totalAmount) {
      alert(
        `The total payment (${total.toFixed(
          2
        )} Rs) does not match the total amount (${totalAmount.toFixed(2)} Rs).`
      );
      isValid = false;
    }
  
    if (!isValid) return; // Prevent submission if any entry is invalid
  
    // Initialize transactionalModel
    const newTransactionalModel = { cash: 0, upi: 0, card: 0 };
  
    paymentEntries.forEach((entry) => {
      newTransactionalModel[entry.type.toLowerCase()] += entry.value;
    });
  
    setTransactionalModel(newTransactionalModel);
    setShowTransactionPopup(false);
   
  };
  
  const handleDiscountChange = (index, discountValue) => {
    if (discountPercentage > 0) {
      setDiscountPercentage(0);  // Clear global discount if an item discount is set
    }
    setSelectedItems((prevItems) => {
      const updatedItems = [...prevItems];
      const item = updatedItems[index];
      item.discountAmount = discountValue; // Apply discount amount only if discount is "Yes"
      item.amount = item.price * (1 - discountValue / 100) * item.quantity;
      return updatedItems;
    });
  };
  
  const handleGlobalDiscountChange = (value) => {
    const discount = parseFloat(value) >= 0 ? parseFloat(value) : 0;
    setDiscountPercentage(discount);
    setSelectedItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        discountAmount: discount > 0 ? 0 : item.discountAmount, // Clear item discount if global discount is applied
      }))
    );
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
  const toggleBarcodeMode = (manualMode = null) => {
    setIsBarcodeMode((prevMode) => {
      let newMode;
  
      if (manualMode !== null) {
        // If a manual mode is provided, use it directly
        newMode = manualMode;
      } else {
        // Default toggle behavior
        const isBarcodeInputFocused = document.activeElement === barcodeInputRef.current;
        const isSearchInputFocused = document.activeElement === searchInputRef.current;
  
        if (isBarcodeInputFocused) {
          newMode = false; // Switch to search mode
        } else if (isSearchInputFocused) {
          newMode = true; // Switch to barcode mode
        } else {
          newMode = !prevMode;
        }
      }
  
      setTimeout(() => {
        if (newMode) {
          barcodeInputRef.current.focus();
        } else {
          searchInputRef.current.focus();
        }
      }, 0);
  
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
        discount: 0,
        price: 0,
        sellPrice: 0,
        quantity: 1,
        amount: 0,
      });
    }
  }, [showCustomItemModal]);

  useEffect(() => {
    
    // open custom model
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

  useEffect(() => {
    // Handle Shift key press to toggle barcode mode
    const handleShiftKeyDown = (event) => {
      if (showCustomItemModal) {
        return;
      }
  
      if (event.key === 'Shift') {
        const currentTime = new Date().getTime(); // Get current time
  
        if (shiftPressTime && currentTime - shiftPressTime < 500) {
          toggleBarcodeMode();
          setShiftPressTime(null); 
        } else {
          setShiftPressTime(currentTime); 
        }
      }
    };
  
    window.addEventListener('keydown', handleShiftKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleShiftKeyDown);
    };
  }, [shiftPressTime, showCustomItemModal]); // Track shiftPressTime changes


  return (
    <div className="new-bill-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Generating bill...</p>
        </div>
      )}
  
      
  
      <div className="billing-container">

      <div className="mode-toggle">
      <button 
      className={isBarcodeMode ? "barcode-mode" : "search-mode"}
      onClick={() => toggleBarcodeMode(!isBarcodeMode)}
    >
      {isBarcodeMode ? "Barcode Mode" : "Search Mode"}
    </button>
      </div>

        <div className="billing-head">
          <h2>Billing</h2>
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
        <div className="search-bar" tabIndex="0">
          <input
            type="text"
            placeholder="Search by item code"
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => {
              setSearchTerm(e.target.value); // Ensure searchTerm is set on focus
              setDropdownOpen(true);
              toggleBarcodeMode(false); 

            
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
                        backgroundColor: index === selectedIndex ? 'lightblue' : 'transparent',
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
        <div className="customer-details-box">
          <label>
            Customer Name:
            <input
              type="text"
              name="customerName"
              value={customerName}
              onChange={handleNameChange}
              onKeyDown={(e) => handleArrowKeyCustomerDetail(e, 'customerName')}
              required
            />
          </label>
          <label>
            Customer Mobile No:
            <input
              type="text"
              name="customerMobileNo"
              value={customerMobileNo}
              onChange={handleMobileNoChange}
              onKeyDown={(e) => handleArrowKeyCustomerDetail(e, 'customerMobileNo')}
              required
            />
          </label>
          <div className="school-name-input">
            <label>
              School Name:
              <Select
              className='school-select-container'
    options={allSchools}
    onFocus={handleSelectFocus}
    onBlur={handleSelectBlur}
    ref={selectedSchoolRef}
    value={allSchools.find((school) => school.schoolName === schoolName) || null}
    onChange={handleSelectChange}
    placeholder="Select a school"
    styles={{ control: (base) => ({ ...base, width: '200px' }) }}
    filterOption={(option, inputValue) => 
        option.data.schoolName.toLowerCase().includes(inputValue.toLowerCase()) || 
        option.data.schoolCode.toLowerCase().includes(inputValue.toLowerCase())
    }
/>
            </label>
          </div>
        </div>

      </div>

      {/* Billing Items Table */}
      <div
        className="items-table-container"
        onFocus={() => setIsTableFocused(true)} // Set table focus
        onBlur={() => setIsTableFocused(false)} // Remove focus when out of table
        tabIndex={0} // Make div focusable
      >
        <div className="items-table">
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Color</th>
                <th>Size</th>
                <th>Discount</th>
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
                  <td>
  <input
    type="number"
    value={item.discountAmount || ''}
    onChange={(e) => handleDiscountChange(rowItemTableIndex, parseFloat(e.target.value) || 0)}
    disabled={item.discount !== 'Yes'}
  />
</td>

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
          <h3>Total Amount: {calculateTotalAmount().toFixed(2)} Rs</h3>
          <h4>Item Count: {selectedItems.length}</h4>
          <h4>Total Quantity: {calculateTotalQuantity()}</h4>
          
        </div>
        <div className="payment-section">
          <div className="payment-mode">
          
          <label>
          Discount (%):
          </label>
          <input
              type="number"
              value={discountPercentage}
              onChange={(e) => handleGlobalDiscountChange(e.target.value)}
              min="0"
              max="100"
              placeholder="Enter  discount %"
            />
   
            <label>
              Payment Mode:
              <select value={paymentMode} onChange={handlePaymentModeChange}>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Upi">UPI</option>
                <option value="Due">Due</option>
                
                <option value="Partial">Partial</option>
                
              </select>
            </label>
            <button id='submit-btn' onClick={handleSubmit}>Bill</button>
          </div>
        </div>

      </div>

      <div className="hold-bill-section">
  <button className="hold-bill-button" onClick={handleHoldBill}>Hold Bill</button>
  <div className="continue-bills-container">
    {heldBills.map((bill, index) => (
      <div key={index} className="continue-bill-wrapper">
        <button className="continue-bill-button" onClick={() => handleLoadBill(index)}>
          Continue Bill-{index + 1} - {bill.schoolName || `Unnamed (${index + 1})`}
        </button>
        <span
          className="discard-bill"
          onClick={(e) => { e.stopPropagation(); handleDiscardBill(index); }}
        >
          ×
        </span>
      </div>
    ))}
  </div>
</div>

      {showTransactionPopup && (
        <div className="transaction-popup">
          <div className="popup-content">
            <h3>Payment Details</h3>
            <h3>Total Amount: {calculateTotalAmount().toFixed(2)} Rs</h3>
            {transactionError && <div className="error-message">{transactionError}</div>}
            <table className="billingtransaction-model">
              <thead>
                <tr>
                  <th>Value (Rs)</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentEntries.map((entry, index) => (
                  <tr key={entry.id}>
                    <td>
                      <input
                        type="number"
                        value={entry.value}
                        onChange={(e) =>
                          handleEntryChange(entry.id, "value", e.target.value)
                        }
                        min="0"
                        placeholder="Enter amount"
                        className={entry.errors?.value ? "error-field" : ""}
                      />
                      {entry.errors?.value && <span className="error-text">{entry.errors.value}</span>}
                    </td>
                    <td>
                      <select
                        value={entry.type}
                        onChange={(e) =>
                          handleEntryChange(entry.id, "type", e.target.value)
                        }
                        className={entry.errors?.type ? "error-field" : ""}
                      >
                        <option value="">Select Type</option>
                        {getAvailableTypes(entry.id).map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {entry.errors?.type && <span className="error-text">{entry.errors.type}</span>}
                    </td>
                    <td>
                      {index > 0 && (
                        <button className='transaction-model-remove-btn' onClick={() => handleRemoveRow(entry.id)}>Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
           
            <div className="popup-actions">
            <button onClick={handleAddRow}>Add Row</button>
              <button className='popup-actions-submit-btn' onClick={handleTransactionSubmit}>Add payments</button>
              <button className='popup-actions-cancel-btn' onClick={() => setShowTransactionPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
      <Modal 
  show={showCustomItemModal} 
  onHide={() => setShowCustomItemModal(false)} 
  className="billing-custom-item-modal"
  size="md"
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Add Custom Item</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form>
      <div className="form-row">
        <div className="form-group">
          <label>Item Barcode ID:</label>
          <input type="text" name="itemBarcodeID" value={customItem.itemBarcodeID} onChange={handleCustomItemChange} readOnly />
        </div>
        <div className="form-group">
          <label>Item Name:</label>
          <input type="text" name="itemName" value={customItem.itemName} onChange={handleCustomItemChange} autoFocus />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Item Type:</label>
          <input type="text" name="itemType" value={customItem.itemType} onChange={handleCustomItemChange} />
        </div>
        <div className="form-group">
          <label>Item Color:</label>
          <input type="text" name="itemColor" value={customItem.itemColor} onChange={handleCustomItemChange} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Item Size:</label>
          <input type="text" name="itemSize" value={customItem.itemSize} onChange={handleCustomItemChange} />
        </div>
        <div className="form-group">
          <label>Quantity:</label>
          <input 
            type="text" 
            name="quantity" 
            value={customItem.quantity} 
            onChange={handleCustomItemChange} 
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Price:</label>
          <input
            type="text"
            name="price"
            value={customItem.price}
            onChange={handleCustomItemChange}
            onKeyPress={(e) => {
              if (!/[0-9.]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div className="form-group">
          <label>Discount %:</label>
          <input
            type="text"
            name="discount"
            value={customItem.discount}
            onChange={handleCustomItemChange}
            onKeyPress={(e) => {
              if (!/[0-9.]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Sell Price:</label>
          <input type="text" name="sellPrice" value={customItem.sellPrice} readOnly />
        </div>
        <div className="form-group">
          <label>Total Amount:</label>
          <input type="text" name="amount" value={customItem.amount} readOnly />
        </div>
      </div>
    </form>
  </Modal.Body>
  <Modal.Footer>
  <Button variant="primary" onClick={handleAddCustomItem}>Add Item</Button>
 
    <Button variant="secondary" onClick={() => setShowCustomItemModal(false)}>Cancel</Button>
  </Modal.Footer>
</Modal>
    </div>
  );
  };

export default NewBillContainer;