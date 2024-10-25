import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import './Invoice.css'; // Import the custom CSS file

const Invoice = () => {
    const [mobileNo, setMobileNo] = useState('');
    const [storeId, setStoreId] = useState('');
    const [billingData, setBillingData] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [stores, setStores] = useState([]);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await axios.post(`${API_BASE_URL}/store/getAllStores`);
                setStores(response.data);
            } catch (error) {
                console.error("Failed to fetch stores:", error);
            }
        };
        fetchStores();
    }, []);

    const fetchBillingDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/invoice/customerBillingList`, {
                params: { mobileNo, storeId }
            });
            setBillingData(response.data);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('No billing records found for this customer.');
            setBillingData([]);
        }
    };

    const downloadPDF = async (billNo, storeId, customerName) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/invoice/getBill`, null, {
                params: { billNo, storeId, customerName },
                responseType: 'blob'
            });
            const pdfUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.setAttribute('download', `${customerName}_${billNo}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download PDF:", error);
        }
    };

    return (
        <div className="customer-invoice">
            <h1 className="customer-invoice__heading">Soganis Dresses</h1>
            <div className="customer-invoice__form-container">
                <h2 className="customer-invoice__subheading">Customer Billing Details</h2>
                <div className="customer-invoice__form-group">
                    <label htmlFor="mobileNo" className="customer-invoice__label">Mobile Number:</label>
                    <input
                        type="text"
                        id="mobileNo"
                        className="customer-invoice__input-field"
                        value={mobileNo}
                        onChange={(e) => setMobileNo(e.target.value)}
                    />
                </div>
                <div className="customer-invoice__form-group">
                    <label htmlFor="storeId" className="customer-invoice__label">Store:</label>
                    <select
                        id="storeId"
                        className="customer-invoice__input-field"
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                    >
                        <option value="">Select Store</option>
                        {stores.map(store => (
                            <option key={store.storeId} value={store.storeId}>
                                {store.storeName} - {store.address}
                            </option>
                        ))}
                    </select>
                </div>
                <button className="customer-invoice__fetch-button" onClick={fetchBillingDetails}>
                   Get Bill
                </button>

                {errorMessage && <p className="customer-invoice__error-message">{errorMessage}</p>}

                {billingData.length > 0 && (
                    <div className="customer-invoice__table-container">
                        <table className="customer-invoice__billing-table">
                            <thead>
                                <tr>
                                    <th>Bill No</th>
                                    <th>Date</th>
                                    <th>Customer Name</th>
                                    <th>Payment Mode</th>
                                    <th>School Name</th>
                                    <th>Final Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billingData.map((bill) => (
                                    <tr key={bill.billNo}>
                                        <td>{bill.billNo}</td>
                                        <td>{new Date(bill.bill_date).toLocaleDateString('en-GB')}</td>
                                        <td>{bill.customerName}</td>
                                        <td>{bill.paymentMode}</td>
                                        <td>{bill.schoolName}</td>
                                        <td>{bill.final_amount}</td>
                                        <td>
                                            <button
                                                className="customer-invoice__download-button"
                                                onClick={() => downloadPDF(bill.billNo, bill.storeId, bill.customerName)}
                                            >
                                                Download PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Invoice;
