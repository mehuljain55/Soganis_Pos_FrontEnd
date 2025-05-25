import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransactionView.css';
import { FETCH_TRANSACTION_BY_DATE_URL } from '../Api/ApiConstants';

const TransactionView = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [showCustomDate, setShowCustomDate] = useState(false);

    const getUserData = () => {
        const user = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');

        return {
            user: user ? JSON.parse(user) : null,
            token: token || null
        };
    };

    const fetchTransactions = async (start, end) => {
        setLoading(true);
        setError('');
        
        try {
            const { user, token } = getUserData();
            
            if (!user || !token) {
                setError('Please login to view transactions');
                setLoading(false);
                return;
            }

            const requestData = {
                user: user,
                token: token,
                startDate: new Date(start),
                endDate: new Date(end)
            };

            const response = await axios.post(`${FETCH_TRANSACTION_BY_DATE_URL}`, requestData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.status === 'success') {
                setTransactions(response.data.payload || []);
                setError('');
            } else if (response.data.status === 'not_found') {
                setTransactions([]);
                setError('No transactions found');
            } else {
                setError(response.data.message || 'Failed to fetch transactions');
                setTransactions([]);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
            if (err.response?.status === 401) {
                setError('Unauthorized access. Please login again.');
            } else {
                setError('Error fetching transactions. Please try again.');
            }
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const getDateRange = (period) => {
        const today = new Date();
        const start = new Date();
        
        switch (period) {
            case 'today':
                return { start: today, end: today };
            case 'week':
                start.setDate(today.getDate() - 6);
                return { start, end: today };
            case 'month':
                start.setMonth(today.getMonth());
                start.setDate(1);
                return { start, end: today };
            case 'prevMonth':
                const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                return { start: prevMonth, end: prevMonthEnd };
            case 'quarter':
                const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
                return { start: quarterStart, end: today };
            case 'fy':
                const fyStart = new Date(today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1, 3, 1);
                return { start: fyStart, end: today };
            default:
                return { start: today, end: today };
        }
    };

    const handleQuickFilter = (period) => {
        const { start, end } = getDateRange(period);
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        
        setStartDate(startStr);
        setEndDate(endStr);
        setShowCustomDate(false);
        fetchTransactions(startStr, endStr);
    };

    const handleCustomDateSubmit = () => {
        fetchTransactions(startDate, endDate);
        setShowCustomDate(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN').format(Math.abs(amount));
    };

    const getTransactionTypeLabel = (type) => {
        switch (type) {
            case 'BILL':
                return 'RETAIL';
            case 'EXPENSE':
                return 'EXPENSE';
            case 'INCOME':
                return 'INCOME';
            case 'TRANSFER':
                return 'TRANSFER';
            default:
                return type;
        }
    };



    useEffect(() => {
        handleQuickFilter('today');
    }, []);

    return (
        <div className="transaction-view-container">
            <div className="tv-main-content">
                {/* Header Section */}
                <div className="tv-header">
                    <h1 className="tv-title">Transaction</h1>
                    <div className="tv-date-display">
                        <div className="tv-date-item">
                            <span className="tv-date-label">Start Date:</span>
                            <span className="tv-date-value">{formatDate(startDate)}</span>
                        </div>
                        <div className="tv-date-item">
                            <span className="tv-date-label">End Date:</span>
                            <span className="tv-date-value">{formatDate(endDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="tv-error-message">
                        {error}
                    </div>
                )}

                {/* Filter Buttons */}
                <div className="tv-filter-section">
                    <div className="tv-filter-buttons">
                        <button 
                            onClick={() => handleQuickFilter('today')}
                            className="tv-filter-btn"
                        >
                            Today
                        </button>
                        <button 
                            onClick={() => handleQuickFilter('week')}
                            className="tv-filter-btn tv-filter-btn-active"
                        >
                            This Week
                        </button>
                        <button 
                            onClick={() => handleQuickFilter('month')}
                            className="tv-filter-btn"
                        >
                            This Month
                        </button>
                        <button 
                            onClick={() => handleQuickFilter('prevMonth')}
                            className="tv-filter-btn"
                        >
                            Previous Month
                        </button>
                        <button 
                            onClick={() => handleQuickFilter('quarter')}
                            className="tv-filter-btn"
                        >
                            This Quarter
                        </button>
                        <button 
                            onClick={() => handleQuickFilter('fy')}
                            className="tv-filter-btn"
                        >
                            This FY
                        </button>
                        <button 
                            onClick={() => setShowCustomDate(!showCustomDate)}
                            className="tv-filter-btn"
                        >
                            Custom Date
                        </button>
                    </div>

                    {/* Custom Date Picker */}
                    {showCustomDate && (
                        <div className="tv-custom-date">
                            <div className="tv-date-inputs">
                                <div className="tv-date-input-group">
                                    <label>Start Date:</label>
                                    <input 
                                        type="date" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="tv-date-input"
                                    />
                                </div>
                                <div className="tv-date-input-group">
                                    <label>End Date:</label>
                                    <input 
                                        type="date" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="tv-date-input"
                                    />
                                </div>
                                <button 
                                    onClick={handleCustomDateSubmit}
                                    className="tv-apply-btn"
                                    disabled={loading}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>



                {/* Transaction Table */}
                <div className="tv-table-container">
                    {loading ? (
                        <div className="tv-loading">Loading transactions...</div>
                    ) : (
                        <table className="tv-table">
                            <thead>
                                <tr>
                                    <th>Transaction Id</th>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Transaction Type</th>
                                    <th>Payment Mode</th>
                                    <th>Amount</th>
                                    <th>User</th>
                                    <th>Store</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length > 0 ? (
                                    transactions.map((transaction, index) => (
                                        <tr key={`${transaction.transactionId}-${index}`}>
                                            <td>{transaction.transactionId}</td>
                                            <td>{transaction.date}</td>
                                            <td>{transaction.description}</td>
                                            <td>{getTransactionTypeLabel(transaction.transactionType)}</td>

                                            <td>{transaction.mode || '-'}</td>
                                            <td>₹{formatAmount(transaction.amount)}</td>

                                            <td>{transaction.userId || '-'}</td>
                                                <td>{transaction.storeId || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="tv-no-data">
                                            {error || 'No transactions found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionView;