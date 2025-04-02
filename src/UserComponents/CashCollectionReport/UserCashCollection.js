import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import './UserCashCollection.css';
import { format } from 'date-fns';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const UserCashCollection = () => {
  const [userCashCollection, setUserCashCollection] = useState([]);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('Today');

  const fetchUserCashCollection = async () => {
    try {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const storeId = userData?.storeId;

      if (storeId && startDate && endDate) {
        const response = await axios.get(`${API_BASE_URL}/user/getUserCashCollection`, {
          params: { storeId, startDate, endDate },
        });
        setUserCashCollection(response.data);
      } else {
        console.error('Store ID, start date, or end date not found');
      }
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    setUserCashCollection([]);
    if (startDate && endDate) {
      fetchUserCashCollection();
    }
  }, [startDate, endDate]);

  const handleDateFilter = (filter) => {
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
        break;
      case 'Previous Month':
        calculatedStartDate = format(new Date(today.getFullYear(), today.getMonth() - 1, 1), 'yyyy-MM-dd');
        calculatedEndDate = format(new Date(today.getFullYear(), today.getMonth(), 0), 'yyyy-MM-dd');
        break;
      case 'This Quarter':
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
        calculatedStartDate = format(new Date(today.getFullYear(), quarterStartMonth, 1), 'yyyy-MM-dd');
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
        return;
    }
    setStartDate(calculatedStartDate);
    setEndDate(calculatedEndDate);
    setActiveFilter(filter);
  };

  const exportToExcel = async () => {
    // Import required libraries
    const ExcelJS = require('exceljs');
    const { saveAs } = require('file-saver');
    
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cash Collection');
    
    // Format dates
    const formattedStartDate = startDate ? format(new Date(startDate), 'dd MMM yyyy') : 'N/A';
    const formattedEndDate = endDate ? format(new Date(endDate), 'dd MMM yyyy') : 'N/A';
    
    // Define columns first (without adding headers yet)
    worksheet.columns = [
        { key: 'userId', width: 12 },
        { key: 'collectionDate', width: 18 },
        { key: 'userName', width: 20 },
        { key: 'cashCollection', width: 15, style: { numFmt: '#,##0.00' } },
        { key: 'upiCollection', width: 15, style: { numFmt: '#,##0.00' } },
        { key: 'cardCollection', width: 15, style: { numFmt: '#,##0.00' } },
        { key: 'cashOut', width: 12, style: { numFmt: '#,##0.00' } },
        { key: 'total', width: 15, style: { numFmt: '#,##0.00' } }
    ];
    
    // Add title and subtitle rows
    worksheet.addRow([]);  // Empty row for spacing at top
    const titleRow = worksheet.addRow(['User Cash Collection Report']);
    const periodRow = worksheet.addRow([`Period: ${formattedStartDate} to ${formattedEndDate}`]);
    worksheet.addRow([]);  // Empty row for spacing
    
    // Style the title and period rows
    titleRow.height = 30;
    titleRow.font = { bold: true, size: 16 };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells(`A2:H2`);
    
    periodRow.height = 25;
    periodRow.font = { bold: true, size: 12 };
    periodRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells(`A3:H3`);
    
    // Define the header background color - light blue
    const headerBgColor = 'D9E1F2';
    // Define the total row background color - light yellow
    const totalBgColor = 'FFEB9C';
    
    // NOW add the header row
    const headerRow = worksheet.addRow([
        'User ID', 'Collection Date', 'User Name', 'Cash Collection',
        'UPI Collection', 'Card Collection', 'Cash Out', 'Total'
    ]);
    
    // Style header row - using the header background color for both fill and borders
    headerRow.height = 25;
    headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, size: 12 };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: headerBgColor }  // Light blue background
        };
        cell.border = {
            top: { style: 'medium', color: { argb: headerBgColor } },
            left: { style: 'medium', color: { argb: headerBgColor } },
            bottom: { style: 'medium', color: { argb: headerBgColor } },
            right: { style: 'medium', color: { argb: headerBgColor } }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    
    // Add an outer border to the header row to make it stand out
    headerRow.eachCell((cell, colNumber) => {
        // Add black border around the entire header
        if (colNumber === 1) {
            cell.border.left = { style: 'medium', color: { argb: '000000' } };
        }
        if (colNumber === headerRow.cellCount) {
            cell.border.right = { style: 'medium', color: { argb: '000000' } };
        }
        cell.border.top = { style: 'medium', color: { argb: '000000' } };
        cell.border.bottom = { style: 'medium', color: { argb: '000000' } };
    });
    
    // Add data rows
    userCashCollection.forEach(item => {
        const row = worksheet.addRow({
            userId: item.userId || '',
            collectionDate: item.collection_date || '',
            userName: item.userName || '',
            cashCollection: Number(item.cash_collection || 0),
            upiCollection: Number(item.upi_collection || 0),
            cardCollection: Number(item.card_collection || 0),
            cashOut: Number(item.cash_return || 0),
            total: Number(item.final_cash_collection || 0)
        });
        
        // Apply border and format to each cell in the data row
        row.eachCell({ includeEmpty: true }, cell => {
            cell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            };
            
            // Right align numeric cells
            if (cell.col >= 4) {
                cell.alignment = { horizontal: 'right' };
            }
        });
    });
    
    // Add total row if there's data
    if (userCashCollection.length > 0) {
        const totals = {
            userId: 'Total',
            collectionDate: '',
            userName: '',
            cashCollection: parseFloat(calculateTotal('cash_collection')),
            upiCollection: parseFloat(calculateTotal('upi_collection')),
            cardCollection: parseFloat(calculateTotal('card_collection')),
            cashOut: parseFloat(calculateTotal('cash_return')),
            total: parseFloat(calculateTotal('final_cash_collection'))
        };
        
        const totalRow = worksheet.addRow(totals);
        
        // Merge the first 3 cells for "Total"
        worksheet.mergeCells(`A${totalRow.number}:C${totalRow.number}`);
        
        // Style the total row - using the total background color for both fill and borders
        totalRow.eachCell({ includeEmpty: true }, cell => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: totalBgColor }  // Light yellow background
            };
            cell.border = {
                top: { style: 'medium', color: { argb: totalBgColor } },
                left: { style: 'medium', color: { argb: totalBgColor } },
                bottom: { style: 'medium', color: { argb: totalBgColor } },
                right: { style: 'medium', color: { argb: totalBgColor } }
            };
            
            // Right align numeric cells
            if (cell.col >= 4) {
                cell.alignment = { horizontal: 'right' };
            }
        });
        
        // Add an outer border to the total row to make it stand out
        totalRow.eachCell((cell, colNumber) => {
            // Add black border around the entire total row
            if (colNumber === 1) {
                cell.border.left = { style: 'medium', color: { argb: '000000' } };
            }
            if (colNumber === totalRow.cellCount) {
                cell.border.right = { style: 'medium', color: { argb: '000000' } };
            }
            cell.border.top = { style: 'medium', color: { argb: '000000' } };
            cell.border.bottom = { style: 'medium', color: { argb: '000000' } };
        });
        
        // Center-align the "Total" text
        worksheet.getCell(`A${totalRow.number}`).alignment = { horizontal: 'center' };
    }
    
    // Generate filename with date range
    const fileName = `Cash_Collection_Report.xlsx`;
    
    // Write to buffer and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
};

// Helper function to ensure numeric values
function toNumber(value) {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
}


  const calculateTotal = (key) =>
    userCashCollection.reduce((total, item) => total + (item[key] || 0), 0).toFixed(2);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="user-cash-collection-container">
      <h2>User Cash Collection</h2>

   

      <div className="filter-buttons-and-date-picker">
        <div className="filter-buttons">
          {['Today', 'This Week', 'This Month', 'Previous Month', 'This Quarter', 'This FY', 'Custom Date'].map((filter) => (
            <button
              key={filter}
              className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => handleDateFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {activeFilter === 'Custom Date' && (
          <div className="custom-date-picker-inline">
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

        )}

{activeFilter !== 'Custom Date' && (
  <div className="custom-date-show">
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
      <label style={{ fontWeight: "bold", minWidth: "100px" }}>Start Date:</label>
      <span>{startDate ? format(new Date(startDate), 'dd MMM yyyy') : 'Invalid Date'}</span>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <label style={{ fontWeight: "bold", minWidth: "100px" }}>  End Date:</label>
      <span>{endDate ? format(new Date(endDate), 'dd MMM yyyy') : 'Invalid Date'}</span>
    </div>
  </div>
)}
 <div className='user-cash-collection-export'>
      {userCashCollection.length > 0 && (
          <button className="export-button" onClick={exportToExcel}>
            Export to Excel
          </button>
        )}

        </div>

      </div>

      <div className="user-cash-collection-table">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Collection Date</th>
              <th>User Name</th>
              <th>Cash Collection</th>
              <th>UPI Collection</th>
              <th>Card Collection</th>
              <th>Cash out</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {userCashCollection.map((item) => (
              <tr key={`${item.userId}-${item.collection_date}`}>
                <td>{item.userId}</td>
                <td>{item.collection_date}</td>
                <td>{item.userName}</td>
                <td>{item.cash_collection}</td>
                <td>{item.upi_collection}</td>
                <td>{item.card_collection}</td>
                <td>{item.cash_return}</td>
                <td>{item.final_cash_collection}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3">Total</td>
              <td>{calculateTotal('cash_collection')}</td>
              <td>{calculateTotal('upi_collection')}</td>
              <td>{calculateTotal('card_collection')}</td>
              <td>{calculateTotal('cash_return')}</td>
              <td>{calculateTotal('final_cash_collection')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
     
    </div>
  );
};

export default UserCashCollection;
