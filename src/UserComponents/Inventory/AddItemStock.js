import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './AddItemStock.css'; // Import the CSS file
import { API_BASE_URL } from "../Config.js";

const AddItemStock = () => {
  const initialItemState = { itemCode: '', itemName: '', itemType: '', itemSize: '', itemColor: '', itemCategory: '', price: '', wholeSalePrice: '', quantity: 0, description: '' };
  const [items, setItems] = useState([initialItemState]);
  const [itemCategoryOptions, setItemCategoryOptions] = useState([]);
  const [itemTypeOptions, setItemTypeOptions] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const inputRefs = useRef([]);
  const fileInputRef = useRef(null); // Reference to the file input

  useEffect(() => {
    fetchItemCategoryAndType();
  }, []);

  // Function to fetch item categories and types
  const fetchItemCategoryAndType = async () => {
    try {
      const categoryResponse = await axios.get(`${API_BASE_URL}/search/school_list`);
      const typeResponse = await axios.get(`${API_BASE_URL}/search/item_list`);
      setItemCategoryOptions(categoryResponse.data);
      setItemTypeOptions(typeResponse.data);
    } catch (error) {
      console.error('Error fetching categories and types:', error);
    }
  };

  const removeItemRow = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };
  

  const handleKeyDown = (e, rowIndex, fieldIndex) => {
    // Check if inputRefs.current is initialized
    if (!inputRefs.current || !inputRefs.current[rowIndex]) {
      return; // Exit if the current row does not exist
    }
  
    switch (e.key) {
      case 'ArrowRight':
        // Move right if we're not at the last field in the current row
        if (fieldIndex < inputRefs.current[rowIndex].length - 1) {
          const nextField = inputRefs.current[rowIndex][fieldIndex + 1];
          if (nextField) {
            nextField.focus();
          }
        }
        break;
  
      case 'ArrowLeft':
        // Move left if we're not at the first field in the current row
        if (fieldIndex > 0) {
          const prevField = inputRefs.current[rowIndex][fieldIndex - 1];
          if (prevField) {
            prevField.focus();
          }
        }
        break;
  
      case 'ArrowDown':
        // Move down if we're not at the last row
        if (rowIndex < inputRefs.current.length - 1) {
          const nextRowField = inputRefs.current[rowIndex + 1][fieldIndex];
          if (nextRowField) {
            nextRowField.focus();
          }
        }
        break;
  
      case 'ArrowUp':
        // Move up if we're not at the first row
        if (rowIndex > 0) {
          const prevRowField = inputRefs.current[rowIndex - 1][fieldIndex];
          if (prevRowField) {
            prevRowField.focus();
          }
        }
        break;
  
      default:
        break;
    }
  };
  
  
  const addItemRow = () => {
    setItems([...items, initialItemState]);
  };

  const clearItemRows = () => {
    setItems([initialItemState]); // Reset to a single empty row
    fileInputRef.current.value = ''; // Clear the file input
  };

  const handleInputChange = (e, rowIndex, fieldName) => {
    const updatedItems = [...items];
    updatedItems[rowIndex][fieldName] = e.target.value;
    setItems(updatedItems);
  };

  const checkItemCode = async (itemCode) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/check/item_code`, { params: { itemCode } });
      return response.data;
    } catch (error) {
      console.error('Error checking item code:', error);
      return 'Error';
    }
  };

  const validateItems = async () => {
    const newValidationErrors = {};
    const uniqueItemCodes = new Set();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.itemCode.trim()) {
        newValidationErrors[`itemCode${i}`] = 'Item code is required';
      } else if (uniqueItemCodes.has(item.itemCode)) {
        newValidationErrors[`itemCode${i}`] = 'Item code must be unique';
      } else {
        uniqueItemCodes.add(item.itemCode);
        const status = await checkItemCode(item.itemCode);
        if (status === 'Exists') {
          newValidationErrors[`itemCode${i}`] = 'Item code already exists';
        }
      }
    }

    setValidationErrors(newValidationErrors);
    return Object.keys(newValidationErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = await validateItems();
    if (isValid) {
      try {
        const response = await axios.post(`${API_BASE_URL}/stock/add`, items);
        console.log('API response:', response.data);
      } catch (error) {
        console.error('Error submitting data:', error);
      }
    }
  };

  const getHighestMatch = (value, options) => {
    if (!value) return '';
  
    // Normalize the value
    const normalizedValue = value.toLowerCase();
  
    // Find the best match from the options
    let bestMatch = '';
    let highestMatchScore = 0;
  
    options.forEach(option => {
      const normalizedOption = option.toLowerCase();
      let matchScore = 0;
  
      // Calculate match score (simple similarity check)
      if (normalizedOption.includes(normalizedValue)) {
        matchScore = normalizedValue.length / normalizedOption.length;
      }
  
      if (matchScore > highestMatchScore) {
        highestMatchScore = matchScore;
        bestMatch = option;
      }
    });
  
    return bestMatch;
  };
  
  // Handle Excel file upload and parse it
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
  
      // Map the Excel data to items with highest match
      const parsedItems = excelRows.slice(1).map((row) => {
        const itemType = row[2] || '';
        const itemCategory = row[5] || '';
  
        return {
          itemCode: row[0] || '',
          itemName: row[1] || '',
          itemType: getHighestMatch(itemType, itemTypeOptions),
          itemSize: row[3] || '',
          itemColor: row[4] || '',
          itemCategory: getHighestMatch(itemCategory, itemCategoryOptions),
          price: row[6] || '',
          wholeSalePrice: row[7] || '',
          quantity: row[8] || 0,
          description: row[9] || ''
        };
      });
  
      setItems(parsedItems);
    };
  
    reader.readAsBinaryString(file);
  };

  return (
    <div className="add-item-stock">
      <h2>Add Item Stock</h2>
      <button className="add-row-button" onClick={addItemRow}>Add New Item</button>
      <button className="clear-button" onClick={clearItemRows}>Clear Items</button>
      <button className="refresh-button" onClick={fetchItemCategoryAndType}>Refresh Categories and Types</button>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="upload-button"
        ref={fileInputRef} // Reference for resetting the file input
      />

      <table className="item-stock-table">
        <thead>
          <tr>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Item Type</th>
            <th>Item Size</th>
            <th>Item Color</th>
            <th>Item Category</th>
            <th>Price</th>
            <th>Wholesale Price</th>
            <th>Quantity</th>
            <th>Barcode Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, rowIndex) => (
            <tr key={rowIndex}>
              <td>
                <input
                  ref={(el) => (inputRefs.current[rowIndex] = [...(inputRefs.current[rowIndex] || []), el])}
                  value={item.itemCode}
                  onChange={(e) => handleInputChange(e, rowIndex, 'itemCode')}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 0)}
                  placeholder="Item Code"
                  className={validationErrors[`itemCode${rowIndex}`] ? 'error' : ''}
                />
                {validationErrors[`itemCode${rowIndex}`] && <span className="error-message">{validationErrors[`itemCode${rowIndex}`]}</span>}
              </td>
              <td>
                <input
                  value={item.itemName}
                  onChange={(e) => handleInputChange(e, rowIndex, 'itemName')}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 1)}
                  placeholder="Item Name"
                />
              </td>
              <td>
                <select
                  value={item.itemType}
                  onChange={(e) => handleInputChange(e, rowIndex, 'itemType')}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 2)}
                >
                  <option value="">Select Type</option>
                  {itemTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  value={item.itemSize}
                  onChange={(e) => handleInputChange(e, rowIndex, 'itemSize')}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 3)}
                  placeholder="Item Size"
                />
              </td>
              <td>
                <input
                  value={item.itemColor}
                  onChange={(e) => handleInputChange(e, rowIndex, 'itemColor')}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 4)}
                  placeholder="Item Color"
                />
              </td>
              <td>
                <select
                  value={item.itemCategory}
                  onChange={(e) => handleInputChange(e, rowIndex, 'itemCategory')}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 5)}
                >
                  <option value="">Select Category</option>
                  {itemCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  value={item.price}
                  onChange={(e) => handleInputChange(e, rowIndex, 'price')}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 6)}
                  placeholder="Price"
                />
              </td>
              <td>
                <input
                  value={item.wholeSalePrice}
                  onChange={(e) => handleInputChange(e, rowIndex, 'wholeSalePrice')}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 7)}
                  placeholder="Wholesale Price"
                />
              </td>
              <td>
                <input
                  value={item.quantity}
                  onChange={(e) => handleInputChange(e, rowIndex, 'quantity')}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 8)}
                  placeholder="Quantity"
                />
              </td>
              <td>
                <input
                  value={item.description}
                  onChange={(e) => handleInputChange(e, rowIndex, 'description')}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 9)}
                  placeholder="Description"
                />
              </td>
              <td>
        <button onClick={() => removeItemRow(rowIndex)} className="remove-button">Remove</button>
      </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="submit-button" onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default AddItemStock;
