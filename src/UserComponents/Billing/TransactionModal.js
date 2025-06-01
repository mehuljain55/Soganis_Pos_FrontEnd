import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransactionModal.css';
import { FIND_TRANSACTION_BILL_NO, UPDATE_TRANSACTION_BILL_NO } from '../Api/ApiConstants';

const TransactionModal = ({ handleClose, billNo, totalAmount }) => {
  const [transactions, setTransactions] = useState([]);
  const [editedTransactions, setEditedTransactions] = useState([]);
  const [error, setError] = useState('');
  const user = JSON.parse(sessionStorage.getItem('user'));
  const token = sessionStorage.getItem('token');
  const storeId = user?.storeId;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (billNo && storeId) {
        try {
          const response = await axios.post(FIND_TRANSACTION_BILL_NO, {
            billNo,
            storeId,
            user,
            token,
          });

          if (response.data.status === 'success') {
            const data = response.data.payload;
            setTransactions(data);
            setEditedTransactions(data);
          }
        } catch (error) {
          console.error('Error fetching transactions:', error);
        }
      }
    };

    fetchTransactions();
  }, [billNo, storeId]);

  const sumOfAmounts = editedTransactions.reduce((acc, txn) => acc + (txn.amount || 0), 0);

  const handleInputChange = (index, field, value) => {
    const updated = [...editedTransactions];
    updated[index][field] = value;
    setEditedTransactions(updated);
    setError('');
  };

  const handleAddTransaction = () => {
    if (editedTransactions.length >= 3) {
      setError('Only one transaction per mode (CASH, CARD, UPI) is allowed.');
      return;
    }

    const newTransaction = {
      transactionId: null,
      description: '',
      mode: '',
      amount: 0,
      transactionType: 'DEBIT',
      isNew: true,
    };
    setEditedTransactions([...editedTransactions, newTransaction]);
    setError('');
  };

  const handleSave = async () => {
    if (sumOfAmounts !== totalAmount) {
      setError(`Sum of all transaction amounts (${sumOfAmounts}) must equal the total amount (${totalAmount}).`);
      return;
    }

    try {
      const transactionsList = editedTransactions
        .filter(txn => {
          const isNew = txn.transactionId === null || txn.isNew || txn.transactionId?.toString().startsWith("new");
          return !isNew || (isNew && txn.amount > 0);
        })
        .map(txn => {
          const isNew = txn.transactionId === null || txn.isNew || txn.transactionId?.toString().startsWith("new");

          const mapped = {
            billNo,
            storeId,
            mode: txn.mode,
            amount: txn.amount,
            status: isNew ? 'NEW' : 'EDITED',
          };

          if (!isNew) {
            mapped.transactionId = txn.transactionId;
          }

          return mapped;
        });

      const response = await axios.post(UPDATE_TRANSACTION_BILL_NO, {
        user,
        token,
        storeId,
        billNo,
        transactionsList,
      });

      alert(response.data.message);
      handleClose();
    } catch (err) {
      console.error(err);
      alert('Error saving transactions.');
    }
  };

  const availableModes = (index) => {
    const usedModes = editedTransactions
      .map((t, i) => (i !== index ? t.mode : null))
      .filter(Boolean);

    return ['CASH', 'CARD', 'UPI'].filter(mode => !usedModes.includes(mode));
  };

  return (
    <div className="transaction-modal-overlay">
      <div className="transaction-modal-container">
        <div className="transaction-modal-header">
          <h2>Transaction Details</h2>
          <h3>Bill No: {billNo}</h3>
          <h3>Total: {totalAmount}</h3>
          <button className="transaction-modal-close-button" onClick={handleClose}>&times;</button>
        </div>

        <div className="transaction-modal-body">
          <table className="transaction-modal-table">
            <thead>
              <tr>
                <th>Payment Mode</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {editedTransactions.map((txn, index) => (
                <tr key={txn.transactionId || `new-${index}`}>
                  <td>
                    <select
                      value={txn.mode}
                      onChange={(e) => handleInputChange(index, 'mode', e.target.value)}
                    >
                      <option value="">Select Mode</option>
                      {availableModes(index).map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={txn.amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        handleInputChange(index, 'amount', isNaN(val) ? 0 : val);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="transaction-modal-btn add" onClick={handleAddTransaction}>
            + Add Transaction
          </button>

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          <p style={{ marginTop: '10px', fontWeight: 'bold', color: sumOfAmounts === totalAmount ? 'green' : 'red' }}>
            Total: {sumOfAmounts}
          </p>
        </div>

        <div className="transaction-modal-footer">
          <button className="transaction-modal-btn cancel" onClick={handleClose}>Close</button>
          <button
            className="transaction-modal-btn save"
            onClick={handleSave}
            disabled={sumOfAmounts !== totalAmount}
            title={sumOfAmounts !== totalAmount ? 'Sum of transaction amounts must equal total amount' : ''}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
