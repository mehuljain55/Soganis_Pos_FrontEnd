import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SalaryRegister.css'; // CSS file for styling
import { API_BASE_URL } from '../Config.js';

const SalaryBulkPosting = () => {
    const [userList, setUserList] = useState([]);
    const [rows, setRows] = useState([
      { userId: '', description: '', type: 'SELECT', startDate: '', endDate: '', amount: 0, hours: 0 }
    ]);
    const [errorRows, setErrorRows] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupStatus, setPopupStatus] = useState(null);
  
    useEffect(() => {
      const fetchUserList = async () => {
        try {
          const userData = JSON.parse(sessionStorage.getItem('user'));
          const storeId = userData?.storeId;
          if (storeId) {
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
  
    const fetchAmount = async (userId, type, hours, startDate, endDate) => {
      if (!userId || !type || !startDate || !endDate) return 0;
      try {
        const response = await axios.get(`${API_BASE_URL}/user/bulk_posting/getUserSalaryAmount`, {
          params: { userId, type, hours, startDate, endDate },
        });
        return response.data || 0;
      } catch (error) {
        console.error('Error fetching amount:', error);
        return 0;
      }
    };


    const handleUpdate = async () => {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const storeId = userData?.storeId;
  
      if (!storeId) {
          console.error('Store ID not found in user data');
          return;
      }
  
      const validRows = rows.filter(row => row.amount > 0);
  
      if (validRows.length === 0) {
          console.warn('No valid rows with amount > 0 to update');
          return;
      }
  
      try {
          const response = await axios.post(`${API_BASE_URL}/user/salary/bulk/update`, validRows, {
              params: { storeId: storeId },
              headers: {
                  'Content-Type': 'application/json'
              }
          });
  
          console.log(response.data)
          if (response.data === 'SUCCESS') {
              setPopupStatus('Success! Salaries updated.');
              // Remove only the rows that were sent
              setRows(rows.filter(row => row.amount === 0));
          } else {
              setPopupStatus('Failed to update salaries.');
          }
      } catch (error) {
          console.error('Error updating salaries:', error);
          setPopupStatus('Error updating salaries.');
      } finally {
          setShowPopup(true);
      }
  };
  
    
    const addRow = () =>{
        setRows([...rows, { userId: '', description: '', type: 'SELECT', startDate: '', endDate: '', amount: 0, hours: 0 }])
    }


    const deleteRow = (index) => {
        setRows(rows.filter((_, i) => i !== index));
      };
      
  
    const handleRowChange = async (index, field, value) => {
      const updatedRows = [...rows];
      updatedRows[index] = { ...updatedRows[index], [field]: value };
      
      if (['userId', 'type', 'startDate', 'endDate'].includes(field)) {
        updatedRows[index].hours = 0;
        const { userId, type, startDate, endDate, hours } = updatedRows[index];
        updatedRows[index].amount = await fetchAmount(userId, type, hours, startDate, endDate);
      }
      
      if (field === 'hours' && ['HOURLY_DEDUCTION', 'EXTRA_HOUR'].includes(updatedRows[index].type)) {
        const parsedHours = parseFloat(value);
        updatedRows[index].hours = isNaN(parsedHours) || parsedHours < 0 ? 0 : parsedHours;
        updatedRows[index].amount = await fetchAmount(updatedRows[index].userId, updatedRows[index].type, parsedHours, updatedRows[index].startDate, updatedRows[index].endDate);
      }
      
      setRows(updatedRows);
    };
  
    return (
      <div>
        <h2>Bulk Posting</h2>
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Hours</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={errorRows.includes(index) ? 'error-row' : ''}>
                <td>
                  <select value={row.userId} onChange={(e) => handleRowChange(index, 'userId', e.target.value)}>
                    <option value="">Select Employee</option>
                    {userList.map((user) => (
                      <option key={user.employeeName} value={user.employeeName}>{user.employeeName}</option>
                    ))}
                  </select>
                </td>
                <td><input type="text" value={row.description} onChange={(e) => handleRowChange(index, 'description', e.target.value)} /></td>
                <td>
                  <select value={row.type} onChange={(e) => handleRowChange(index, 'type', e.target.value)} disabled={!row.userId}>
                    <option value="">SELECT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="HALF_DAY">HALF DAY</option>
                    <option value="ADVANCE">ADVANCE</option>
                    <option value="HOURLY_DEDUCTION">HOURLY DEDUCTION</option>
                    <option value="EXTRA_DAY">EXTRA DAY</option>
                    <option value="EXTRA_HOUR">EXTRA HOURS</option>
                  </select>
                </td>
                <td>
                  {(row.type === 'HOURLY_DEDUCTION' || row.type === 'EXTRA_HOUR') && (
                    <input type="number" value={row.hours} step="0.1" min="0" onChange={(e) => handleRowChange(index, 'hours', e.target.value)} />
                  )}
                </td>
                <td><input type="date" value={row.startDate} onChange={(e) => handleRowChange(index, 'startDate', e.target.value)} /></td>
                <td><input type="date" value={row.endDate} onChange={(e) => handleRowChange(index, 'endDate', e.target.value)} /></td>
                <td><input type="number" value={row.amount} readOnly /></td>
                <td><button onClick={() => deleteRow(index)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() =>addRow()}>Add</button>
        <button onClick={() =>handleUpdate()}>Update</button>
      </div>
    );
  };
  
  export default SalaryBulkPosting;
  