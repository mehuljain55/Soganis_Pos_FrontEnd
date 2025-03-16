import React, { useState, useRef } from 'react';
import './EditStock.css';
import axios from "axios";
import { API_BASE_URL } from '../Config.js';

const EditStock = ({ data, resetFilters  }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [editableData, setEditableData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false); 
  const [statusMessage, setStatusMessage] = useState('');
  const [tableHidden, setTableHidden] = useState(false);
  const [isSubmitButtonVisible, setIsSubmitButtonVisible] = useState(true); // Control visibility of the submit button
  const inputRefs = useRef({});

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleQuantityFilter = (event) => {
    const value = event.target.value;
    setMaxQuantity(value ? parseInt(value, 10) : '');
  };

  
  const handleFieldChange = (rowIndex, field, value) => {
    setEditableData((prev) => {
      const updatedData = { ...prev };
      if (!updatedData[rowIndex]) updatedData[rowIndex] = {};
      updatedData[rowIndex][field] = value;
      return updatedData;
    });
  };

  const handleSubmitChanges = async () => {
    setIsSubmitButtonVisible(false); // Hide the submit button when submitting
    setIsUpdating(true); // Show the "Updating items..." animation
    setStatusMessage(''); // Clear previous status message
    setTableHidden(true); // Hide the table when submitting
  
    const rowsToUpdate = Object.keys(editableData).map((rowIndex) => {
      const updatedRow = { ...data[rowIndex], ...editableData[rowIndex] };
      return updatedRow;
    });
  
    try {
      const response = await axios.post(`${API_BASE_URL}/inventory/edit`, rowsToUpdate, {
        responseType: 'arraybuffer', // Ensure we handle the binary file response correctly
      });
  
      // Convert the byte array to a Blob (text file)
      const blob = new Blob([response.data], { type: 'text/plain' });
      
      // Create a link to download the Blob content
      const downloadUrl = URL.createObjectURL(blob);
  
      // Create an anchor element and trigger a download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'inventory_update.txt'; // The name of the downloaded file
      link.click(); // Trigger the download
  
      // Optionally, revoke the URL after download is triggered to free up resources
      URL.revokeObjectURL(downloadUrl);

      const content = new TextDecoder('utf-8').decode(response.data);
      setStatusMessage(content); // Set the content from the response
    } catch (error) {
      console.error("Error updating inventory:", error);
      setStatusMessage('Failed to update items. Please try again.');
    } finally {
      setIsUpdating(false); 
      resetFilters(); // Reset filters after the update
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
  
    // Only apply quantity filter when checkbox is checked
    if (maxQuantity==='') {
      return matchesSearchTerm;
    }
    
    const matchesQuantityFilter = 
      maxQuantity === '' || 
      (item.quantity !== undefined && item.quantity <= parseInt(maxQuantity, 10));
    
    return matchesSearchTerm && matchesQuantityFilter;
  });

  return (
    <div className="edit-stock-container">
      <div className="edit-stock-container-controls">
        {isSubmitButtonVisible && (
          <button className="edit-stock-container-submit-btn" onClick={handleSubmitChanges} disabled={isUpdating}>
            {isUpdating ? 'Updating items...' : 'Submit Changes'}
          </button>
        )}
      </div>

      {/* Show search controls if table is not hidden */}
      {!tableHidden && (
        <div className="edit-stock-container-search-bar-wrapper">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="edit-stock-container-search-bar"
          />
          <input
            type="number"
            placeholder="Max Quantity"
            value={maxQuantity}
            onChange={handleQuantityFilter}
            className="edit-stock-container-quantity-filter"
          />
        </div>
      )}

      {/* Display the animation or table content based on the update state */}
      {isUpdating ? (
        <div className="edit-stock-container-updating-animation">
          <p>Updating items...</p>
          <div className="spinner"></div> {/* Add a spinner or animation here */}
        </div>
      ): (
        <div className="edit-stock-container-table-wrapper">
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
                  <th>Group ID</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, rowIndex) => (
                  <tr key={item.itemBarcodeID}>
                    <td>{item.sno}</td>
                    <td>
                      <input
                        type="text"
                        value={editableData[rowIndex]?.itemCode || item.itemCode}
                        onChange={(e) => handleFieldChange(rowIndex, 'itemCode', e.target.value)}
                        className="edit-stock-container-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editableData[rowIndex]?.itemName || item.itemName}
                        onChange={(e) => handleFieldChange(rowIndex, 'itemName', e.target.value)}
                        className="edit-stock-container-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editableData[rowIndex]?.itemType || item.itemType}
                        onChange={(e) => handleFieldChange(rowIndex, 'itemType', e.target.value)}
                        className="edit-stock-container-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editableData[rowIndex]?.itemColor || item.itemColor}
                        onChange={(e) => handleFieldChange(rowIndex, 'itemColor', e.target.value)}
                        className="edit-stock-container-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editableData[rowIndex]?.itemSize || item.itemSize}
                        onChange={(e) => handleFieldChange(rowIndex, 'itemSize', e.target.value)}
                        className="edit-stock-container-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editableData[rowIndex]?.itemCategory || item.itemCategory}
                        onChange={(e) => handleFieldChange(rowIndex, 'itemCategory', e.target.value)}
                        className="edit-stock-container-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editableData[rowIndex]?.price || item.price}
                        onChange={(e) => handleFieldChange(rowIndex, 'price', e.target.value)}
                        className="edit-stock-container-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editableData[rowIndex]?.wholeSalePrice || item.wholeSalePrice}
                        onChange={(e) => handleFieldChange(rowIndex, 'wholeSalePrice', e.target.value)}
                        className="edit-stock-container-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editableData[rowIndex]?.quantity || item.quantity}
                        onChange={(e) => handleFieldChange(rowIndex, 'quantity', e.target.value)}
                        className="edit-stock-container-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editableData[rowIndex]?.group_id || item.group_id}
                        onChange={(e) => handleFieldChange(rowIndex, 'group_id', e.target.value)}
                        className="edit-stock-container-input"
                      />
                    </td>
                    <td>
                      <button className="edit-stock-container-delete-btn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EditStock;
