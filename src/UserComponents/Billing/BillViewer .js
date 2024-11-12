// BillViewer.js
import React, { useState } from 'react';
import { API_BASE_URL } from '../Config.js';
import axios from 'axios';
import './BillViewer.css';

const BillViewer = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [pdfData, setPdfData] = useState(null);

  const fetchBills = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const storeId = user?.storeId;

      const response = await axios.get(`${API_BASE_URL}/invoice/getBillByDate`, {
        params: { startDate, endDate, storeId },
      });
      setBills(response.data);
      setError('');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError('No bills found for the selected date range.');
      } else {
        setError('An error occurred while fetching bills.');
      }
      setBills([]);
    }
  };

  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
  };

  const closePopup = () => {
    setSelectedBill(null);
  };

  const handlePrintBill = async (billNo) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const storeId = user?.storeId;

      const response = await axios.get(`${API_BASE_URL}/invoice/getBill`, {
        params: { billNo, storeId },
        responseType: 'arraybuffer',
      });

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfData(pdfUrl);
    } catch (error) {
      console.error('Error fetching PDF:', error);
      setError('An error occurred while fetching the PDF.');
    }
  };

  const closePdfModal = () => {
    setPdfData(null);
  };

  return (
    <div className="bill-viewer">
      <h1>Bill Viewer</h1>
      <div className="bill-viewer-filters">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button onClick={fetchBills}>View Bills</button>
      </div>

      {error && <p className="bill-viewer-error">{error}</p>}

      {bills.length > 0 && (
        <div className="bill-viewer-table-container">
          <table className="bill-viewer-table">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Customer Mobile</th>
                <th>Bill Type</th>
                <th>School</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.billNo}>
                  <td>{bill.billNo}</td>
                  <td>{bill.bill_date}</td>
                  <td>{bill.customerName}</td>
                  <td>{bill.customerMobileNo}</td>
                  <td>{bill.billType}</td>
                  <td>{bill.schoolName}</td>
                  <td>{bill.final_amount}</td>
                  <td>
                    <button onClick={() => handleViewDetails(bill)}>View</button>
                    <button onClick={() => handlePrintBill(bill.billNo)}>Print</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedBill && (
        <div className="bill-viewer-popup">
          <div className="bill-viewer-popup-content">
            <button className="bill-viewer-close-popup" onClick={closePopup}>Close</button>
            <h2>Bill Details</h2>
            <div className="bill-viewer-details">
              <p><strong>Bill No:</strong> {selectedBill.billNo}</p>
              <p><strong>Date:</strong> {selectedBill.bill_date}</p>
              <p><strong>Customer Mobile:</strong> {selectedBill.customerMobileNo}</p>
            </div>
            <h3>Items</h3>
            <table className="bill-viewer-popup-table">
              <thead>
                <tr>
                  <th>Item Type</th>
                  <th>School</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Discount %</th>
                  <th>Sell Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.bill.map((item, index) => (
                  <tr key={index}>
                    <td>{item.itemType}</td>
                    <td>{item.itemCategory}</td>
                    <td>{item.itemColor}</td>
                    <td>{item.itemSize}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td>{item.discount}</td>
                    <td>{item.sellPrice}</td>
                    <td>{item.total_amount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="8" style={{ textAlign: 'right' }}><strong>Total Amount:</strong></td>
                  <td><strong>{selectedBill.final_amount}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {pdfData && (
        <div className="bill-view-print-pdf">
          <div className="bill-view-print-pdf-content">
            <iframe src={pdfData} title="Bill PDF" width="100%" height="500px"></iframe>
            <button onClick={() => window.print()}>Print</button>
            <button onClick={closePdfModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillViewer;
