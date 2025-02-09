import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import './UserCashCollection.css';
import { format } from 'date-fns';

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
