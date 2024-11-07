import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import './BillDetails.css';
import ExchangeBill from './ExchangeBill.js'; 
import ExchangeBillWholesale from './ExchangeBillWholesale.js'; 


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
    const [itemsToExchange, setItemsToExchange] = useState([]);
    const[billType,setBillType]=useState('');
    const [billList, setBillList] = useState([]);
    const [showBillSelectionPopup, setShowBillSelectionPopup] = useState(false);

    const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
    const [exchangeAmount, setExchangeAmount] = useState(0);

    const handleInputChange = (event) => {
        setBillNo(event.target.value);
    };

    const fetchBill = () => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const storeId = user ? user.storeId : '';
    
        axios.get(`${API_BASE_URL}/user/getBill/${billNo}/${storeId}`)
            .then(response => {
                const data = response.data;
    
                if (data.type === "single") {
                    setBillData(data.bill);  // Directly set bill data if it's a single bill
                    setShowBillSelectionPopup(false);  // Ensure popup is closed if it was open
                    setPopupMessage("");  // Clear any existing popup messages
                    setSelectedItems([]);
                } else if (data.type === "list") {
                    setBillData(null);  // Clear any existing bill data
                    setReturnedItems({});
                    setReturnQuantities({});
                    setBillList(data.billList);  // Store the list of bills for display in the popup
                    setShowBillSelectionPopup(true);  // Open popup to show bill list
                    setSelectedItems([]);
                } else {
                    alert("Bill not found");
                }
            })
            .catch(error => {
                console.error('Error fetching bill data:', error);
                setPopupMessage("An error occurred while fetching the bill");
                setPopupType("error");
                setShowPopup(true);
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

        axios.post(`${API_BASE_URL}/user/return_stock/bill`, itemsToReturn)
            .then(response => {
                if (response.data === 'success') {
                    setPopupMessage('Item returned');
                    setPopupType('success');
                } else {
                    setPopupMessage('Please try again');
                    setPopupType('error');
                }
                setShowPopup(true);
          
                setReturnedItems(prevState => {
                    const newReturnedItems = { ...prevState };
                    itemsToReturn.forEach(item => {
                        newReturnedItems[item.sno] = true;
                    });
                    return newReturnedItems;
                });
                setIsModalOpen(false);
                setSelectedItems([]);
                fetchBill(); // Refetch bill data after return
            })
            .catch(error => {
                console.error('Error returning items:', error);
                setPopupMessage('Please try again');
                setPopupType('error');
                setShowPopup(true);
            });
    };

    const handleSelectBill = (bill) => {
        setBillData(bill);  // Set selected bill as billData
        setShowBillSelectionPopup(false);
          // Close the popup
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };
    const handleExchange = () => {
        if (selectedItems.length > 0) {
            setBillType(selectedItems[0].billCategory);
        }
        const exchangeItems = selectedItems.map(item => ({
            sno: item.sno,
            barcodedId: item.itemBarcodeID,
            price: item.sellPrice,
            itemType:item.itemType,
            billCategory: item.billCategory,
            itemCategory:item.itemCategory,
            userId: userData.userId,
            return_quantity: returnQuantities[item.sno],
        }));
    
        setItemsToExchange(exchangeItems); // Set the globally accessible state
    
                    const exchangeAmount = calculateTotalAmount(); // Calculate total exchange amount
                    setExchangeAmount(exchangeAmount);
                    setIsModalOpen(false);
                    setIsExchangeModalOpen(true);
                    fetchBill(); // Refetch bill data after exchange
        
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
        axios.post(`${API_BASE_URL}/user/stock/defect`, {
            sno: defectItem.sno,
            barcodedId: defectItem.itemBarcodeID,
            return_quantity: defectQuantity,
            price: defectItem.sellPrice,
            userId: userData.userId // Make sure `userId` is defined
        })
        .then(response => {
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

    const handleCloseExchangeModal = () => {
        setIsExchangeModalOpen(false);
        setExchangeAmount(0);  // Reset exchangeAmount when modal is closed
        fetchBill();
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

    const BillSelectionPopup = ({ billList, onClose, onSelectBill }) => (
        <div className="bill-selection-popup">
            <h3>Select a Bill</h3>
            <table>
                <thead>
                    <tr>
                        <th>Bill No</th>
                        <th>Store ID</th>
                        <th>User ID</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {billList.map((bill) => (
                        <tr key={bill.billNo}>
                            <td>{bill.billNo}</td>
                            <td>{bill.storeId}</td>
                            <td>{bill.userId}</td>
                            <td>{bill.bill_date}</td>
                            <td>
                                <button onClick={() => onSelectBill(bill)}>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={onClose}>Close</button>
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
                                                ) : item.status === "Defected" ? (
                                                    <span>Defected Item Returned</span>
                                                ) : item.quantity <= 0 ? (
                                                    <span>Item Exchanged or returned</span>
                                                ) : returnedItems[item.sno] ? (
                                                    <button disabled>Item Returned</button>
                                                ) : selectedItems.find(selectedItem => selectedItem.sno === item.sno) ? (
                                                    <span style={{ color: 'green' }}>Item Selected</span>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleSelectItem(item)}>Select</button>
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
                                    <th>Bill Type</th>
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
                                        <td>{item.billCategory}</td>
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
                                                    alert(`Defect quantity cannot exceed ${defectItem.quantity}`);
                                                    setDefectQuantity(defectItem.quantity);
                                                }
                                            }}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="unique-defect-amount">
                            Amount: {defectItem.sellPrice * defectQuantity}
                        </div>
                        <div className="unique-defect-buttons">
                            <button onClick={confirmDefect}>Confirm Defect</button>
                            <button onClick={() => setIsDefectModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
    
            {isExchangeModalOpen && (
                <>
                    <div className="item-exchange-modal-overlay"></div>
                    <div className="item-exchange-modal-bill">
                        {billType === "Wholesale" ? (
                            <ExchangeBillWholesale
                                userData={userData}
                                itemsToExchange={itemsToExchange}
                                exchangeAmount={exchangeAmount}
                                onClose={handleCloseExchangeModal}
                            />
                        ) : (
                            <ExchangeBill
                                userData={userData}
                                itemsToExchange={itemsToExchange}
                                exchangeAmount={exchangeAmount}
                                onClose={handleCloseExchangeModal}
                            />
                        )}
                    </div>
                </>
            )}
    
            {showPopup && (
                <Popup
                    message={popupMessage}
                    type={popupType}
                    onClose={() => setShowPopup(false)}
                />
            )}
    
            {showBillSelectionPopup && (
                <BillSelectionPopup
                    billList={billList}
                    onClose={() => setShowBillSelectionPopup(false)}
                    onSelectBill={handleSelectBill}
                />
            )}
        </div>
    );
};    
export default BillDetails;