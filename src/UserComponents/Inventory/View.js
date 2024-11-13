import React, { useState, useRef } from 'react';
import './View.css';
import axios from "axios";
import { API_BASE_URL } from '../Config.js';

const View = ({ data,onUpdateSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [editableData, setEditableData] = useState({});
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  const inputRefs = useRef({});

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleQuantityFilter = (event) => {
    const value = event.target.value;
    setMaxQuantity(value ? parseInt(value, 10) : '');
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
      const response = await axios.post(`${API_BASE_URL}/inventory/export`, data, {
        responseType: 'blob', // Important for binary data
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory.xlsx'); // Specify the file name
      document.body.appendChild(link);
      link.click();

      // Cleanup
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


  const handleKeyDown = (e, rowIndex, columnIndex, field) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      let newRow = rowIndex;
      let newCol = columnIndex;
  
      if (e.key === 'ArrowUp') {
        // Move up to the previous row, if possible
        newRow = rowIndex > 0 ? rowIndex - 1 : rowIndex;
      } else if (e.key === 'ArrowDown') {
        // Move down to the next row, if possible
        newRow = rowIndex < filteredData.length - 1 ? rowIndex + 1 : rowIndex;
      } else if (e.key === 'ArrowRight') {
        // Move right within the row in a circular manner (Quantity -> Price -> Wholesale Price -> Quantity)
        newCol = (columnIndex + 1) % 3; // Cycle forward
      } else if (e.key === 'ArrowLeft') {
        // Move left within the row in a circular manner (Wholesale Price -> Price -> Quantity -> Wholesale Price)
        newCol = (columnIndex - 1 + 3) % 3; // Cycle backward
      }
  
      // Define a map of column indices to field names
      const fieldMap = {
        0: 'quantity',       // First column for Quantity
        1: 'price',          // Second column for Price
        2: 'wholeSalePrice'  // Third column for Wholesale Price
      };
  
      // Determine the field name based on the new column index
      const nextField = fieldMap[newCol];
      const nextRef = inputRefs.current[`${newRow}-${newCol}-${nextField}`];
      
      // Set focus on the new input if it exists
      if (nextRef) {
        nextRef.focus();
      }
    }
  };
  
  
  return (
    <div className="view-sales-filter-data-container">
      <div className="view-sales-filter-data-controls">
        <button
          onClick={() => setIsEditingPrice(!isEditingPrice)}
          className="view-sales-filter-data-edit-btn"
        >
          {isEditingPrice ? 'Exit Edit Price' : 'Edit Price'}
        </button>
        <button
          onClick={() => setIsEditingQuantity(!isEditingQuantity)}
          className="view-sales-filter-data-edit-btn"
        >
          {isEditingQuantity ? 'Exit Edit Quantity' : 'Edit Quantity'}
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
          <th>Wholesale Price</th>
          <th>Available Quantity</th>
          <th>Added Quantity</th>
          <th>Group ID</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((item, rowIndex) => (
          <tr key={rowIndex}>
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
                />
              ) : (
                item.wholeSalePrice
              )}
            </td>
            <td>{item.quantity}</td>
            <td>
              {isEditingQuantity ? (
                <input
                  type="number"
                  value={editableData[item.itemBarcodeID]?.quantity ?? 0}  // Set initial value to 0
                  onChange={(e) => handleInputChange(e, item.itemBarcodeID, 'quantity')}
                  ref={(el) => (inputRefs.current[`${rowIndex}-0-quantity`] = el)}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 0, 'quantity')}
                />
              ) : (
                item.quantity
              )}
            </td>
            <td>{item.group_id}</td>
            <td>
              <button
                onClick={() => handlePlaceOrder(item.itemBarcodeID)}
                className="view-sales-filter-data-place-order-btn"
              >
                Place Order
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No data found</p>
  )}
</div>


      <div className="view-sales-filter-data-actions">
        {(isEditingQuantity || isEditingPrice) && (
          <div className="view-sales-filter-data-actions">
            <button
              onClick={handleUpdate}
              className="view-sales-filter-data-submit-btn"
            >
              Submit Updates
            </button>
            <button
              onClick={handleDiscard}
              className="view-sales-filter-data-cancel-btn"
            >
              Discard Changes
            </button>
          </div>
        )}
         <button
              onClick={handleExport}
              className="sales-export-btn"
            >
              Export
            </button>
      </div>
    </div>
  );
};

export default View;