// View.js
import React from 'react';
import './View.css'; // Import the CSS file for styling

const View = ({ data }) => {
    return (
        <div className="view-container">
            <h2>View Data</h2>
            <div className="table-wrapper">
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
                        {data.map((item, index) => (
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
            </div>
        </div>
    );
};

export default View;
