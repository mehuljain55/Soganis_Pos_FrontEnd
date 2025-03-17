import React, { useState, useRef, useEffect } from 'react';
import './View.css';
import axios from "axios";
import { API_BASE_URL } from '../Config.js';

const View = ({ data, onUpdateSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [editableData, setEditableData] = useState({});
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  const inputRefs = useRef({});

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleQuantityFilter = (e) => {
    setMaxQuantity(e.target.value);
  };

  const handlePlaceOrder = async (barcodedId) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const storeId = user?.storeId; 
      
      const response = await fetch(`${API_BASE_URL}/user/create_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          barcodedId: barcodedId,  
          storeId: storeId         
        }),
      });
    
      if (response.ok) {
        const status = await response.text();
        alert(`Order placed successfully: ${status}`);
      } else {
        alert('Failed to place order.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing the order.');
    }
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

  const handleExport = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/inventory/export`, filteredData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory.xlsx');
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('File downloaded successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user) {
        alert('User not found in local storage.');
        return;
      }
  
      const itemAddModel = Object.keys(editableData).map((id) => ({
        barcodedId: id,
        price: editableData[id]?.price || data.find((item) => item.itemBarcodeID === id)?.price,
        wholeSalePrice: editableData[id]?.wholeSalePrice || data.find((item) => item.itemBarcodeID === id)?.wholeSalePrice,
        quantity: editableData[id]?.quantity || data.find((item) => item.itemBarcodeID === id)?.quantity,
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
        setIsEditingQuantity(false);
        setIsEditingPrice(false);
        onUpdateSuccess();
      } else {
        alert('Failed to update inventory.');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('An error occurred while updating the inventory.');
    }
  };
  
  const handleDiscard = () => {
    setEditableData({});
    setIsEditingQuantity(false);
    setIsEditingPrice(false);
  };

  const filteredData = data
  .filter((item) => {
    const matchesSearchTerm =
      (item.itemCode && item.itemCode.toLowerCase().includes(searchTerm)) ||
      (item.itemName && item.itemName.toLowerCase().includes(searchTerm)) ||
      (item.itemType && item.itemType.toLowerCase().includes(searchTerm)) ||
      (item.itemColor && item.itemColor.toLowerCase().includes(searchTerm)) ||
      (item.itemSize && item.itemSize.toLowerCase().includes(searchTerm)) ||
      (item.itemCategory && item.itemCategory.toLowerCase().includes(searchTerm)) ||
      (item.group_id && item.group_id.toLowerCase().includes(searchTerm));
  
    // Only apply quantity filter when maxQuantity is provided
    if (maxQuantity === '') {
      return matchesSearchTerm;
    }
    
    const matchesQuantityFilter = 
      (item.quantity !== undefined && item.quantity <= parseInt(maxQuantity, 10));
    
    return matchesSearchTerm && matchesQuantityFilter;
  })
  // Sort by quantity in descending order, but only when quantity filter is applied
  .sort((a, b) => {
    if (maxQuantity !== '') {
      return (b.quantity || 0) - (a.quantity || 0); // Descending order
    }
    return 0; // No sorting when quantity filter isn't applied
  });

  const handleKeyDown = (e, rowIndex, columnIndex, field) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let newRow = rowIndex;
      let newCol = columnIndex;
  
      if (e.key === 'ArrowUp') {
        newRow = rowIndex > 0 ? rowIndex - 1 : rowIndex;
      } else if (e.key === 'ArrowDown') {
        newRow = rowIndex < filteredData.length - 1 ? rowIndex + 1 : rowIndex;
      } else if (e.key === 'ArrowRight') {
        newCol = (columnIndex + 1) % 3;
      } else if (e.key === 'ArrowLeft') {
        newCol = (columnIndex - 1 + 3) % 3;
      }
  
      const fieldMap = {
        0: 'quantity',
        1: 'price',
        2: 'wholeSalePrice'
      };
  
      const nextField = fieldMap[newCol];
      const nextRef = inputRefs.current[`${newRow}-${newCol}-${nextField}`];
      
      if (nextRef) {
        nextRef.focus();
      }
    }
  };
  
  return (
    <div className="view-stock-filter-container">
      <div className="view-stock-filter-search-bar-wrapper">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="view-stock-filter-search-bar"
        />
        
        <input
          type="number"
          placeholder="Max Quantity"
          value={maxQuantity}
          onChange={handleQuantityFilter}
          className="view-stock-filter-quantity-filter"
        />
        
        <div className="view-stock-filter-checkboxes">
          <label className="view-stock-filter-checkbox-label">
            <input
              type="checkbox"
              checked={isEditingPrice}
              onChange={() => setIsEditingPrice(!isEditingPrice)}
            />
            Edit Price
          </label>
          
          <label className="view-stock-filter-checkbox-label">
            <input
              type="checkbox"
              checked={isEditingQuantity}
              onChange={() => setIsEditingQuantity(!isEditingQuantity)}
            />
            Add Quantity
          </label>
        </div>
      </div>

      <div className="view-stock-filter-table-wrapper">
        {filteredData.length > 0 ? (
          <table className="view-stock-filter-table">
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
                <th>Wholesale Price</th>
                <th>Available Quantity</th>
                {isEditingQuantity && <th>Added Quantity</th>}

                <th>Group ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'view-stock-filter-even-row' : 'view-stock-filter-odd-row'}>
                  <td>{item.sno}</td>
                  <td>{item.itemCode}</td>
                  <td>{item.itemName}</td>
                  <td>{item.itemType}</td>
                  <td>{item.itemColor}</td>
                  <td>{item.itemSize}</td>
                  <td>{item.itemCategory}</td>
                  <td>
                    {isEditingPrice ? (
                      <input
                        type="number"
                        value={editableData[item.itemBarcodeID]?.price ?? item.price}
                        onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'price')}
                        ref={(el) => (inputRefs.current[`${rowIndex}-1-price`] = el)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 1, 'price')}
                        className="view-stock-filter-edit-input"
                      />
                    ) : (
                      item.price
                    )}
                  </td>
                  <td>
                    {isEditingPrice ? (
                      <input
                        type="number"
                        value={editableData[item.itemBarcodeID]?.wholeSalePrice ?? item.wholeSalePrice}
                        onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'wholeSalePrice')}
                        ref={(el) => (inputRefs.current[`${rowIndex}-2-wholeSalePrice`] = el)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 2, 'wholeSalePrice')}
                        className="view-stock-filter-edit-input"
                      />
                    ) : (
                      item.wholeSalePrice
                    )}
                  </td>
                  <td>{item.quantity}</td>
                  {isEditingQuantity && (
  <td>
    <input
      type="number"
      value={editableData[item.itemBarcodeID]?.quantity ?? 0}
      onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'quantity')}
      ref={(el) => (inputRefs.current[`${rowIndex}-0-quantity`] = el)}
      onKeyDown={(e) => handleKeyDown(e, rowIndex, 0, 'quantity')}
      className="view-stock-filter-edit-input"
    />
  </td>
)}

                  <td>{item.group_id}</td>
                  <td>
                    <button
                      onClick={() => handlePlaceOrder(item.itemBarcodeID)}
                      className="view-stock-filter-place-order-btn"
                    >
                      Place Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="view-stock-filter-no-data-message">No data found</p>
        )}
      </div>

      <div className="view-stock-filter-actions">
        {(isEditingQuantity || isEditingPrice) && (
          <>
            <button
              onClick={handleUpdate}
              className="view-stock-filter-submit-btn"
            >
              Submit Updates
            </button>
            <button
              onClick={handleDiscard}
              className="view-stock-filter-cancel-btn"
            >
              Discard Changes
            </button>
          </>
        )}
        <button
          onClick={handleExport}
          className="view-stock-filter-export-btn"
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default View;