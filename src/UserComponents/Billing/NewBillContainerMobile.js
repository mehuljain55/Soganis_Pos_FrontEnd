import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styles from './NewBillContainerMobile.module.css';
import { API_BASE_URL } from '../Config.js';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import BillPopup from './BillPopup'; 
import printJS from "print-js";
import ExchangeModalDirect from './ExchangeModalDirect.js';
import ReturnExchangePop from './ReturnExchangePop.js';
import CustomClothModal from './CustomClothModal.js';
import { NEW_BILL_GENERATE_URL } from '../Api/ApiConstants.js';
import CustomItemMobilePopup from './CustomItemPopupMobile.js';

const NewBillContainerMobile = ({ userData }) => {
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
  const[isExchangeModelOpen,setIsExchangeModelOpen]=useState(false);
  const [isExchangeModelBillOpen, setIsExchangeModelBillOpen] = useState(false);
  const [showCustomClothModal, setShowCustomClothModal] = useState(false);
  const[sendBillType,setSendBillType]=useState('print');
  
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
    itemStatus:'NEW',
    quantity: 1,
    amount: 0,
  });

    const [customCloth, setCustomCloth] = useState({
    itemBarcodeID: 'SG9999999',
    itemType: '',
    itemColor: '',
    size:'', // this can be in decimal
    itemCategory: '',
    price :0,
    itemStatus:'NEW',
    quantity: 1, // this is fixed always
    amount: 0 // Size* price,
  });

  const [showBillModal, setShowBillModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

// Modal control functions - add these to your component

// Function to open the bill generation modal
const openBillModal = () => {
  setShowBillModal(true);
};

// Function to close the bill generation modal
const closeBillModal = () => {
  setShowBillModal(false);
};

// Function to handle modal backdrop click (optional - closes modal when clicking outside)
const handleModalBackdropClick = (e) => {
  // Only close if clicking the backdrop, not the modal content
  if (e.target === e.currentTarget) {
    setShowBillModal(false);
  }
};


  const getUserData = () => {
    const user = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    return {
        user: user ? JSON.parse(user) : null,
        token: token || null
    };
};


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

  const handleOpenExchangeBillModal = () => {
    setIsExchangeModelBillOpen(true);
  };

  // Function to close the ReturnExchangePop modal
  const handleCloseExchangBillModal = () => {
    setIsExchangeModelBillOpen(false);
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
        const price = parseInt(updatedItem.price) || 0;  // Convert price to integer
        const discount = parseInt(updatedItem.discount) || 0;  // Convert discount to integer
        updatedItem.sellPrice = (price - (price * discount / 100)).toFixed(2);
      }
  
      // Auto-calculate amount when quantity or sellPrice changes
      if (name === "quantity" || name === "sellPrice" || name === "price" || name === "discount") {
        const quantity = parseInt(updatedItem.quantity) || 1;  // Convert quantity to integer
        updatedItem.amount = (parseInt(updatedItem.sellPrice) * quantity).toFixed(2);  // Convert sellPrice to integer before multiplication
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

    if (!schoolName) { // Check if schoolName is empty or null
      const matchedSchool = allSchools.find(school => school.schoolName === item.itemCategory);
      
      if (matchedSchool) {
          setSchoolName(matchedSchool.schoolName);
      }
  }
  const existingItemIndex = selectedItems.findIndex(
    (selectedItem) =>
      selectedItem.itemBarcodeID === item.itemBarcodeID &&
      selectedItem.itemStatus === 'NEW'
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

      const discountPercentage = item.discount === 'Yes' ? item.discount_percentage || 0 : 0;
let amount = item.price * 1; // Default quantity is 1

if (discountPercentage > 0) {
  amount = amount - (amount * discountPercentage / 100);
}

const newItem = {
  ...item,
  quantity: 1,
  amount: amount,
  itemStatus: 'NEW',
  discountAmount: discountPercentage,
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

  
  const addItemToBillExchange = (item,quantity,status) => {

        if (!schoolName) { // Check if schoolName is empty or null
      const matchedSchool = allSchools.find(school => school.schoolName === item.itemCategory);
      
      if (matchedSchool) {
          setSchoolName(matchedSchool.schoolName);
      }
  }

        const newItem = {
          ...item,
          quantity: quantity,
          amount: item.price * quantity*-1, // Default amount without discount
          itemStatus:status,
        };
        setSelectedItems([...selectedItems, newItem]);
      
    
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

  const openExchangeModal = () => {
    setIsExchangeModelOpen(true);
  };

  // Function to close the modal
  const closeExchangeModal = () => {
    setIsExchangeModelOpen(false);
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
      if(item.itemStatus==="NEW")
      {
        if(item.itemType==='CLOTH')
        {
          total += discountedPrice * item.size;
        }else{
          total += discountedPrice * item.quantity;
        }


      }else{
        total += (discountedPrice * item.quantity)*-1;
        
      }
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

const handleSizeChange = (rowIndex, newSize) => {
  // Ensure newSize is a positive number with one decimal place
  let formattedSize = parseFloat(newSize);
  if (isNaN(formattedSize) || formattedSize <= 0) {
    formattedSize = 1.0; // Default to 1.0 if invalid
  }
  formattedSize = parseFloat(formattedSize.toFixed(1));

  // Update the item in the selectedItems array
  setSelectedItems((prevItems) => {
    const updatedItems = [...prevItems];
    const item = { ...updatedItems[rowIndex] };

    // Calculate the new amount
    const newAmount = Math.round(formattedSize * item.price);

    // Update size and amount
    item.size = formattedSize;
    item.itemSize=formattedSize+'';
    item.amount = newAmount;

    updatedItems[rowIndex] = item;
    return updatedItems;
  });
};


  const calculateTotalQuantity = () => {
    let total_quantity = 0; // Use let for reassignment
    selectedItems.forEach((item) => {
      if(item.itemStatus==="NEW")
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


 useEffect(() => {
  if (pendingSubmit) {
    handleSubmit();
    setPendingSubmit(false); // reset flag
  }
}, [pendingSubmit]);

const sendBillToWhatsapp = () => {
  setSendBillType('whatsapp');
  setPendingSubmit(true);
};

const printBill = () => {
  setSendBillType('print');
  setPendingSubmit(true);
};

const handleSubmit = async () => {

    const{user,token} = getUserData();

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


      if (sendBillType === 'whatsapp') {
       const isValidMobile = /^[6-9]\d{9}$/.test(customerMobileNo);

        if (!customerMobileNo || !isValidMobile) {
          alert("Please enter a valid 10-digit mobile number to send via WhatsApp.");
          return;
        }
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
      const adjustedQuantity = (item.itemStatus === 'EXCHANGE' || item.itemStatus === 'RETURN')
        ? item.quantity * -1
        : item.quantity;

        let amount=item.size * discountedPrice;

        if(item.itemType==='CLOTH')
        {
           amount = item.size * discountedPrice;   
        }else{
          amount = adjustedQuantity * discountedPrice;
        }
    
      return {
        ...item,
        discountedPrice,
        quantity: adjustedQuantity, // Updated quantity for exchange/return
        amount,
      };
    });
    
    
    const billData = {
      userId: user.userId,
      customerName: customerName,
      customerMobileNo: customerMobileNo,
      paymentMode: paymentMode,
      schoolName: schoolName,
      discount: discountPercentage,
      sendType: sendBillType,
      item_count: updatedItems.length,
      bill: updatedItems.map((item) => ({
        itemBarcodeID: item.itemBarcodeID,
        itemType: item.itemType,
        itemColor: item.itemColor,
        itemSize: item.itemSize,
        itemStatus:item.itemStatus,
        size:item.size,
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



    const apiRequestModel={
      user,
      token,
      billTransactionModel:billingModel
    }
  
    try {
      setLoading(true);
      const response = await axios.post(`${NEW_BILL_GENERATE_URL}`, apiRequestModel, {
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

  
  const handleBillType = (type) => {
    setSendBillType(type);
    console.log("Bill send type changed to:", type);
  };


  
const handleDiscountChange = (rowIndex, newDiscount) => {
  // Update the discount amount for the selected item
  const updatedItems = [...selectedItems];
  const item = updatedItems[rowIndex];

  item.discountAmount = newDiscount;

  // Recalculate amount after applying discount
  const originalAmount = item.price * item.quantity;
  const discountValue = (newDiscount / 100) * originalAmount;
  item.amount = parseFloat((originalAmount - discountValue).toFixed(2));

  setSelectedItems(updatedItems);
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
    handleReturnOrExchangeReset();
  };

  const handleReturnOrExchangeReset = () => {
    const hasReturnOrExchange = selectedItems.some(
      (item) =>
        item.itemStatus === 'RETURN' ||
        item.itemStatus === 'EXCHANGE' ||
        item.itemStatus === 'exchange'
    );
  
    if (hasReturnOrExchange) {
      // Reset global discount
      setDiscountPercentage(0);
  
      // Reset all items to original price and clear any discountAmount
      setSelectedItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          price: item.price, // restore original price
          discountAmount: 0,
        }))
      );
    }
  };

  useEffect(() => {
    handleReturnOrExchangeReset();
  }, [selectedItems]);
  

  useEffect(() => {
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();  // Automatically focus the input
    }
  }, []);

  const handleAddCustomItem = () => {
  
    // Create the new item object with integer conversion
    const newItem = {
      itemBarcodeID: customItem.itemBarcodeID,
      itemCode: customItem.itemBarcodeID,
      itemType: customItem.itemType,
      itemColor: customItem.itemColor,
      itemSize: customItem.itemSize,
      itemCategory: customItem.itemCategory,
      itemStatus: 'NEW',
      itemName: `${customItem.itemCategory} ${customItem.itemType}`,
      quantity: parseInt(customItem.quantity) || 0,  // Convert quantity to integer
      price: parseInt(customItem.sellPrice) || 0,  // Convert sellPrice to integer
      amount: parseInt(customItem.quantity) * parseInt(customItem.sellPrice) || 0,  // Calculate amount as an integer
    };
  
    // Update the selectedItems state
    setSelectedItems([...selectedItems, newItem]);
  
    // Close the modal
    setShowCustomItemModal(false);
  };

    const handleAddCustomItemCloth = (itemBarcodeID,description, itemCategory, size, price) => {
      const parsedSize = parseFloat(size) || 0;
      const parsedPrice = parseInt(price) || 0;
      const quantity = 1;
      const amount = Math.round(parsedSize * parsedPrice); // Ensures integer amount

      const newItem = {
        itemBarcodeID:itemBarcodeID,
        itemCode: "CLOTH",
        itemType: 'CLOTH',
        itemSize:size,
        itemCategory: itemCategory,
        itemStatus: 'NEW',
        size: parsedSize,
        itemName: description,
        description:description,
        quantity: quantity,
        price: parsedPrice,
        amount: amount,
      };

      setSelectedItems([...selectedItems, newItem]);
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
  <div className={styles.billingContainer}>
    {loading && (
      <div className={styles.loadingOverlay}>
        <div className={styles.spinner}>
          <div className={styles.spinnerCircle}></div>
        </div>
        <p>Generating bill...</p>
      </div>
    )}

    <div className={styles.mainContent}>

      <div className={styles.billingHead}>
        <h2>Billing</h2>
      </div>

      <div className={styles.searchBarContainer}>
        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by item code"
            ref={searchInputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => {
              setSearchTerm(e.target.value);
              setDropdownOpen(true);
              toggleBarcodeMode(false);
            }}
            onKeyDown={handleArrowNavigation}
          />
          {dropdownOpen && (
            <div className={styles.dropdown} ref={dropdownRef}>
              <div className={styles.dropdownTable}>
                <div className={styles.dropdownHeader}>
                  <div>Item Code</div>
                  <div>Item Name</div>
                  <div>Type</div>
                  <div>Color</div>
                  <div>Size</div>
                  <div>Price</div>
                </div>
                <div className={styles.dropdownBody}>
                  {searchResults.map((item, index) => (
                    <div
                      key={item.itemBarcodeID}
                      className={`${styles.dropdownRow} ${index === selectedIndex ? styles.activeRow : ''}`}
                      onClick={() => addItemToBill(item)}
                      onKeyDown={(e) => handleKeyDown(e, item)}
                      tabIndex="0"
                    >
                      <div>{item.itemCode}</div>
                      <div>{item.itemName}</div>
                      <div>{item.itemType}</div>
                      <div>{item.itemColor}</div>
                      <div>{item.itemSize}</div>
                      <div>{item.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.itemsTableContainer}>
        <div className={styles.itemsTable}>
          <div className={styles.tableHeader}>
            <div>Code</div>
            <div>Name</div>
            <div>Color</div>
            <div>Size</div>
            <div>Discount</div>
            <div>Price</div>
            <div>Qty</div>
            <div>Amount</div>
            <div>Actions</div>
          </div>
          <div className={styles.tableBody}>
            {selectedItems.map((item, rowItemTableIndex) => (
              <div key={rowItemTableIndex} className={styles.tableRow}>
                <div>{item.itemCode}</div>
                <div>{item.itemName}</div>
                <div>{item.itemColor}</div>
                <div>{item.itemSize}</div>
                <div>
                  <div className={styles.inputGroup}>
                    <button
                      className={styles.controlButton}
                      onClick={() => handleDiscountChange(rowItemTableIndex, Math.max(0, (parseFloat(item.discountAmount || 0) - 1).toFixed(1)))}
                      disabled={item.discount !== 'Yes'}
                    >-</button>
                    <input
                      type="number"
                      className={styles.controlInput}
                      value={item.discountAmount || 0}
                      onChange={(e) => handleDiscountChange(rowItemTableIndex, parseFloat(e.target.value) || 0)}
                      disabled={item.discount !== 'Yes'}
                    />
                    <button
                      className={styles.controlButton}
                      onClick={() => handleDiscountChange(rowItemTableIndex, (parseFloat(item.discountAmount || 0) + 1).toFixed(1))}
                      disabled={item.discount !== 'Yes'}
                    >+</button>
                  </div>
                </div>
                <div>{item.price}</div>
                <div>
                  {item.itemType === 'CLOTH' ? (
                    <div className={styles.inputGroup}>
                      <button
                        className={styles.controlButton}
                        onClick={() => handleSizeChange(rowItemTableIndex, Math.max(1.0, (parseFloat(item.size || 1.0) - 0.1).toFixed(1)))}
                      >-</button>
                      <input
                        type="number"
                        className={styles.controlInput}
                        value={item.size || 1.0}
                        onChange={(e) => handleSizeChange(rowItemTableIndex, Math.min(5.0, Math.max(1.0, parseFloat(e.target.value) || 1.0)))}
                      />
                      <button
                        className={styles.controlButton}
                        onClick={() => handleSizeChange(rowItemTableIndex, Math.min(5.0, (parseFloat(item.size || 1.0) + 0.1).toFixed(1)))}
                      >+</button>
                    </div>
                  ) : (
                    <div className={styles.inputGroup}>
                      <button
                        className={styles.controlButton}
                        onClick={() => handleQuantityChange(rowItemTableIndex, item.itemStatus.includes('EXCHANGE') || item.itemStatus.includes('RETURN') ? -Math.max(-1, item.quantity + 1) : Math.max(1, item.quantity - 1))}
                      >-</button>
                      <input
                        type="number"
                        className={styles.controlInput}
                        value={item.itemStatus.includes('EXCHANGE') || item.itemStatus.includes('RETURN') ? -Math.abs(item.quantity) : item.quantity}
                        onChange={(e) => handleQuantityChange(rowItemTableIndex, item.itemStatus.includes('EXCHANGE') || item.itemStatus.includes('RETURN') ? -Math.abs(parseInt(e.target.value, 10) || 0) : Math.abs(parseInt(e.target.value, 10) || 0))}
                      />
                      <button
                        className={styles.controlButton}
                        onClick={() => handleQuantityChange(rowItemTableIndex, item.itemStatus.includes('EXCHANGE') || item.itemStatus.includes('RETURN') ? -Math.min(-1, item.quantity - 1) : item.quantity + 1)}
                      >+</button>
                    </div>
                  )}
                </div>
                <div>{item.amount.toFixed(2)}</div>
                <div>
                  <button 
                    className={styles.removeButton} 
                    onClick={() => removeItemFromBill(rowItemTableIndex)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryButtons}>
          <button 
            className={styles.customButton} 
            onClick={() => setShowCustomItemModal(true)}
          >
            Custom Item
          </button>
          <button 
            className={styles.customButton} 
            onClick={() => setShowCustomClothModal(true)}
          >
            Cloth
          </button>
        </div>
        
        <div className={styles.summaryDetails}>
          <h3>Total Amount: {calculateTotalAmount().toFixed(2)} Rs</h3>
          <div className={styles.summaryInfo}>
            <span>Item Count: {selectedItems.length}</span>
            <span>Total Quantity: {calculateTotalQuantity()}</span>
          </div>
        </div>
        
       
        
        {/* Single Generate Bill Button */}
        <div className={styles.actionButtons}>
          <button 
            className={styles.generateBillButton} 
            onClick={() => setShowBillModal(true)}
          >
            Generate Bill
          </button>
        </div>
      </div>

      {/* Bill Generation Modal */}
      {showBillModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5>Generate Bill</h5>
              <button 
                className={styles.closeButton} 
                onClick={() => setShowBillModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Bill Summary */}
              <div className={styles.billSummary}>
                <h4>Bill Summary</h4>
                <div className={styles.summaryRow}>
                  <span>Total Amount:</span>
                  <span className={styles.amount}>{calculateTotalAmount().toFixed(2)} Rs</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Item Count:</span>
                  <span>{selectedItems.length}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Total Quantity:</span>
                  <span>{calculateTotalQuantity()}</span>
                </div>
              </div>

              {/* Customer Details */}
              <div className={styles.customerDetailsModal}>
                <h4>Customer Details</h4>
                <input
                  type="text"
                  className={styles.customerInput}
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={handleNameChange}
                />
                <input
                  type="text"
                  className={styles.customerInput}
                  placeholder="Customer Mobile No"
                  value={customerMobileNo}
                  onChange={handleMobileNoChange}
                />
                <select
                  className={styles.customerSelect}
                  value={schoolName}
                  onChange={handleSelectChange}
                >
                  <option value="">Select a school</option>
                  {allSchools.map(school => (
                    <option key={school.schoolName} value={school.schoolName}>
                      {school.schoolName}
                    </option>
                  ))}
                </select>

 <div className={styles.discountContainer}>
            <label>Discount (%):</label>
            <input
              type="number"
              className={styles.discountInput}
              value={discountPercentage}
              onChange={(e) => handleGlobalDiscountChange(e.target.value)}
              min="0"
              max="100"
            />
          </div>
          
          <div className={styles.paymentContainer}>
            <label>Payment Mode:</label>
            <select 
              className={styles.paymentSelect} 
              value={paymentMode} 
              onChange={handlePaymentModeChange}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Upi">UPI</option>
              <option value="Due">Due</option>
              <option value="Partial">Partial</option>
            </select>
          </div>

              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton} 
                onClick={() => setShowBillModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.billButton} 
                onClick={printBill}
              >
                Print Bill
              </button>
              <button 
                className={styles.whatsappButton} 
                onClick={sendBillToWhatsapp}
              >
                WhatsApp Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransactionPopup && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5>Payment Details</h5>
              <button 
                className={styles.closeButton} 
                onClick={() => setShowTransactionPopup(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <h3>Total Amount: {calculateTotalAmount().toFixed(2)} Rs</h3>
              {transactionError && (
                <div className={styles.errorAlert}>{transactionError}</div>
              )}
              <div className={styles.paymentTable}>
                <div className={styles.paymentHeader}>
                  <div>Value (Rs)</div>
                  <div>Type</div>
                  <div>Actions</div>
                </div>
                <div className={styles.paymentBody}>
                  {paymentEntries.map((entry, index) => (
                    <div key={entry.id} className={styles.paymentRow}>
                      <div>
                        <input
                          type="number"
                          className={`${styles.paymentInput} ${entry.errors?.value ? styles.inputError : ''}`}
                          value={entry.value}
                          onChange={(e) => handleEntryChange(entry.id, "value", e.target.value)}
                          min="0"
                          placeholder="Enter amount"
                        />
                        {entry.errors?.value && (
                          <div className={styles.errorText}>{entry.errors.value}</div>
                        )}
                      </div>
                      <div>
                        <select
                          className={`${styles.paymentSelect} ${entry.errors?.type ? styles.inputError : ''}`}
                          value={entry.type}
                          onChange={(e) => handleEntryChange(entry.id, "type", e.target.value)}
                        >
                          <option value="">Select Type</option>
                          {getAvailableTypes(entry.id).map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {entry.errors?.type && (
                          <div className={styles.errorText}>{entry.errors.type}</div>
                        )}
                      </div>
                      <div>
                        {index > 0 && (
                          <button 
                            className={styles.removeRowButton} 
                            onClick={() => handleRemoveRow(entry.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.addRowButton} onClick={handleAddRow}>Add Row</button>
              <button className={styles.submitButton} onClick={handleTransactionSubmit}>Add payments</button>
              <button className={styles.cancelButton} onClick={() => setShowTransactionPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5>Confirm Bill</h5>
              <button className={styles.closeButton} onClick={handlePopupCancel}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to confirm this bill?</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={handlePopupCancel}>Cancel</button>
              <button className={styles.submitButton} onClick={handlePopupConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {isExchangeModelOpen && (
        <ExchangeModalDirect
          isOpen={isExchangeModelOpen}
          onClose={closeExchangeModal}
          addItemToBillExchange={addItemToBillExchange}
        />
      )}

      {isExchangeModelBillOpen && (
        <ReturnExchangePop
          onClose={handleCloseExchangBillModal}
          userData={userData}
        />
      )}

      {showCustomClothModal && (
        <CustomClothModal
          onAddItem={handleAddCustomItemCloth}
          onClose={() => setShowCustomClothModal(false)}
        />
      )}

      {showPdfModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5>Bill PDF</h5>
              <button className={styles.closeButton} onClick={handleClosePdfModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              {pdfData && (
                <iframe
                  ref={pdfModalRef}
                  src={pdfData}
                  width="100%"
                  height="500px"
                  title="Bill PDF"
                />
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={handleClosePdfModal}>Close</button>
              <button className={styles.submitButton} onClick={handlePrint}>Print</button>
            </div>
          </div>
        </div>
      )}

<div className={styles.customItemModal}>
  <div className={styles.modalWrapper}>
    <div className={styles.modalContent}>
      <CustomItemMobilePopup
        showCustomItemModal={showCustomItemModal}
        setShowCustomItemModal={setShowCustomItemModal}
        customItem={customItem}
        handleCustomItemChange={handleCustomItemChange}
        handleAddCustomItem={handleAddCustomItem}
      />
    </div>
  </div>
</div>

    </div>
  </div>
);

};

export default NewBillContainerMobile;