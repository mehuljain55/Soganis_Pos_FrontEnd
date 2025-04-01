import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Send, 
  ShoppingBag,
  AlertCircle,
  HandCoins
} from 'lucide-react';
import './DailyTransactionForm.css';

import { FETCH_STORES_URL, FETCH_STORE_USER_URL, CREATE_TRANSACTION_URL } from '../Api/ApiConstants';
import axios from 'axios';

const DailyTransactionForm = () => {
  const [formData, setFormData] = useState({
    description: '',
    transferToStore: '',
    storeUser: '',
    paymentMode: 'CASH',
    transactionTypeCode: 'dr',
    transactionType: 'EXPENSE',
    amount: ''
  });

  const [stores, setStores] = useState([]);
  const [storeUsers, setStoreUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  

  const getUserData = () => {
    const user = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    return {
        user: user ? JSON.parse(user) : null,
        token: token || null
    };
};

useEffect(() => {
  // Ensure transaction type code is always 'cr' for INCOME and 'dr' for EXPENSE
  if (formData.transactionType === 'INCOME') {
    setFormData(prev => ({ ...prev, transactionTypeCode: 'cr' }));
  } else if (formData.transactionType === 'EXPENSE') {
    setFormData(prev => ({ ...prev, transactionTypeCode: 'dr' }));
  }
}, [formData.transactionType]);


  const fetchStores = async () => {
    try {
      const{user,token}=getUserData();
      const response = await axios.post(`${FETCH_STORES_URL}`);
     
     if(response.status===200)
     {
      const filteredStores = response.data.filter(store => store.storeId !== user.storeId);
      setStores(filteredStores);
     }else{
     alert("No store found");
     }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

 

  // Reset transaction type code when transaction type changes to Transfer
  useEffect(() => {
    if (formData.transactionType === 'TRANSFER') {
      setFormData(prev => ({
        ...prev,
        transactionTypeCode: ''
      }));
    } else if (!formData.transactionTypeCode) {
      setFormData(prev => ({
        ...prev,
        transactionTypeCode: 'dr'
      }));
    }
  }, [formData.transactionType]);


  const fetchStoreUsers = async (storeId) => {
    try {
      const response = await axios.get(`${FETCH_STORE_USER_URL}?storeId=${storeId}`);
  
      if (response.data.status === 'success') {
        const users = response.data.payload;
  
        // Find the default user
        const defaultUser = users.find(user => user.userType === 'default');
  
        setStoreUsers(users);
        
        // If a default user exists, set it as the selected storeUser
        setFormData(prev => ({
          ...prev,
          storeUser: defaultUser ? defaultUser.userId : ''
        }));
  
      } else {
        setStoreUsers([]);
        setFormData(prev => ({ ...prev, storeUser: '' }));
      }
  
    } catch (error) {
      console.error("Error fetching store users:", error);
      setStoreUsers([]);
      setFormData(prev => ({ ...prev, storeUser: '' }));
    }
  };
  

  useEffect(() => {
    if (formData.transferToStore) {
      fetchStoreUsers(formData.transferToStore);
    } else {
      setStoreUsers([]);
    }
  }, [formData.transferToStore]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear related error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear success message on any change
    if (success) {
      setSuccess(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Transfer fields validation
    if (formData.transactionType === 'TRANSFER') {
      if (!formData.transferToStore) {
        newErrors.transferToStore = 'Please select a store';
      }
      if (!formData.storeUser) {
        newErrors.storeUser = 'Please select a user';
      }
    }
    
    // Transaction type code validation for Expense
    if (formData.transactionType === 'EXPENSE' && !formData.transactionTypeCode) {
      newErrors.transactionTypeCode = 'Please select credit or debit';
    }
    
    // Amount validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Get user data from session storage
      const {user, token} = getUserData();
  

      

      const requestData = {
        user: user,
        token,
        transactionDailyCashModel: {
          ...formData,
          amount: parseInt(formData.amount, 10)
        }
      };
  
      if (formData.transactionType === 'TRANSFER') {
        delete requestData.transactionDailyCashModel.transactionTypeCode;
      }
      
      // Send the actual API request
      const response = await axios.post(CREATE_TRANSACTION_URL, requestData);
  
      // Check if request was successful
      if (response.status === 200) {
        // Show success message
        setSuccess(true);
        
        // Reset form after successful submission
        setFormData({
          description: '',
          transferToStore: '',
          storeUser: '',
          paymentMode: 'CASH',
          transactionTypeCode: 'dr',
          transactionType: 'EXPENSE',
          amount: ''
        });
      } else {
        throw new Error('Failed to create transaction');
      }
    } catch (err) {
      console.error('Transaction creation error:', err);
      setErrors({ form: 'Failed to create transaction' });
    } finally {
      setLoading(false);
    }
  };
  // Determine if transfer fields should be shown
  const showTransferFields = formData.transactionType === 'TRANSFER';
  
  // Decide if transaction is Debit or Credit (for Expense)
  const isDebit = formData.transactionTypeCode === 'dr';

  return (
    <div className="dtf-wrapper">
      <div className="dtf-container">
        <h1 className="dtf-title">Create Daily Transaction</h1>
        
        <div className="dtf-divider"></div>
        
        {success && (
          <div className="dtf-success-message">
            Transaction created successfully!
          </div>
        )}
        
        {errors.form && (
          <div className="dtf-error-message">
            <AlertCircle size={16} />
            <span>{errors.form}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="dtf-form">
          <div className="dtf-section">
            <label className="dtf-section-label">Transaction Type</label>
            <div className="dtf-type-buttons">
              <button 
                type="button"
                className={`dtf-type-button dtf-expense-transfer-button ${formData.transactionType === 'EXPENSE' ? 'dtf-active' : ''}`}
                onClick={() => handleInputChange({ target: { name: 'transactionType', value: 'EXPENSE' } })}
              >
                <ShoppingBag size={18} className="dtf-icon" />
                <span>Expense</span>
              </button>

              <button 
                type="button"
                className={`dtf-type-button dtf-expense-transfer-button ${formData.transactionType === 'INCOME' ? 'dtf-active' : ''}`}
                onClick={() => handleInputChange({ target: { name: 'transactionType', value: 'INCOME' } })}
              >
                <HandCoins size={18} className="dtf-icon" />
                <span>Income</span>
              </button>
              
              <button 
                type="button"
                className={`dtf-type-button dtf-expense-transfer-button ${formData.transactionType === 'TRANSFER' ? 'dtf-active' : ''}`}
                onClick={() => handleInputChange({ target: { name: 'transactionType', value: 'TRANSFER' } })}
              >
                <Send size={18} className="dtf-icon" />
                <span>Transfer</span>
              </button>
            </div>
          </div>
          
          <div className="dtf-section">
            <label className="dtf-section-label">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`dtf-input ${errors.description ? 'dtf-error' : ''}`}
              placeholder="Enter transaction description"
            />
            {errors.description && (
              <div className="dtf-error-message">
                <AlertCircle size={14} />
                <span>{errors.description}</span>
              </div>
            )}
          </div>
          
          {showTransferFields && (
            <div className="dtf-transfer-section">
              <div className="dtf-blue-line"></div>
              <div className="dtf-row">
                <div className="dtf-column">
                  <label className="dtf-section-label">Transfer To Store</label>
                  <div className="dtf-select-wrapper">
                  <select
              name="transferToStore"
              value={formData.transferToStore}
              onChange={(e) => {
                handleInputChange(e);
                setFormData(prev => ({ ...prev, storeUser: '' }));
              }}
              className={`dtf-select ${errors.transferToStore ? 'dtf-error' : ''}`}
            >
              <option value="">Select Store</option>
              {stores.map(store => (
                <option key={store.storeId} value={store.storeId}>
                  {store.storeName} -{store.address}
                </option>
              ))}
            </select>
                  </div>
                  {errors.transferToStore && (
                    <div className="dtf-error-message">
                      <AlertCircle size={14} />
                      <span>{errors.transferToStore}</span>
                    </div>
                  )}
                </div>
                
                <div className="dtf-column">
                  <label className="dtf-section-label">Store User</label>
                  <div className="dtf-select-wrapper">
                  <select
              name="storeUser"
              value={formData.storeUser}
              onChange={handleInputChange}
              className={`dtf-select ${errors.storeUser ? 'dtf-error' : ''}`}
              disabled={!formData.transferToStore}
            >
              <option value="">Select User</option>
              {storeUsers.map(user => (
                <option key={user.userId} value={user.userId}>
                  {user.sname}
                </option>
              ))}
            </select>
                  </div>
                  {errors.storeUser && (
                    <div className="dtf-error-message">
                      <AlertCircle size={14} />
                      <span>{errors.storeUser}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {formData.transactionType === 'EXPENSE' && (
            <div className="dtf-section">
              <label className="dtf-section-label">Transaction Type</label>
              <div className="dtf-type-buttons">
                <button 
                  type="button"
                  className={`dtf-type-button dtf-debit-button ${isDebit ? 'dtf-active' : ''}`}
                  onClick={() => handleInputChange({ target: { name: 'transactionTypeCode', value: 'dr' } })}
                >
                  <span>Debit</span>
                </button>
                
                
              </div>
            </div>
          )}


        {formData.transactionType === 'INCOME' && (
            <div className="dtf-section">
              <label className="dtf-section-label">Transaction Type</label>
              <div className="dtf-type-buttons">
             
                
                <button 
                  type="button"
                  className={`dtf-type-button dtf-credit-button ${!isDebit ? 'dtf-active' : ''}`}
                  onClick={() => handleInputChange({ target: { name: 'transactionTypeCode', value: 'cr' } })}
                >
                  <span>Credit</span>
                </button>
              </div>
            </div>
          )}
          
          <div className="dtf-section">
            <label className="dtf-section-label">Payment Mode</label>
            <div className="dtf-payment-options">
              <button
                type="button"
                className={`dtf-payment-button ${formData.paymentMode === 'CASH' ? 'dtf-active' : ''}`}
                onClick={() => handleInputChange({ target: { name: 'paymentMode', value: 'CASH' } })}
              >
                <IndianRupee size={18} className="dtf-icon" />
                <span>Cash</span>
              </button>
            
              {/* <button
                type="button"
                className={`dtf-payment-button ${formData.paymentMode === 'UPI' ? 'dtf-active' : ''}`}
                onClick={() => handleInputChange({ target: { name: 'paymentMode', value: 'UPI' } })}
              >
                <Send size={18} className="dtf-icon" />
                <span>UPI</span>
              </button>
              
              <button
                type="button"
                className={`dtf-payment-button ${formData.paymentMode === 'CARD' ? 'dtf-active' : ''}`}
                onClick={() => handleInputChange({ target: { name: 'paymentMode', value: 'CARD' } })}
              >
                <CreditCard size={18} className="dtf-icon" />
                <span>Card</span>
              </button>     */}
          
            </div>
          </div>
          
          <div className="dtf-section">
            <label className="dtf-section-label">Amount</label>
            <div className="dtf-amount-wrapper">
              <span className="dtf-currency-symbol">₹</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className={`dtf-input dtf-amount-input ${errors.amount ? 'dtf-error' : ''}`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <div className="dtf-error-message">
                <AlertCircle size={14} />
                <span>{errors.amount}</span>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="dtf-submit-button" 
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Create Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DailyTransactionForm;