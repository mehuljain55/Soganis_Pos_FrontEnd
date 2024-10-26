import React, { useState } from 'react';
import { API_BASE_URL } from '../Config.js';
import './SchoolSalesReport.css';

const SchoolSalesReport = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const storeId = user?.storeId;

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSalesReport = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/sales/report/school_name?startDate=${startDate}&endDate=${endDate}&storeId=${storeId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();
            setReportData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFetch = () => {
        if (startDate && endDate && storeId) {
            fetchSalesReport();
        } else {
            alert('Please select start and end dates');
        }
    };

    return (
        <div className="school-sales-report">
            <h2 className="report-title">Sales Report by School Name</h2>
            <div className="date-inputs">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-date"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-date"
                />
                <button onClick={handleFetch} className="fetch-btn">Fetch Report</button>
            </div>

            {loading && <p className="loading-message">Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && reportData.length > 0 && (
                <div className="report-table-wrapper">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>School</th>
                                <th>Sales</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((report, index) => (
                                <tr key={index}>
                                    <td>{report.schoolName}</td>
                                    <td>{report.sales}</td>
                                    <td>
                                        <button className="view-btn">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!loading && reportData.length === 0 && !error && <p className="no-data-message">No sales data available for the selected dates.</p>}
        </div>
    );
};

export default SchoolSalesReport;
