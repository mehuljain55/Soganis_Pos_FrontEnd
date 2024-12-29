import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryUpdateHistory.css';
import { API_BASE_URL } from '../Config.js';

const InventoryUpdateHistory = ({ onClose }) => {
    const [data, setData] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const storeId = user ? user.storeId : '';
        axios.get(`${API_BASE_URL}/inventory/updateHistory?storeId=${storeId}`)
            .then((response) => setData(response.data))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    const toggleRow = (sno) => {
        setExpandedRows((prev) => {
            if (prev.includes(sno)) {
                return prev.filter((id) => id !== sno);
            } else {
                return [...prev, sno];
            }
        });
    };

    return (
        <div className="inventory-update-history-popup">
            <div className="inventory-update-history-popup__overlay" onClick={onClose}></div>
            <div className="inventory-update-history-popup__content">
                <h2 className="inventory-update-history__title">Inventory Update History</h2>
                <button className="inventory-update-history__close-button" onClick={onClose}>✖</button>
                <div className="inventory-update-history__table-container">
                    <table className="inventory-update-history__table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Date</th>
                                <th>School</th>
                                <th>Item List</th>
                                <th>Store ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row) => (
                                <React.Fragment key={row.sno}>
                                    <tr>
                                        <td>{row.sno}</td>
                                        <td>{row.date}</td>
                                        <td>{row.school}</td>
                                        <td>{row.itemList}</td>
                                        <td>{row.storeId}</td>
                                        <td>
                                            <button
                                                className="inventory-update-history__toggle-button"
                                                onClick={() => toggleRow(row.sno)}
                                            >
                                                {expandedRows.includes(row.sno) ? 'Hide' : 'Show'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRows.includes(row.sno) && (
                                        <tr className="inventory-update-history__sub-entries">
                                            <td colSpan="6">
                                                <table className="inventory-update-history__sub-table">
                                                    <thead>
                                                        <tr>
                                                            <th>S.No</th>
                                                            <th>Item Code</th>
                                                            <th>Description</th>
                                                            <th>Quantity</th>
                                                            <th>Store ID</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {row.inventoryUpdateLists.map((subRow) => (
                                                            <tr key={subRow.sno}>
                                                                <td>{subRow.sno}</td>
                                                                <td>{subRow.itemCode}</td>
                                                                <td>{subRow.description}</td>
                                                                <td>{subRow.quantity}</td>
                                                                <td>{subRow.storeId}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryUpdateHistory;