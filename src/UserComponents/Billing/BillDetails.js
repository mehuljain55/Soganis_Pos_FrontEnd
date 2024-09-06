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
    const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false); // New state for exchange modal
    const [returnQuantities, setReturnQuantities] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupType, setPopupType] = useState('');
    const [defectItem, setDefectItem] = useState(null);
const [defectQuantity, setDefectQuantity] = useState(0);
const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);


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
            price:item.sellPrice,
            userId:userData.userId,
            return_quantity: returnQuantities[item.sno],
        }));

        axios.post(`${API_BASE_URL}/return_stock/bill`, itemsToReturn)
            .then(response => {
                if (response.data === 'success') {
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

    const handleExchange = () => {
        const itemsToExchange = selectedItems.map(item => ({
            sno: item.sno,
            barcodedId: item.itemBarcodeID,
            price:item.sellPrice,
            userId:userData.userId,
            return_quantity: returnQuantities[item.sno],
        }));

        axios.post(`${API_BASE_URL}/stock/exchange`, itemsToExchange)
            .then(response => {
                if (response.data === 'success') {
                    setPopupMessage('Item exchanged successfully');
                    setPopupType('success');
                } else {
                    setPopupMessage('Exchange failed. Please try again.');
                    setPopupType('error');
                }
                setShowPopup(true);
                fetchBill(); // Refetch bill data after exchange
                setIsExchangeModalOpen(false);
                setSelectedItems([]);
            })
            .catch(error => {
                console.error('Error exchanging items:', error);
                setPopupMessage('Exchange failed. Please try again.');
                setPopupType('error');
                setShowPopup(true);
            });
    };

    const isToday = (date) => date === currentDate;

    const calculateTotalAmount = () => selectedItems.reduce((total, item) => {
        const returnQuantity = returnQuantities[item.sno] || 0;
        return total + (item.sellPrice * returnQuantity);
    }, 0);

    const handleDefectItem = (item) => {
        setDefectItem(item);
        setDefectQuantity(0);
        setIsDefectModalOpen(true);
    };
    
    const confirmDefect = () => {
        axios.post(`${API_BASE_URL}/stock/defect`, {
            sno: defectItem.sno,
            barcodedId: defectItem.itemBarcodeID,
            return_quantity: defectQuantity,
            price: defectItem.sellPrice,
            userId: userData.userId // Make sure `userId` is defined
        })
        .then(response => {
            // Handle successful defect submission
            setShowPopup({ message: 'Item defected successfully!', type: 'success' });
            setIsDefectModalOpen(false);
            fetchBill(); 
            setSelectedItems([]);
        })
        .catch(error => {
            // Handle error
            setShowPopup({ message: 'Error defecting item!', type: 'error' });
        });
    };
    

    // Popup component definition
    const Popup = ({ message, type, onClose }) => (
        <div className={`popup ${type}`}>
            <div className="popup-content">
                <p>{message}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );

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
                    <table className="billdets-info">
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
                    <table className="bill-detail-table">
                        <thead>
                            <tr>
                                <th>Serial No</th>
                                <th>Item Barcode ID</th>
                                <th>Description</th>
                                
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
                                    <td>{item.description}</td>
                                    
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
                                                
                                               
                {item.status === "Returned" ? (
                    <span>Item Returned</span>
                ) : item.status === "Exchanged" ? (
                    <span>Item Exchanged</span>
                ): item.status === "Defected" ? (
                    <span>Defected Item Returned</span>
                ): item.quantity <= 0 ? (
                    <span>Item Exchanged or returned</span>
                ) : returnedItems[item.sno] ? (
                    <button disabled>Item Returned</button>
                ) : selectedItems.find(selectedItem => selectedItem.sno === item.sno) ? (
                    <span style={{ color: 'green' }}>Item Selected</span>
                ) : (
                    <>
                                <button onClick={() => handleSelectItem(item)}>Return</button>
                                <button onClick={() => handleDefectItem(item)}>Defect</button>
                            </>
                    
                )}
                                            
                                             
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {selectedItems.length > 0 && (
                        <button onClick={() => setIsModalOpen(true)}>Return / Exchange </button>
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
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Return Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItems.map((item) => (
                                    <tr key={item.sno}>
                                        <td>{item.itemBarcodeID}</td>
                                        <td>{item.itemType}</td>
                                        <td>{item.itemCategory}</td>
                                        <td>{item.sellPrice}</td>
                                        <td>
                                            <input
                                                type="number"
                                                value={returnQuantities[item.sno]}
                                                onChange={(e) => handleQuantityChange(item.sno, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p><strong>Total Return Amount:</strong> {calculateTotalAmount()}</p>
                        <div>
                            <button onClick={confirmReturn}>Return</button>
                            <button onClick={handleExchange}>Exchange</button>
                


                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
 {isDefectModalOpen && (
    <div className="unique-defect-modal">
        <div className="unique-defect-modal-content">
            <h2>Defect Item</h2>
            <table className="unique-defect-items-table">
                <thead>
                    <tr>
                        <th>Barcode ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Defect Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{defectItem.itemBarcodeID}</td>
                        <td>{defectItem.itemType}</td>
                        <td>{defectItem.itemCategory}</td>
                        <td>{defectItem.sellPrice}</td>
                        <td>
                            <input
                                type="number"
                                value={defectQuantity}
                                onChange={(e) => {
                                    const newQuantity = Number(e.target.value);
                                    if (newQuantity <= defectItem.quantity) {
                                        setDefectQuantity(newQuantity);
                                    } else {
                                        // Optionally, provide feedback to the user
                                        alert(`Defect quantity cannot exceed ${defectItem.quantity}`);
                                        setDefectQuantity(defectItem.quantity);
                                    }
                                }}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="unique-defect-buttons">
                <button onClick={confirmDefect}>Confirm Defect</button>
                <button onClick={() => setIsDefectModalOpen(false)}>Cancel</button>
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

export default BillDetails;
