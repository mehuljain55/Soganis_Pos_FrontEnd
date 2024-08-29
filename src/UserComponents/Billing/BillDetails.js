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
    const [returnQuantities, setReturnQuantities] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupType, setPopupType] = useState('');

    const handleInputChange = (event) => {
        setBillNo(event.target.value);
    };

    const fetchBill = () => {
        axios.get(`${API_BASE_URL}/getBill/${billNo}`)
            .then(response => {
                setBillData(response.data);
                setSelectedItems([]);
                setReturnedItems({});
                setReturnQuantities({});
            })
            .catch(error => {
                console.error('Error fetching bill data:', error);
            });
    };

    const handleQuantityChange = (sno, value) => {
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue) || parsedValue <= 0) {
            setReturnQuantities(prevState => ({
                ...prevState,
                [sno]: 0,
            }));
            return;
        }
        if (parsedValue > billData.bill.find(item => item.sno === sno).quantity) {
            alert('Return quantity cannot exceed available quantity.');
            setReturnQuantities(prevState => ({
                ...prevState,
                [sno]: 0,
            }));
        } else {
            setReturnQuantities(prevState => ({
                ...prevState,
                [sno]: parsedValue,
            }));
        }
    };

    const handleSelectItem = (item) => {
        if (!returnedItems[item.sno]) {
            setSelectedItems(prevState => [...prevState, item]);
            setReturnQuantities(prevState => ({ ...prevState, [item.sno]: 0 }));
        }
    };

    const confirmReturn = () => {
        const allQuantitiesValid = selectedItems.every(item => {
            const returnQuantity = returnQuantities[item.sno];
            return returnQuantity !== undefined && returnQuantity > 0;
        });

        if (!allQuantitiesValid) {
            alert('Please enter a valid return quantity for all selected items.');
            return;
        }

        const itemsToReturn = selectedItems.map(item => ({
            sno: item.sno,
            barcodedId: item.itemBarcodeID,
            return_quantity: returnQuantities[item.sno],
        }));

        for (const item of selectedItems) {
            if (returnQuantities[item.sno] > item.quantity) {
                alert('Return quantity cannot exceed available quantity.');
                return;
            }
        }

        axios.post(`${API_BASE_URL}/return_stock/bill`, itemsToReturn)
            .then(response => {
                if (response.data.success) {
                    setPopupMessage('Item returned');
                    setPopupType('success');
                } else {
                    setPopupMessage('Please try again');
                    setPopupType('error');
                }
                setShowPopup(true);
                fetchBill(); // Refetch bill data after return
                setReturnedItems(prevState => {
                    const newReturnedItems = { ...prevState };
                    itemsToReturn.forEach(item => {
                        newReturnedItems[item.sno] = true;
                    });
                    return newReturnedItems;
                });
                setIsModalOpen(false);
                setSelectedItems([]);
            })
            .catch(error => {
                console.error('Error returning items:', error);
                setPopupMessage('Please try again');
                setPopupType('error');
                setShowPopup(true);
            });
    };

    const handleExchange = (sno, itemBarcodeID) => {
        console.log(`Exchange item with Serial No: ${sno} and Barcode ID: ${itemBarcodeID}`);
    };

    const isToday = (date) => {
        return date === currentDate;
    };

    const calculateTotalAmount = () => {
        return selectedItems.reduce((total, item) => {
            const returnQuantity = returnQuantities[item.sno] || 0;
            return total + (item.sellPrice * returnQuantity);
        }, 0);
    };

    // Popup component definition
    const Popup = ({ message, type, onClose }) => {
        return (
            <div className={`popup ${type}`}>
                <div className="popup-content">
                    <p>{message}</p>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        );
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
                    <table>
                        <tr>
                            <td><p><strong>Bill No:</strong> {billData.billNo}</p></td>
                            <td><p><strong>Cashier:</strong> {billData.userId}</p></td>
                            <td><p><strong>Bill Date:</strong> {billData.bill_date}</p></td>
                        </tr>
                        <tr>
                            <td><p><strong>Customer Name:</strong> {billData.customerName || 'N/A'}</p></td>
                            <td><p><strong>Payment Mode:</strong> {billData.paymentMode}</p></td>
                            <td><p><strong>Final Amount:</strong> {billData.final_amount}</p></td>
                        </tr>
                    </table>
                    <h2>Items</h2>
                    <table className='bill-detail-table'>
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
                                        ) : selectedItems.find(selectedItem => selectedItem.sno === item.sno) ? (
                                            <span style={{ color: 'green' }}>Item Selected</span>
                                        ) : (
                                            <>
                                                {isToday(billData.bill_date) && (
                                                    <button onClick={() => handleSelectItem(item)}>Select</button>
                                                )}
                                                <button id='exchange-btn' onClick={() => handleExchange(item.sno, item.itemBarcodeID)}>Exchange</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {selectedItems.length > 0 && (
                        <button onClick={() => setIsModalOpen(true)}>Return Selected Items</button>
                    )}
                </>
            )}

            {isModalOpen && (
                <div className="bill-detail-return-modal">
                    <div className="bill-detail-return-modal-content">
                        <h2>Return Items</h2>
                        <table className="bill-detail-return-items-table">
                            <thead>
                                <tr>
                                    <th>Barcode ID</th>
                                    <th>Name</th>
                                    <th>School</th>
                                    <th>Price</th>
                                    <th>Available Quantity</th>
                                    <th>Return Quantity</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItems.map((item) => {
                                    const amount = item.sellPrice * (returnQuantities[item.sno] || 0);
                                    return (
                                        <tr key={item.sno}>
                                            <td>{item.itemBarcodeID}</td>
                                            <td>{item.itemType}</td> 
                                            <td>{item.itemCategory}</td>
                                            <td>{item.sellPrice}</td>
                                            <td>{item.quantity}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={returnQuantities[item.sno] || ''}
                                                    onChange={(e) => handleQuantityChange(item.sno, e.target.value)}
                                                />
                                            </td>
                                            <td>{amount}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="bill-detail-return-modal-actions">
                            <p><strong>Total Amount:</strong> {calculateTotalAmount()}</p>
                            <button onClick={confirmReturn}>Confirm Return</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showPopup && (
                <Popup
                    message={popupMessage}
                    type={popupType}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </div>
    );
};

const Popup = ({ message, type, onClose }) => {
    return (
        <div className={`popup ${type}`}>
            <div className="popup-content">
                <p>{message}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default BillDetails;
