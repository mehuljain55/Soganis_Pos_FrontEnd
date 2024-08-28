import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import './BillDetails.css';

const BillDetails = ({ userData }) => {
    const [billNo, setBillNo] = useState('');
    const [billData, setBillData] = useState(null);
    const [returnedItems, setReturnedItems] = useState({}); // Track returned items

    const handleInputChange = (event) => {
        setBillNo(event.target.value);
    };

    const fetchBill = () => {
        axios.get(`${API_BASE_URL}/getBill/${billNo}`)
            .then(response => {
                setBillData(response.data);
            })
            .catch(error => {
                console.error('Error fetching bill data:', error);
            });
    };

    const handleReturn = (sno, itemBarcodeID) => {
        axios.post(`${API_BASE_URL}/return_stock/bill`, null, {
            params: {
                sno: sno,
                barcodeId: itemBarcodeID
            }
        })
        .then(response => {
            console.log('Item returned:', response.data);
            setReturnedItems(prevState => ({
                ...prevState,
                [sno]: true
            }));
        })
        .catch(error => {
            console.error('Error returning item:', error);
        });
    };

    return (
        <div className="bill-detail">
            <h1>Bill Details</h1>

            <div>
                <label htmlFor="billNo">Enter Bill No:</label>
                <input
                    type="text"
                    id="billNo"
                    value={billNo}
                    onChange={handleInputChange}
                    placeholder="Enter bill number"
                />
                <button onClick={fetchBill}>Fetch Bill</button>
            </div>

            {billData && (
                <>
                    <p><strong>Bill No:</strong> {billData.billNo}</p>
                    <p><strong>User ID:</strong> {billData.userId}</p>
                    <p><strong>Bill Date:</strong> {billData.bill_date}</p>
                    <p><strong>Customer Name:</strong> {billData.customerName || 'N/A'}</p>
                    <p><strong>Payment Mode:</strong> {billData.paymentMode}</p>
                    <p><strong>Final Amount:</strong> {billData.final_amount}</p>

                    <h2>Items</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Serial No</th>
                                <th>Item Barcode ID</th>
                                <th>Item Type</th>
                                <th>Item Color</th>
                                <th>Item Size</th>
                                <th>Item Category</th>
                                <th>Quantity</th>
                                <th>Sell Price</th>
                                <th>Total Amount</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billData.bill.map((item) => (
                                <tr key={item.sno}>
                                    <td>{item.sno}</td>
                                    <td>{item.itemBarcodeID}</td>
                                    <td>{item.itemType}</td>
                                    <td>{item.itemColor}</td>
                                    <td>{item.itemSize}</td>
                                    <td>{item.itemCategory}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.sellPrice}</td>
                                    <td>{item.total_amount}</td>
                                    <td>
                                        {returnedItems[item.sno] ? (
                                            <button disabled>Item Returned</button>
                                        ) : (
                                            <button onClick={() => handleReturn(item.sno, item.itemBarcodeID)}>Return</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default BillDetails;
