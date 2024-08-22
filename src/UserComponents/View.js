import React, { useState } from 'react';
import './View.css'; // Import the CSS file for styling
import { API_BASE_URL } from './Config.js';

const View = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [maxQuantity, setMaxQuantity] = useState(''); 
    const [placedOrders, setPlacedOrders] = useState({}); // State to track placed orders

    const handleSearch = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const handleQuantityFilter = (event) => {
        const value = event.target.value;
        setMaxQuantity(value ? parseInt(value, 10) : '');
    };

    const handlePlaceOrder = async (barcodedId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/create_order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ barcodedId }),
            });

            if (response.ok) {
                const status = await response.text();
                alert(`Order placed successfully: ${status}`);
                setPlacedOrders((prev) => ({
                    ...prev,
                    [barcodedId]: true,
                }));
            } else {
                alert('Failed to place order.');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('An error occurred while placing the order.');
        }
    };

    const filteredData = data.filter(item => {
        const matchesSearchTerm = (item.itemCode && item.itemCode.toLowerCase().includes(searchTerm)) ||
                                  (item.itemName && item.itemName.toLowerCase().includes(searchTerm)) ||
                                  (item.itemType && item.itemType.toLowerCase().includes(searchTerm)) ||
                                  (item.itemColor && item.itemColor.toLowerCase().includes(searchTerm)) ||
                                  (item.itemSize && item.itemSize.toLowerCase().includes(searchTerm)) ||
                                  (item.itemCategory && item.itemCategory.toLowerCase().includes(searchTerm)) ||
                                  (item.group_id && item.group_id.toLowerCase().includes(searchTerm));

        const matchesQuantityFilter = maxQuantity === '' || (item.quantity && item.quantity <= maxQuantity);

        return matchesSearchTerm && matchesQuantityFilter;
    });

    return (
        <div className="view-sales-filter-data-container">
            <div className="view-sales-filter-data-search-bar-wrapper">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={handleSearch}
                    className="view-sales-filter-data-search-bar"
                />
                <input
                    type="number"
                    placeholder="Max Quantity"
                    value={maxQuantity}
                    onChange={handleQuantityFilter}
                    className="view-sales-filter-data-quantity-filter"
                />
            </div>
            <div className="view-sales-filter-data-table-wrapper">
                {filteredData.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Item Code</th>
                                <th>Item Name</th>
                                <th>Item Type</th>
                                <th>Item Color</th>
                                <th>Item Size</th>
                                <th>Item Category</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Group ID</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.sno}</td>
                                    <td>{item.itemCode}</td>
                                    <td>{item.itemName}</td>
                                    <td>{item.itemType}</td>
                                    <td>{item.itemColor}</td>
                                    <td>{item.itemSize}</td>
                                    <td>{item.itemCategory}</td>
                                    <td>{item.price}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.group_id}</td>
                                    <td>
                                        {placedOrders[item.itemBarcodeID] ? (
                                            <span style={{ color: 'green' }}>Order Placed</span>
                                        ) : (
                                            <button
                                                onClick={() => handlePlaceOrder(item.itemBarcodeID)}
                                                className="view-sales-filter-data-place-order-btn"
                                            >
                                                Place Order
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No data found</p>
                )}
            </div>
        </div>
    );
};

export default View;
