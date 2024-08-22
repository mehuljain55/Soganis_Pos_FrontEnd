import React, { useState, useEffect } from 'react';
import './CustomerOrder.css';
import { API_BASE_URL } from './Config.js';

const CustomerOrder = () => {
    const [order, setOrder] = useState({
        customerName: '',
        mobileNo: '',
        deliveryDate: '',
        totalAmount: 0,
        advancePayment: 0,
        orders: [{ schoolName: '', itemType: '', description: '', size: '', quantity: 0, price: 0, amount: 0 }]
    });
    const [schools, setSchools] = useState([]);
    const [itemTypes, setItemTypes] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE_URL}/filter/getSchool`)
            .then(response => response.json())
            .then(data => setSchools(data))
            .catch(error => console.error('Error fetching school names:', error));

        fetch(`${API_BASE_URL}/filter/item_type`)
            .then(response => response.json())
            .then(data => setItemTypes(data))
            .catch(error => console.error('Error fetching item types:', error));
    }, []);

    const handleInputChange = (e, index, field) => {
        const newOrders = [...order.orders];
        let value = e.target.value;

        if ((field === 'price' || field === 'quantity') && value < 0) {
            value = 0;
        }

        newOrders[index][field] = value;

        if (field === 'price' || field === 'quantity') {
            newOrders[index].amount = newOrders[index].price * newOrders[index].quantity;
        }

        const totalAmount = newOrders.reduce((sum, item) => sum + item.amount, 0);

        setOrder({ ...order, orders: newOrders, totalAmount });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const handleConfirm = () => {
        fetch(`${API_BASE_URL}/customer_order_details`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        })
            .then(response => {
                if (response.ok) {
                    alert('Order submitted successfully');
                    setOrder({
                        customerName: '',
                        mobileNo: '',
                        deliveryDate: '',
                        totalAmount: 0,
                        advancePayment: 0,
                        orders: [{ schoolName: '', itemType: '', description: '', size: '', quantity: 0, price: 0, amount: 0 }]
                    });
                    setShowModal(false);
                } else {
                    alert('Failed to submit order');
                    setShowModal(false);
                }
            })
            .catch(error => {
                console.error('Error submitting order:', error);
                setShowModal(false);
            });
    };

    const addOrder = () => {
        setOrder({
            ...order,
            orders: [...order.orders, { schoolName: '', itemType: '', description: '', size: '', quantity: 0, price: 0, amount: 0 }]
        });
    };

    const handleDelete = (index) => {
        const newOrders = order.orders.filter((_, i) => i !== index);
        const totalAmount = newOrders.reduce((sum, item) => sum + item.amount, 0);
        setOrder({ ...order, orders: newOrders, totalAmount });
    };

    return (
        <div className="order-container">
            <div className="form-container">
                <form onSubmit={handleSubmit} className="order-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Customer Name:</label>
                            <input
                                type="text"
                                value={order.customerName}
                                onChange={e => setOrder({ ...order, customerName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number:</label>
                            <input
                                type="text"
                                value={order.mobileNo}
                                onChange={e => setOrder({ ...order, mobileNo: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Advance Payment:</label>
                            <input
                                type="number"
                                value={order.advancePayment}
                                onChange={e => setOrder({ ...order, advancePayment: Number(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Delivery Date:</label>
                            <input
                                type="date"
                                value={order.deliveryDate}
                                onChange={e => setOrder({ ...order, deliveryDate: e.target.value })}
                            />
                        </div>
                    </div>
                </form>
            </div>

            <div className="order-table-container">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>School Name</th>
                            <th>Item Type</th>
                            <th>Description</th>
                            <th>Size</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orders.map((orderItem, index) => (
                            <tr key={index}>
                                <td>
                                    <select
                                        value={orderItem.schoolName}
                                        onChange={(e) => handleInputChange(e, index, 'schoolName')}
                                    >
                                        <option value="">Select School</option>
                                        {schools.map((school, idx) => (
                                            <option key={idx} value={school}>
                                                {school}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        value={orderItem.itemType}
                                        onChange={(e) => handleInputChange(e, index, 'itemType')}
                                    >
                                        <option value="">Select Item Type</option>
                                        {itemTypes.map((item, idx) => (
                                            <option key={idx} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={orderItem.description}
                                        onChange={(e) => handleInputChange(e, index, 'description')}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder="Size"
                                        value={orderItem.size}
                                        onChange={(e) => handleInputChange(e, index, 'size')}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        value={orderItem.quantity}
                                        onChange={(e) => handleInputChange(e, index, 'quantity')}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={orderItem.price}
                                        onChange={(e) => handleInputChange(e, index, 'price')}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={orderItem.amount}
                                        readOnly
                                    />
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="delete-btn"
                                        onClick={() => handleDelete(index)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='customer-action-btn'>
                <button type="button" className="add-order-btn" onClick={addOrder}>Add Order</button>
                <button type="submit" className="submit-btn" onClick={handleSubmit}>Submit Order</button>
            </div>
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Order Summary</h2>
                        <p>Total Amount: ${Number(order.totalAmount).toFixed(2)}</p>
                        <p>Advance Payment: ${Number(order.advancePayment).toFixed(2)}</p>
                        <p><strong>Amount Due: ${(Number(order.totalAmount) - Number(order.advancePayment)).toFixed(2)}</strong></p>
                        <button className="confirm-btn" onClick={handleConfirm}>Confirm</button>
                        <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerOrder;
