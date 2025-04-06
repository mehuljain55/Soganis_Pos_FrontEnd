import { useState, useRef, useEffect } from 'react';

import { API_BASE_URL } from '../Config.js';
import axios from 'axios';
import { format } from 'date-fns';
import './BillViewer.css';
import { CUSTOMER_BILL_DETAILED_INVOICE, DELETE_BILL_URL } from '../Api/ApiConstants.js';


const BillViewer = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Today');
  const [sortOrder, setSortOrder] = useState('Recent');
  const pdfIframeRef = useRef(null);


  const fetchBills = async () => {
    if (activeFilter === 'Custom Date') {
      if (!startDate || !endDate) {
        return;
      }
    }
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const storeId = user?.storeId;

      const response = await axios.get(`${API_BASE_URL}/invoice/getBillByDate`, {
        params: { startDate, endDate, storeId },
      });
      
      // Sort the bills based on sortOrder
      const sortedBills = [...response.data].sort((a, b) => {
        // Parse bill numbers as integers for proper numeric sorting
        const billNoA = parseInt(a.billNo);
        const billNoB = parseInt(b.billNo);
        
        return sortOrder === 'Recent' ? billNoB - billNoA : billNoA - billNoB;
      });
      
      setBills(sortedBills);
      setError('');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError('No bills found for the selected date range.');
      } else {
        setError('An error occurred while fetching bills.');
      }
    }
  };


  useEffect(() => {
    setBills([]);
    if (startDate && endDate) {
      fetchBills();
    }
  }, [startDate, endDate, sortOrder]);

  useEffect(() => {
    handleDateFilter('Today');
  }, []); 

  const handleDateFilter = async (filter) => {
    const today = new Date();
    let calculatedStartDate = '';
    let calculatedEndDate = format(today, 'yyyy-MM-dd');
  
    switch (filter) {
      case 'Today':
        calculatedStartDate = calculatedEndDate;
        break;
  
      case 'This Week':
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        calculatedStartDate = format(startOfWeek, 'yyyy-MM-dd');
        break;
  
      case 'This Month':
        calculatedStartDate = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
        calculatedEndDate = format(
          new Date(today.getFullYear(), today.getMonth() + 1, 0),
          'yyyy-MM-dd'
        );
        break;
  
      case 'Previous Month':
        const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        calculatedStartDate = format(prevMonthStart, 'yyyy-MM-dd');
        calculatedEndDate = format(prevMonthEnd, 'yyyy-MM-dd');
        break;
  
      case 'This Quarter':
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
        const quarterEndMonth = quarterStartMonth + 2;
        calculatedStartDate = format(new Date(today.getFullYear(), quarterStartMonth, 1), 'yyyy-MM-dd');
        calculatedEndDate = format(
          new Date(today.getFullYear(), quarterEndMonth + 1, 0),
          'yyyy-MM-dd'
        );
        break;
  
      case 'This FY':
        const currentFYStartMonth = today.getMonth() >= 3 ? 3 : -9;
        calculatedStartDate = format(new Date(today.getFullYear(), currentFYStartMonth, 1), 'yyyy-MM-dd');
        
        // Adjusting the end date
        const endYear = currentFYStartMonth === -9 ? today.getFullYear() : today.getFullYear() + 1;
        calculatedEndDate = format(new Date(endYear, 2, 31), 'yyyy-MM-dd');
        break;

      case 'Custom Date':
        setStartDate('');
        setEndDate('');
        break;
      default:
        return; // Custom Date, no auto-calculation
    }
  
    // Update state and fetch bills immediately with calculated dates
    setStartDate(calculatedStartDate);
    setEndDate(calculatedEndDate);
    setActiveFilter(filter);
  };
  
  // Handle sort order change
  const handleSortOrderChange = (order) => {
    setSortOrder(order);
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

      const response = await axios.get(`${CUSTOMER_BILL_DETAILED_INVOICE}`, {
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

  const printPdf = () => {
    if (pdfIframeRef.current) {
      pdfIframeRef.current.contentWindow.print();
    }
  };

  const closePdfModal = () => {
    setPdfData(null);
  };

  const handleDeleteBill = async (billNo) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const storeId = user?.storeId;
  
      const response = await axios.post(
        `${DELETE_BILL_URL}?billNo=${billNo}&storeId=${storeId}`
      );
      alert(response.data.message || "Unable to delete bill");
    } catch (error) {
      console.error('Error canceling bill:', error);
      alert('An error occurred while canceling the bill.');
    } finally {
      fetchBills();
    }
  };
  
  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  return (
    <div className="bill-viewer">
      <h1>Recent Bills</h1>
      
      {error && <p className="bill-viewer-error">{error}</p>}
      <div className="bill-viewer-top-container">
        <div className="bill-viewer-filters">
          {['Today', 'This Week', 'This Month', 'Previous Month', 'This Quarter', 'This FY', 'Custom Date'].map(
            (filter) => (
              <button
                key={filter}
                className={`bill-viewer-filter-button ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => handleDateFilter(filter)}
              >
                {filter}
              </button>
            )
          )}
        </div>
        
        {/* Sort Order - Now centered above table */}
        <div className="sort-order-container">
          <span className="sort-label">Sort By:</span>
          <div className="radio-container">
            <label className="radio-label">
              <input
                type="radio"
                name="sortOrder"
                value="Recent"
                checked={sortOrder === 'Recent'}
                onChange={() => handleSortOrderChange('Recent')}
              />
              <span className="radio-text">Recent</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="sortOrder"
                value="Oldest"
                checked={sortOrder === 'Oldest'}
                onChange={() => handleSortOrderChange('Oldest')}
              />
              <span className="radio-text">Oldest</span>
            </label>
          </div>
        </div>

        {/* Date display - Now on the right */}
        <div className="date-display-container">
          {activeFilter === 'Custom Date' ? (
            <div className="custom-date-picker">
              <div className="date-inputs">
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
              </div>
            </div>
          ) : (
            <div className="date-display">
              <div className="date-item">
                <span className="date-label">Start Date:</span>
                <span className="date-value">{startDate ? format(new Date(startDate), 'dd MMM yyyy') : 'Invalid Date'}</span>
              </div>
              <div className="date-item">
                <span className="date-label">End Date:</span>
                <span className="date-value">{endDate ? format(new Date(endDate), 'dd MMM yyyy') : 'Invalid Date'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

    

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
                  <td>{format(new Date(bill.bill_date), 'dd MMM yyyy')}</td>
                  <td>{bill.customerName}</td>
                  <td>{bill.customerMobileNo}</td>
                  <td>{bill.billType}</td>
                  <td>{bill.schoolName}</td>
                  <td>{bill.final_amount}</td>
                  <td className="action-buttons">
                    <button onClick={() => handleViewDetails(bill)}>View</button>
                    <button onClick={() => handlePrintBill(bill.billNo)}>Print</button>
                    {bill.status === 'FRESH' && isToday(bill.bill_date) && (
                      <button onClick={() => handleDeleteBill(bill.billNo)}>Delete</button>
                    )}
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
            <button className="bill-viewer-close-popup" onClick={closePopup}>
              Close
            </button>
            <h2>Bill Details</h2>
            <div className="bill-viewer-details">
              <p>
                <strong>Bill No:</strong> {selectedBill.billNo}
              </p>
              <p>
                <strong>Date:</strong> {selectedBill.bill_date}
              </p>
              <p>
                <strong>Customer Mobile:</strong> {selectedBill.customerMobileNo}
              </p>
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
                  <td colSpan="8" style={{ textAlign: 'right' }}>
                    <strong>Total Amount:</strong>
                  </td>
                  <td>
                    <strong>{selectedBill.final_amount}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {pdfData && (
        <div className="bill-view-print-pdf">
          <div className="bill-view-print-pdf-content">
            <iframe
              ref={pdfIframeRef}
              src={pdfData}
              title="Bill PDF"
              width="100%"
              height="500px"
            ></iframe>
            <div className="bill-viewer-print-controls">
              <button onClick={printPdf}>Print</button>
              <button onClick={closePdfModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillViewer;