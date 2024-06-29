import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './Config'; // Assuming you have a Config file for API base URL
import './SalaryGenerator.css'; // Import your CSS file for styling

const SalaryGenerator = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(('0' + (new Date().getMonth() + 1)).slice(-2)); // default to current month in MM format
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
                <th>User ID</th>
                <th>Month FY</th>
                <th>User Name</th>
                <th>Monthly Salary</th>
                <th>Salary Deducted</th>
                <th>Advance Salary</th>
                <th>Final Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((salary, index) => (
                <tr key={index}>
                  <td>{salary.userId}</td>
                  <td>{salary.month_fy}</td>
                  <td>{salary.user_name}</td>
                  <td>{salary.monthlySalary}</td>
                  <td>{salary.salaryDeducted}</td>
                  <td>{salary.advanceSalary}</td>
                  <td>{salary.finalAmount}</td>
                  <td>{salary.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Generate Salaries to view</p>
        )}
      </div>
    </div>
  );
};

export default SalaryGenerator;
