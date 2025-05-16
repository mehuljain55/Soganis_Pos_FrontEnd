import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BILL_FETCH_URL } from '../Api/ApiConstants.js';
import './BillViewPopup.css';

const BillViewPopup = ({ onHide, billNo }) => {
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserData = () => {
    const user = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    return {
      user: user ? JSON.parse(user) : null,
      token: token || null,
    };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }); // dd/mm/yyyy format
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const fetchBillDetails = async () => {
    setLoading(true);
    setError(null);
    const { user, token } = getUserData();

    if (!user?.storeId) {
      setError('Store ID not found in user data.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(BILL_FETCH_URL, {
        params: {
          billNo,
          storeId: user.storeId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check response structure - bill data might be nested
      const billResponse = response.data.bill ? response.data : response.data;
      console.log('Processed bill data:', billResponse);
      
      setBillData(billResponse);
    } catch (err) {
      console.error('Failed to fetch bill details:', err);
      setError('Failed to fetch bill details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billNo) {
      fetchBillDetails();
    } else {
      setBillData(null);
    }
  }, [billNo]);

  // Render loading state
  if (loading) {
    return (
      <div className="bill-popup-overlay">
        <div className="bill-popup-container loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bill details...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bill-popup-overlay">
        <div className="bill-popup-container">
          <div className="bill-popup-header">
            <h3>Error Loading Bill</h3>
            <button className="close-button" onClick={onHide} aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="error-message">
            <p>{error}</p>
            <button className="retry-button" onClick={fetchBillDetails}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!billData) return null;

  // Extract data from the response - handle both direct and nested data
  const bill = billData.bill || billData;
  
  // Check if bill data is nested in the 'bill' property
  const {
    storeId = 'N/A',
    userId = 'N/A',
    bill_date,
    customerName,
    customerMobileNo,
    paymentMode = 'N/A',
    description,
    schoolName,
    billType = 'N/A',
    status = 'N/A',
    discount = 0,
    discountAmount = 0,
    balanceAmount = 0,
    item_count = 0,
    final_amount = 0,
    cashier = 'N/A',
  } = bill;

  // Make sure the bill items are properly accessed
  const billItems = Array.isArray(bill.bill) ? bill.bill : 
                   (Array.isArray(billData.bill) ? billData.bill : []);

  return (
    <div className="bill-popup-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onHide();
    }}>
      <div className="bill-popup-container" onClick={(e) => e.stopPropagation()}>
        {/* Header row with Bill Number, Date, Status */}
        <div className="bill-header-row">
          <div className="bill-header-cell">
            <span className="bill-header-label">Bill No:</span> 
            <span className="bill-header-value">{billNo}</span>
          </div>
          <div className="bill-header-cell">
            <span className="bill-header-label">Cashier:</span> 
            <span className="bill-header-value">{cashier}</span>
          </div>
          <div className="bill-header-cell">
            <span className="bill-header-label">Bill Date:</span> 
            <span className="bill-header-value">{formatDate(bill_date)}</span>
          </div>
          <div className="bill-header-cell">
            <span className="bill-header-label">Status</span> 
            <span className="bill-header-value">{status}</span>
          </div>
        </div>

        {/* Customer Information and Bill Type Row */}
        <div className="bill-info-row">
          <div className="bill-info-cell">
            <span className="bill-info-label">Customer Name:</span> 
            <span className="bill-info-value">{customerName || 'N/A'}</span>
          </div>
          <div className="bill-info-cell">
            <span className="bill-info-label">Payment Mode:</span> 
            <span className="bill-info-value">{paymentMode}</span>
          </div>
          <div className="bill-info-cell">
            <span className="bill-info-label">Final Amount:</span> 
            <span className="bill-info-value">{formatCurrency(final_amount)}</span>
          </div>
          <div className="bill-info-cell">
            <span className="bill-info-label">Bill Type</span> 
            <span className="bill-info-value">{billType}</span>
          </div>
        </div>

        {/* Items Section */}
        <div className="bill-items-container">
          <h4 className="items-title">Item Details</h4>
          <div className="bill-items-table-container">
            {billItems.length > 0 ? (
              <table className="bill-items-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Barcode</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.sno || (index + 1)}</td>
                      <td>{item.itemBarcodeID || 'N/A'}</td>
                      <td>{item.itemType || 'N/A'}</td>
                      <td>{item.description || 'N/A'}</td>
                      <td>{item.itemColor || 'N/A'}</td>
                      <td>{item.itemSize || 'N/A'}</td>
                      <td>{item.quantity || 0}</td>
                      <td>{formatCurrency(item.price || 0)}</td>
                      <td>{item.discount ? `${item.discount}%` : '0%'}</td>
                      <td>{formatCurrency(item.final_amount || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-items-message">No items found for this bill.</div>
            )}
          </div>
        </div>

        {/* Footer with Total */}
        <div className="bill-footer">
          <div className="bill-total">
            <span className="total-label">Total Amount:</span>
            <span className="total-value">{formatCurrency(final_amount)}</span>
          </div>
          <button className="close-button-center" onClick={onHide}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillViewPopup;