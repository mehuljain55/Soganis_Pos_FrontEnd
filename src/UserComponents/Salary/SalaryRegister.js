import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SalaryRegister.css'; // CSS file for styling
import { API_BASE_URL } from '../Config.js';

const SalaryRegister = () => {
  const [userList, setUserList] = useState([]);
  const [rows, setRows] = useState([{ userId: '', description: '', type: 'SELECT', date: new Date().toISOString().split('T')[0], amount: 0, hours: 0 }]);
  const [errorRows, setErrorRows] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupStatus, setPopupStatus] = useState(null);
  useEffect(() => {
    const fetchUserList = async () => {
      try {

        const userData = JSON.parse(sessionStorage.getItem('user'));
        const storeId = userData?.storeId; // Retrieve storeId from userData
  
        if (storeId) {
          // Make API call with storeId as a query parameter
          const response = await axios.get(`${API_BASE_URL}/user/getEmployeeList`, {
            params: { storeId: storeId },
          });
          setUserList(response.data);
        } else {
          console.error('Store ID not found in user data');
        }
      } catch (error) {
        console.error('Error fetching user list:', error);
      }
    };

    fetchUserList();
  }, []);

  const addRow = () => {
    setRows([...rows, { userId: '', description: '', type: 'SELECT', date: new Date().toISOString().split('T')[0], amount: 0, hours: 0 }]);
  };

  const handleRowChange = async (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
  
    if (field === 'userId') {
      updatedRows[index].type = 'SELECT'; // Reset type when userId changes
      updatedRows[index].amount = 0; // Reset amount
      updatedRows[index].hours = 0; // Reset hours
      if (!value) {
        setErrorRows([...errorRows, index]); // Add error for row if user not selected
      } else {
        setErrorRows(errorRows.filter((errIndex) => errIndex !== index)); // Remove error if user is selected
      }
    }
  
    if (field === 'type' && !value) {
      updatedRows[index].type = 'SELECT'; // Reset type if selection is cleared
    }
  
    if (field === 'type') {
      updatedRows[index].hours = 0; // Reset hours when type changes
      if (value === 'ABSENT' || value === 'HALF_DAY' || value === 'HOURLY_DEDUCTION') {
        const amount = await fetchAmount(updatedRows[index].userId, value, updatedRows[index].hours);
        updatedRows[index].amount = amount;
      } else if (value === 'ADVANCE') {
        // For ADVANCE type, set amount as editable (default to 0 if not fetched)
        updatedRows[index].amount = updatedRows[index].amount || 0;
      }
    } else if (field === 'hours' && updatedRows[index].type === 'HOURLY_DEDUCTION') {
      const parsedHours = parseFloat(value);
      if (!isNaN(parsedHours) && parsedHours >= 0) {
        updatedRows[index].hours = parsedHours; // Set the hours value correctly
        const amount = await fetchAmount(updatedRows[index].userId, updatedRows[index].type, parsedHours);
        updatedRows[index].amount = amount;
      } else {
        updatedRows[index].hours = 0; // Reset hours if invalid input
      }
    }
  
    setRows(updatedRows);
  };
  
  const fetchAmount = async (userId, type, hours) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/getUserSalaryAmount`, {
        params: {
          userId,
          type,
          hours,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching amount:', error);
      return 0; // Default to 0 if there's an error
    }
  };

  const deleteRow = (index) => {
    const updatedRows = rows.filter((row, i) => i !== index);
    setRows(updatedRows);
    setErrorRows(errorRows.filter((errIndex) => errIndex !== index)); // Remove error if row is deleted
  };

  const checkSalaryStatus = async () => {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const storeId = userData?.storeId;
    let hasError = false;
  
    const updatedRows = await Promise.all(rows.map(async (row, index) => {
      if (!row.userId || row.type === 'SELECT') return row; // Skip empty rows
  
      try {
        const response = await axios.get(`${API_BASE_URL}/user/salary/checkStatus`, {
          params: { employeeId: row.userId, storeId: storeId, date: row.date },
        });
  
        if (response.data !== 'NOT_PRESENT') {
          hasError = true;
          return { ...row, error: response.data }; // Store the error message in the row
        }
      } catch (error) {
        console.error('Error checking salary status:', error);
        hasError = true;
        return { ...row, error: 'Error checking status' };
      }
  
      return { ...row, error: '' }; // No error if NOT_PRESENT
    }));
  
    setRows(updatedRows); // Update state with error messages
    return !hasError;
  };
  


  const handleUpdate = async () => {
    const isValid = await checkSalaryStatus();
    
    if (!isValid) {
      return;
    }
  
    const filteredRows = rows.filter(row => row.userId !== '' && row.type !== 'SELECT');
    
    try {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const storeId = userData?.storeId;
  
      const response = await axios.post(`${API_BASE_URL}/user/salary/update?storeId=${storeId}`, filteredRows);
      console.log('Update response:', response.data);
  
      if (response.data === 'Success') {
        setPopupStatus('success');
        setRows([]); // Clear table upon successful update
      } else {
        setPopupStatus('failed');
      }
      setShowPopup(true);
  
    } catch (error) {
      console.error('Error updating salaries:', error);
      setPopupStatus('failed');
      setShowPopup(true);
    }
  };
  
  

  const closePopup = () => {
    setShowPopup(false);
    setPopupStatus(null); // Reset popup status
  };

  return (
    <div>
      <h2>Salary Register</h2>
      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Description</th>
            <th>Type</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <select value={row.userId} onChange={(e) => handleRowChange(index, 'userId', e.target.value)}>
                  <option value="">Select Employee</option>
                  {userList.map((user) => (
                    <option key={user.employeeName} value={user.employeeName}>{user.employeeName}</option>
                  ))}
                </select>
                {row.error && <div className="error-message">{row.error}</div>}
              </td>
              <td>
                <input type="text" value={row.description} onChange={(e) => handleRowChange(index, 'description', e.target.value)} />
              </td>
              <td>
                <select value={row.type} onChange={(e) => handleRowChange(index, 'type', e.target.value)}>
                  <option value="SELECT">SELECT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="HALF_DAY">HALF DAY</option>
                  <option value="ADVANCE">ADVANCE</option>
                </select>
              </td>
              <td>
                <input type="date" value={row.date} onChange={(e) => handleRowChange(index, 'date', e.target.value)} />
              </td>
              <td>
                <input type="number" value={row.amount} readOnly />
              </td>
              <td>
                <button onClick={() => setRows(rows.filter((_, i) => i !== index))}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow}>Add</button>
      <button onClick={handleUpdate}>Update</button>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            {popupStatus === 'success' ? <p>Update successful!</p> : <p>Update failed!</p>}
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryRegister;