import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import './BillDetails.css';

const BillDetails = ({ userData }) => {
    const [billNo, setBillNo] = useState('');
    const [billData, setBillData] = useState(null);
    const [returnedItems, setReturnedItems] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [returnQuantity, setReturnQuantity] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null); // To keep track of the item being returned

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

    const handleReturn = (item) => {
        setSelectedItem(item);
        setReturnQuantity(0); // Reset return quantity when opening modal
        setIsModalOpen(true);
    };

    const confirmReturn = () => {
        if (returnQuantity > selectedItem.quantity) {
            alert('Return quantity cannot exceed available quantity.');
            return;
        }

        axios.post(`${API_BASE_URL}/return_stock/bill`, null, {
            params: {
                sno: selectedItem.sno,
                barcodeId: selectedItem.itemBarcodeID,
                quantity: returnQuantity
            }
        })
        .then(response => {
            console.log('Item returned:', response.data);
            setReturnedItems(prevState => ({
                ...prevState,
                [selectedItem.sno]: true
            }));
            setIsModalOpen(false);
        })
        .catch(error => {
            console.error('Error returning item:', error);
        });
    };

    const handleExchange = (sno, itemBarcodeID) => {
        console.log(`Exchange item with Serial No: ${sno} and Barcode ID: ${itemBarcodeID}`);
    };

    const isToday = (date) => {
        return date === currentDate;
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
                                            <>
                                                {isToday(billData.bill_date) && (
                                                    <button onClick={() => handleReturn(item)}>Return</button>
                                                )}
                                                <button onClick={() => handleExchange(item.sno, item.itemBarcodeID)}>Exchange</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Return Item</h2>
                        <p>Barcode Id: {selectedItem.itemBarcodeID}</p>
                        <p>Name: {selectedItem.itemType}</p>
                        <p>School: {selectedItem.itemCategory}</p>
                 
                        <p>Available Quantity: {selectedItem.quantity}</p>
                        <label>
                            Return Quantity:
                            <input
                                type="number"
                                value={returnQuantity}
                                onChange={(e) => setReturnQuantity(e.target.value)}
                                max={selectedItem.quantity}
                            />
                        </label>
                        <div className="modal-actions">
                            <button onClick={confirmReturn}>Confirm Return</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillDetails;
