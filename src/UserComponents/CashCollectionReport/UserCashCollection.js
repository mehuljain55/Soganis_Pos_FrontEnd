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
      case 'This FY':
        const currentFYStartMonth = today.getMonth() >= 3 ? 3 : -9;
        calculatedStartDate = format(new Date(today.getFullYear(), currentFYStartMonth, 1), 'yyyy-MM-dd');
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

  const handleQuarterSelect = (quarterLabel) => {
    const { startDate, endDate } = getQuarterDates(quarterLabel);
    if (startDate && endDate) {
      setStartDate(startDate);
      setEndDate(endDate);
      setActiveFilter(quarterLabel);
    }
  };

  const calculateTotal = (key) =>
    userCashCollection.reduce((total, item) => total + (item[key] || 0), 0).toFixed(2);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cash Collection');

    const formattedStartDate = startDate ? format(new Date(startDate), 'dd MMM yyyy') : 'N/A';
    const formattedEndDate = endDate ? format(new Date(endDate), 'dd MMM yyyy') : 'N/A';

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

    worksheet.addRow([]);
    const titleRow = worksheet.addRow(['User Cash Collection Report']);
    const periodRow = worksheet.addRow([`Period: ${formattedStartDate} to ${formattedEndDate}`]);
    worksheet.addRow([]);

    titleRow.height = 30;
    titleRow.font = { bold: true, size: 16 };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells(`A2:H2`);

    periodRow.height = 25;
    periodRow.font = { bold: true, size: 12 };
    periodRow.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells(`A3:H3`);

    const headerBgColor = 'D9E1F2';
    const totalBgColor = 'FFEB9C';

    const headerRow = worksheet.addRow([
      'User ID', 'Collection Date', 'User Name', 'Cash Collection',
      'UPI Collection', 'Card Collection', 'Cash Out', 'Total'
    ]);

    headerRow.height = 25;
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: headerBgColor }
      };
      cell.border = {
        top: { style: 'medium', color: { argb: headerBgColor } },
        left: { style: 'medium', color: { argb: headerBgColor } },
        bottom: { style: 'medium', color: { argb: headerBgColor } },
        right: { style: 'medium', color: { argb: headerBgColor } }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    headerRow.eachCell((cell, colNumber) => {
      if (colNumber === 1) {
        cell.border.left = { style: 'medium', color: { argb: '000000' } };
      }
      if (colNumber === headerRow.cellCount) {
        cell.border.right = { style: 'medium', color: { argb: '000000' } };
      }
      cell.border.top = { style: 'medium', color: { argb: '000000' } };
      cell.border.bottom = { style: 'medium', color: { argb: '000000' } };
    });

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

      row.eachCell({ includeEmpty: true }, cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        };

        if (cell.col >= 4) {
          cell.alignment = { horizontal: 'right' };
        }
      });
    });

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
      worksheet.mergeCells(`A${totalRow.number}:C${totalRow.number}`);

      totalRow.eachCell({ includeEmpty: true }, cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: totalBgColor }
        };
        cell.border = {
          top: { style: 'medium', color: { argb: totalBgColor } },
          left: { style: 'medium', color: { argb: totalBgColor } },
          bottom: { style: 'medium', color: { argb: totalBgColor } },
          right: { style: 'medium', color: { argb: totalBgColor } }
        };

        if (cell.col >= 4) {
          cell.alignment = { horizontal: 'right' };
        }
      });

      totalRow.eachCell((cell, colNumber) => {
        if (colNumber === 1) {
          cell.border.left = { style: 'medium', color: { argb: '000000' } };
        }
        if (colNumber === totalRow.cellCount) {
          cell.border.right = { style: 'medium', color: { argb: '000000' } };
        }
        cell.border.top = { style: 'medium', color: { argb: '000000' } };
        cell.border.bottom = { style: 'medium', color: { argb: '000000' } };
      });

      worksheet.getCell(`A${totalRow.number}`).alignment = { horizontal: 'center' };
    }

    const fileName = `Cash_Collection_Report.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  };

  return (
    <div className="user-cash-collection-container">
      <h2>User Cash Collection</h2>

      <div className="filter-buttons-and-date-picker">
        <div className="filter-buttons">
          {['Today', 'This Week', 'This Month', 'Previous Month', 'This FY', 'Custom Date'].map((filter) => (
            <button
              key={filter}
              className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => handleDateFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Quarter Dropdown */}
        <div className="quarter-dropdown" >
          <select
            value={activeFilter.startsWith("Q") ? activeFilter : ''}
            onChange={(e) => handleQuarterSelect(e.target.value)}
          >
            <option value="">Select Quarter</option>
            {getFinancialYearQuarters().map((qtr) => (
              <option key={qtr.label} value={qtr.label}>
                {qtr.label} ({qtr.range})
              </option>
            ))}
          </select>
        </div>

        {activeFilter === 'Custom Date' && (
          <div className="custom-date-picker-inline">
            <label>
              Start Date:
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label>
              End Date:
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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
              <label style={{ fontWeight: "bold", minWidth: "100px" }}>End Date:</label>
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

// 🔁 Quarter helpers outside component
function getFinancialYearQuarters() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-based
  const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
  const fyEndYear = fyStartYear + 1;

  return [
    {
      label: 'Q1',
      range: `01 Apr ${fyStartYear} - 30 Jun ${fyStartYear}`,
      start: `${fyStartYear}-04-01`,
      end: `${fyStartYear}-06-30`,
    },
    {
      label: 'Q2',
      range: `01 Jul ${fyStartYear} - 30 Sep ${fyStartYear}`,
      start: `${fyStartYear}-07-01`,
      end: `${fyStartYear}-09-30`,
    },
    {
      label: 'Q3',
      range: `01 Oct ${fyStartYear} - 31 Dec ${fyStartYear}`,
      start: `${fyStartYear}-10-01`,
      end: `${fyStartYear}-12-31`,
    },
    {
      label: 'Q4',
      range: `01 Jan ${fyEndYear} - 31 Mar ${fyEndYear}`,
      start: `${fyEndYear}-01-01`,
      end: `${fyEndYear}-03-31`,
    },
  ];
}

function getQuarterDates(quarterLabel) {
  const quarters = getFinancialYearQuarters();
  const match = quarters.find(q => q.label === quarterLabel);
  return match ? { startDate: match.start, endDate: match.end } : {};
}

export default UserCashCollection;
