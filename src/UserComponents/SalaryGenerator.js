import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { API_BASE_URL } from './Config'; // Assuming you have a Config file for API base URL
import './SalaryGenerator.css'; // Import your CSS file for styling
import 'bootstrap/dist/css/bootstrap.min.css';

const SalaryGenerator = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(('0' + (new Date().getMonth() + 1)).slice(-2)); // default to current month in MM format
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userSalaryStatement, setUserSalaryStatement] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedMonthFy, setSelectedMonthFy] = useState(null);

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  const fetchSalaries = async () => {
    setLoading(true);
    const month_fy = `${month}_${year}`;
    try {
      const response = await axios.get(`${API_BASE_URL}/salary/generate`, {
        params: {
          month_fy: month_fy
        }
      });

      if (response.status === 200) {
        setSalaries(response.data);
        setLoading(false);
      } else {
        console.error('Failed to fetch salaries');
        setError('Failed to fetch salaries');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching salaries:', error);
      setError('Failed to fetch salaries');
      setLoading(false);
    }
  };

  const updateSalaryStatus = async (salary) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/salary/paid`, salary);
      if (response.status === 200) {
        alert(`Status Update: ${response.data}`);
        fetchSalaries(); // Refresh the data
      } else {
        alert('Failed to update salary status');
      }
    } catch (error) {
      console.error('Error updating salary status:', error);
      alert('Error updating salary status');
    }
  };

  const viewSalaryStatement = async (userId, monthFy) => {
    setSelectedUserId(userId);
    setSelectedMonthFy(monthFy);
    try {
      const response = await axios.get(`${API_BASE_URL}/salary/user_salary_statement`, {
        params: {
          userId: userId,
          month_fy: monthFy
        }
      });

      if (response.status === 200) {
        setUserSalaryStatement(response.data);
        setShowModal(true); // Show the modal when data is fetched
      } else {
        console.error('Failed to fetch user salary statement');
        setError('Failed to fetch user salary statement');
      }
    } catch (error) {
      console.error('Error fetching user salary statement:', error);
      setError('Failed to fetch user salary statement');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const years = Array.from({ length: 10 }, (v, k) => new Date().getFullYear() - k);
  const months = [
    { name: "JANUARY", value: "01" },
    { name: "FEBRUARY", value: "02" },
    { name: "MARCH", value: "03" },
    { name: "APRIL", value: "04" },
    { name: "MAY", value: "05" },
    { name: "JUNE", value: "06" },
    { name: "JULY", value: "07" },
    { name: "AUGUST", value: "08" },
    { name: "SEPTEMBER", value: "09" },
    { name: "OCTOBER", value: "10" },
    { name: "NOVEMBER", value: "11" },
    { name: "DECEMBER", value: "12" }
  ];

  return (
    <div className="salary-generator-container">
      <h5>Generate User Monthly Salary</h5>
      <div className="input-section">
        <select value={month} onChange={handleMonthChange}>
          {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
        </select>
        <select value={year} onChange={handleYearChange}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="button-section">
        <button onClick={fetchSalaries} disabled={loading}>Generate</button>
      </div>
      <div className="result-section">
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {salaries.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>User Name</th>
                <th>Monthly Salary</th>
                <th>Salary Deducted</th>
                <th>Advance Salary Paid</th>
                <th>
    Final Amount
    <br />
    <small> Amount = MS - AP - SD</small>
  </th>
                <th>Month FY</th>
                <th>Status</th>
                <th>View</th>
      
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((salary, index) => (
                <tr key={index}>
                  <td>{salary.user_name}</td>
                  <td>{salary.monthlySalary}</td>
                  <td>{salary.salaryDeducted}</td>
                  <td>{salary.advanceSalary}</td>
                  <td>{salary.finalAmount}</td>
                  <td>{salary.month_fy}</td>
                  <td>{salary.status}</td>
                  <td>
                  <button onClick={() => viewSalaryStatement(salary.userId, salary.month_fy)} >View</button>
                  </td>
                 <td>
                    {salary.status === 'PENDING' && (
                      <button  onClick={() => updateSalaryStatus(salary)}>Mark as Paid</button>
                    )}
                 </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Generate Salaries to view</p>
        )}
      </div>
      <Modal className="salary-pop-up" show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>User Salary Statement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userSalaryStatement.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {userSalaryStatement.map((item, index) => (
                  <tr key={index}>
                    <td className="wrap-text">{item.description}</td>
                    <td>{item.type}</td>
                    <td>{new Date(item.date).toLocaleDateString('en-GB')}</td>
                    <td>{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No salary statement available for this user.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SalaryGenerator;
