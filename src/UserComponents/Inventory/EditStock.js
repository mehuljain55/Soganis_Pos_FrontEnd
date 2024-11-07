import React, { useState } from 'react';
import './View.css';
import axios from "axios";
import { API_BASE_URL } from '../Config.js';

const EditStock = ({ data, onUpdateSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [editableData, setEditableData] = useState({});

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleQuantityFilter = (event) => {
    const value = event.target.value;
    setMaxQuantity(value ? parseInt(value, 10) : '');
  };

  const handleInputChange = (e, id, field) => {
    const { value } = e.target;
    setEditableData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user) {
        alert('User not found in session storage.');
        return;
      }

      // Prepare data with only edited fields
      const itemAddModel = Object.keys(editableData).map((id) => ({
        barcodedId: id,
        ...editableData[id],
      }));

      const inventoryUpdateModel = {
        itemAddModel: itemAddModel,
        user: user
      };

      const response = await fetch(`${API_BASE_URL}/inventory/update_inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inventoryUpdateModel),
      });

      if (response.ok) {
        alert('Updates submitted successfully');
        setEditableData({});
        onUpdateSuccess();
      } else {
        alert('Failed to update inventory.');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('An error occurred while updating the inventory.');
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearchTerm =
      (item.itemCode && item.itemCode.toLowerCase().includes(searchTerm)) ||
      (item.itemName && item.itemName.toLowerCase().includes(searchTerm)) ||
      (item.itemType && item.itemType.toLowerCase().includes(searchTerm)) ||
      (item.itemColor && item.itemColor.toLowerCase().includes(searchTerm)) ||
      (item.itemSize && item.itemSize.toLowerCase().includes(searchTerm)) ||
      (item.itemCategory && item.itemCategory.toLowerCase().includes(searchTerm)) ||
      (item.group_id && item.group_id.toLowerCase().includes(searchTerm));

    const matchesQuantityFilter =
      maxQuantity === '' || (item.quantity && item.quantity <= maxQuantity);

    return matchesSearchTerm && matchesQuantityFilter;
  });

  return (
    <div className="view-sales-filter-data-container">
      <div className="view-sales-filter-data-controls">
        <button onClick={handleUpdate} className="view-sales-filter-data-submit-btn">
          Submit Changes
        </button>
      </div>

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
                <th>Available Quantity</th>
                <th>Group ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.itemBarcodeID}>
                  <td>{item.sno}</td>
                  <td>
                    <input
                      type="text"
                      value={editableData[item.itemBarcodeID]?.itemCode || item.itemCode}
                      onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'itemCode')}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editableData[item.itemBarcodeID]?.itemName || item.itemName}
                      onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'itemName')}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editableData[item.itemBarcodeID]?.itemType || item.itemType}
                      onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'itemType')}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editableData[item.itemBarcodeID]?.itemColor || item.itemColor}
                      onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'itemColor')}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editableData[item.itemBarcodeID]?.itemSize || item.itemSize}
                      onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'itemSize')}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editableData[item.itemBarcodeID]?.itemCategory || item.itemCategory}
                      onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'itemCategory')}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editableData[item.itemBarcodeID]?.price || item.price}
                      onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'price')}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editableData[item.itemBarcodeID]?.quantity || item.quantity}
                      onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'quantity')}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editableData[item.itemBarcodeID]?.group_id || item.group_id}
                      onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'group_id')}
                    />
                  </td>
                  <td>
                    <button> Delete</button>
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

export default EditStock;
