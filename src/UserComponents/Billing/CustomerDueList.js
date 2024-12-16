import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../Config.js';
import axios from 'axios';
import './CustomerDueList.css';

const CustomerDueList = () => {
  const [customerDueList, setCustomerDueList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('');

  // Fetch the customer due list
  const fetchCustomerList = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const storeId = user?.storeId;

      const response = await axios.get(`${API_BASE_URL}/user/dueList`, {
        params: { storeId },
      });
      setCustomerDueList(response.data);
      setFilteredList(response.data);
      setError('');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError('No dues found.');
      } else {
        setError('An error occurred while fetching due.');
      }
      setCustomerDueList([]);
      setFilteredList([]);
    }
  };

  useEffect(() => {
    fetchCustomerList();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value.toLowerCase();
    setFilter(value);

    const filtered = customerDueList.filter((dues) => {
      return (
        dues.billNo.toString().toLowerCase().includes(value) ||
        dues.customerMobileNo.toString().toLowerCase().includes(value) ||
        dues.customerName.toLowerCase().includes(value)
      );
    });
    setFilteredList(filtered);
  };

  const handlePayment = async (paymentId) => {
    if (!selectedPaymentMode) {
      alert('Please select a payment mode.');
      return;
    }

    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const storeId = user?.storeId;
      
      const paymentModel = {
        paymentId:paymentId,
        paymentMode: selectedPaymentMode,
        storeId,
      };

      const response = await axios.post(`${API_BASE_URL}/user/due/payment`, paymentModel);

      if (response.status === 200) {
        alert(response.data);
        fetchCustomerList(); // Refresh the customer list
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while processing the payment.');
    }
  };

  return (
    <div className="customer-due-list">
      <h1>Customer Due List</h1>

      {error && <p className="customer-due-list-error">{error}</p>}

      <div className="customer-due-list-filters">
        <input
          type="text"
          placeholder="Bill No, Mobile No, or Customer Name"
          value={filter}
          onChange={handleFilterChange}
          className="customer-due-list-filter-input"
        />
      </div>

      {filteredList.length > 0 && (
        <div className="customer-due-list-table-container">
          <table className="customer-due-list-table">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Customer Mobile</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((dues) => (
                <tr key={dues.sno}>
                  <td>{dues.billNo}</td>
                  <td>{new Date(dues.date).toLocaleDateString('en-GB')}</td>
                  <td>{dues.customerName}</td>
                  <td>{dues.customerMobileNo}</td>
                  <td>{dues.amount}</td>
                  <td>
                    <select
                      className="customer-due-list-payment-mode"
                      onChange={(e) => setSelectedPaymentMode(e.target.value)}
                    >
                      <option value="" disabled selected>
                        Select
                      </option>
                      <option value="Cash">Cash</option>
                      <option value="Upi">UPI</option>
                      <option value="Card">Card</option>
                    </select>
                  </td>
                  <td className="customer-due-list-action-buttons">
                    <button onClick={() => handlePayment(dues.sno)}>
                      Pay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerDueList;
