import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { API_BASE_URL } from "../Config.js";

const SalesReportGraph = () => {
  const [salesDataByDate, setSalesDataByDate] = useState([]);
  const [salesDataByMonth, setSalesDataByMonth] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loadingDate, setLoadingDate] = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [fyy, setFyy] = useState(''); // For financial year
  const [years, setYears] = useState([]); // For dropdown of financial years

  useEffect(() => {
    // Generate financial years for dropdown
    const currentYear = new Date().getFullYear();
    const financialYears = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      financialYears.push(`${i}-${i + 1}`);
    }
    setYears(financialYears);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesDataByDate();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (fyy) {
      fetchSalesDataByMonth();
    }
  }, [fyy]);

  const fetchSalesDataByDate = async () => {
    setLoadingDate(true);
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const storeId = user ? user.storeId : '';
      const response = await axios.get(`${API_BASE_URL}/sales/report/salesByDate`, {
        params: {
          startDate: startDate,
          endDate: endDate,
          storeId: storeId,
        },
      });
      setSalesDataByDate(response.data || []); // Ensure data is an array
    } catch (error) {
      console.error('Error fetching sales data by date:', error);
      setSalesDataByDate([]); // Set to empty array on error
    }
    setLoadingDate(false);
  };

  const fetchSalesDataByMonth = async () => {
    setLoadingMonth(true);
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const storeId = user ? user.storeId : '';
      const response = await axios.get(`${API_BASE_URL}/sales/report/salesByMonth`, {
        params: {
          fy: fyy,
          storeId: storeId,
        },
      });
      setSalesDataByMonth(response.data || []); // Ensure data is an array
    } catch (error) {
      console.error('Error fetching sales data by month:', error);
      setSalesDataByMonth([]); // Set to empty array on error
    }
    setLoadingMonth(false);
  };

  const formatSalesDataByDate = salesDataByDate.map(item => ({
    salesDate: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(item.salesDate)),
    salesAmount: item.salesAmount,
  }));

  const formatSalesDataByMonth = (salesDataByMonth || []).map(item => ({
    salesMonth: item.salesMonth,
    salesAmount: item.salesAmount,
  }));

  return (
    <div>
      <h2>Sales Reports</h2>

      {/* Flex Container for Graphs */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Sales Report by Date */}
        <div style={{ width: '45%' }}>
          <h3>Sales Report by Date</h3>
          <div style={{ marginBottom: '20px' }}>
            <label>Start Date: </label>
            <input type="date" onChange={e => setStartDate(e.target.value)} />
            
            <label style={{ marginLeft: '20px' }}>End Date: </label>
            <input type="date" onChange={e => setEndDate(e.target.value)} />
          </div>

          {loadingDate ? (
            <p>Loading...</p>
          ) : (
            <BarChart
              width={600}
              height={400}
              data={formatSalesDataByDate}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="salesDate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="salesAmount" fill="#8884d8" />
            </BarChart>
          )}
        </div>

        {/* Sales Report by Month */}
        <div style={{ width: '45%' }}>
          <h3>Sales Report by Month</h3>
          <div style={{ marginBottom: '20px' }}>
            <label>Financial Year: </label>
            <select onChange={e => setFyy(e.target.value)} value={fyy}>
              <option value="">Select Financial Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {loadingMonth ? (
            <p>Loading...</p>
          ) : (
            <BarChart
              width={600}
              height={400}
              data={formatSalesDataByMonth}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="salesMonth" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="salesAmount" fill="#82ca9d" />
            </BarChart>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReportGraph;
