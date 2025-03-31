import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  IndianRupee, 
  Send, 
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import './DailyTransactionForm.css';

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

  // Fetch stores on component mount
  useEffect(() => {
    // Mock data for demonstration
    setStores([
      { storeId: 'store1', storeName: 'Main Branch' },
      { storeId: 'store2', storeName: 'North Branch' },
      { storeId: 'store3', storeName: 'South Branch' }
    ]);
  }, []);

  // Fetch store users based on selected store
  useEffect(() => {
    if (formData.transferToStore) {
      // Mock data for demonstration
      setStoreUsers([
        { userId: 'user1', sname: 'John Doe' },
        { userId: 'user2', sname: 'Jane Smith' },
        { userId: 'user3', sname: 'Robert Johnson' }
      ]);
    } else {
      setStoreUsers([]);
    }
  }, [formData.transferToStore]);

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
      // Mock user data - in a real app, this would come from authentication context
      const user = {
        userId: 'current-user-id',
        sname: 'Current User'
      };

      const requestData = {
        user: user,
        token: localStorage.getItem('token') || 'mock-token',
        transactionDailyCashModel: {
          ...formData,
          amount: parseInt(formData.amount, 10)
        }
      };

      // For demonstration, just log the data that would be sent
      console.log('Submitting:', requestData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    } catch (err) {
      console.error(err);
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
                      onChange={handleInputChange}
                      className={`dtf-select ${errors.transferToStore ? 'dtf-error' : ''}`}
                    >
                      <option value="">Select Store</option>
                      {stores.map(store => (
                        <option key={store.storeId} value={store.storeId}>
                          {store.storeName}
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
              
              <button
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
              </button>
            </div>
          </div>
          
          <div className="dtf-section">
            <label className="dtf-section-label">Amount</label>
            <div className="dtf-amount-wrapper">
              <span className="dtf-currency-symbol">$</span>
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