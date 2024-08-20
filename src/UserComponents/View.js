import React, { useState } from 'react';
import './View.css'; // Import the CSS file for styling

const View = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Function to handle search input change
    const handleSearch = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    // Filtered data based on search term
    const filteredData = data.filter(item =>
        (item.itemCode && item.itemCode.toLowerCase().includes(searchTerm)) ||
        (item.itemName && item.itemName.toLowerCase().includes(searchTerm)) ||
        (item.itemType && item.itemType.toLowerCase().includes(searchTerm)) ||
        (item.itemColor && item.itemColor.toLowerCase().includes(searchTerm)) ||
        (item.itemSize && item.itemSize.toLowerCase().includes(searchTerm)) ||
        (item.itemCategory && item.itemCategory.toLowerCase().includes(searchTerm)) ||
        (item.group_id && item.group_id.toLowerCase().includes(searchTerm))
    );

    return (
        <div className="view-container">
            <h5>View Data</h5>
            <div className="search-bar-wrapper">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-bar"
                />
            </div>
            <div className="table-wrapper">
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
