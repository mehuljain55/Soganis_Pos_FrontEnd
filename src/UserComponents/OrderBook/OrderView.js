import React, { useState, useEffect } from 'react';
import './OrderView.css';
import { API_BASE_URL } from '../Config.js';

const OrderView = () => {
    const [status, setStatus] = useState('PENDING');
    const [orders, setOrders] = useState([]);
    const [expandedOrders, setExpandedOrders] = useState({});

    const fetchOrders = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const storeId = user?.storeId; // Retrieve storeId from user data
    
        fetch(`${API_BASE_URL}/user/view/customer_order_details?status=${status}&storeId=${storeId}`, {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                console.log('Fetched data:', data);
                setOrders(data);
            })
            .catch(error => console.error('Error fetching orders:', error));
    };

    useEffect(() => {
        fetchOrders();
    }, [status]);

    const toggleExpandOrder = (orderId) => {
        setExpandedOrders(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const formatValue = (value) => value || 'N/A';

    const updateOrderStatus = (orderId, statusType) => {
        const url = statusType === 'DELIVERED'
            ? `${API_BASE_URL}/user/update/customer_order_details/delivered?orderId=${orderId}`
            : `${API_BASE_URL}/user/update/customer_order_details/cancelled?orderId=${orderId}`;
        
        fetch(url, {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                setOrders(prevOrders => prevOrders.filter(order => order.orderId !== orderId));
            } else {
                console.error('Failed to update order status');
            }
        })
        .catch(error => console.error('Error updating order status:', error));
    };

    return (
        <div className="order-view-data">
            <div className="filter-section">
                <label htmlFor="status">Order Status:</label>
                <select
                    id="status"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                >
                    <option value="PENDING">Pending</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            <div className="order-view-table">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer Name</th>
                            <th>Mobile No</th>
                            <th>Delivery Date</th>
                            <th>Total Amount</th>
                            <th>Advance Payment</th>
                            <th>Amount Due</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <React.Fragment key={order.orderId}>
                                <tr>
                                    <td>{order.orderId}</td>
                                    <td>{formatValue(order.customerName)}</td>
                                    <td>{formatValue(order.mobileNo)}</td>
                                    <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
                                    <td>{order.totalAmount}</td>
                                    <td>{order.advancePayment}</td>
                                    <td>{order.amount_due}</td>
                                    <td>{formatValue(order.status)}</td>
                                    <td className="action-buttons">
                                        <button
                                            className="btn delivered"
                                            onClick={() => updateOrderStatus(order.orderId, 'DELIVERED')}
                                        >
                                            Delivered
                                        </button>
                                        <button
                                            className="btn cancelled"
                                            onClick={() => updateOrderStatus(order.orderId, 'CANCELLED')}
                                        >
                                            Cancelled
                                        </button>
                                        <button
                                            className="btn"
                                            onClick={() => toggleExpandOrder(order.orderId)}
                                        >
                                            {expandedOrders[order.orderId] ? 'Collapse' : 'View'}
                                        </button>
                                    </td>
                                </tr>
                                {expandedOrders[order.orderId] && (
                                    <tr>
                                        <td colSpan="9">
                                            <table className="sub-table">
                                                <thead>
                                                    <tr>
                                                        <th>School Name</th>
                                                        <th>Item Type</th>
                                                        <th>Description</th>
                                                        <th>Size</th>
                                                        <th>Quantity</th>
                                                        <th>Price</th>
                                                        <th>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.orders.map((orderItem, index) => (
                                                        <tr key={index}>
                                                            <td>{formatValue(orderItem.schoolName)}</td>
                                                            <td>{formatValue(orderItem.itemType)}</td>
                                                            <td>{formatValue(orderItem.description)}</td>
                                                            <td>{formatValue(orderItem.size)}</td>
                                                            <td>{orderItem.quantity}</td>
                                                            <td>{orderItem.price}</td>
                                                            <td>{orderItem.amount}</td>
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
    );
};

export default OrderView;
