import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './AddItemStock.css'; // Import the CSS file
import { API_BASE_URL } from "../Config.js";

const AddItemStock = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const initialItemState = { itemCode: '',itemName: '',itemType: '',itemSize: '',itemColor: '',itemCategory: '',price: '',wholeSalePrice: '', quantity: 0,description: '',groupId: '',storeId: user ? user.storeId : ''};
  const [items, setItems] = useState([initialItemState]);
  const [itemCategoryOptions, setItemCategoryOptions] = useState([]);
  const [itemTypeOptions, setItemTypeOptions] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const inputRefs = useRef([]);
  const fileInputRef = useRef(null); // Reference to the file input


  const fetchItemCategoryAndType = async () => {
    try {
      const storeId = user ? user.storeId : '';
  
      const categoryResponse = await axios.get(`${API_BASE_URL}/inventory/search/school_list`, {
        params: { storeId }
      });
      const typeResponse = await axios.get(`${API_BASE_URL}/inventory/search/item_list`, {
        params: { storeId }
      });
  
      setItemCategoryOptions(categoryResponse.data);
      setItemTypeOptions(typeResponse.data);
      clearItemRows();
    } catch (error) {
      console.error('Error fetching categories and types:', error);
    }
  };
  
  useEffect(() => {
    fetchItemCategoryAndType();
  }, []);


  const removeItemRow = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };
  

  const handleKeyDown = (e, rowIndex, fieldIndex) => {
    if (!inputRefs.current || !inputRefs.current[rowIndex]) {
      return; // Exit if the current row does not exist
    }
  
    switch (e.key) {
      case 'ArrowRight':
        if (fieldIndex < inputRefs.current[rowIndex].length - 1) {
          const nextField = inputRefs.current[rowIndex][fieldIndex + 1];
          if (nextField) {
            nextField.focus();
          }
        }
        break;
  
      case 'ArrowLeft':
        if (fieldIndex > 0) {
          const prevField = inputRefs.current[rowIndex][fieldIndex - 1];
          if (prevField) {
            prevField.focus();
          }
        }
        break;
  
      case 'ArrowDown':
        if (rowIndex < inputRefs.current.length - 1) {
          const nextRowField = inputRefs.current[rowIndex + 1][fieldIndex];
          if (nextRowField) {
            nextRowField.focus();
          }
        }
        break;
  
      case 'ArrowUp':
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
  

  const downloadExcelFormat = () => {
    fetch(`${API_BASE_URL}/inventory/download/stock_add_list`, {
      method: 'GET',
    })
      .then((response) => {
        if (response.ok) {
          return response.blob(); // Get the file as a blob
        }
        throw new Error('Network response was not ok.');
      })
      .then((blob) => {
        // Create a URL for the file and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'New Stock List.xlsx'; // Set the download file name to "New Stock List"
        document.body.appendChild(a);
        a.click();
        a.remove(); // Clean up the anchor element
      })
      .catch((error) => {
        console.error('There was an issue with the download:', error);
      });
  };
  
  
  const addItemRow = () => {
    setItems([...items, initialItemState]);
  };

  const clearItemRows = () => {
    setItems([initialItemState]); 
    fileInputRef.current.value = '';
  };

  const handleInputChange = (e, rowIndex, fieldName) => {
    const updatedItems = [...items];
    updatedItems[rowIndex][fieldName] = e.target.value;
    setItems(updatedItems);
  };

  const checkItemCode = async (itemCode) => {
    try {
      const storeId = user ? user.storeId : '';
  
      const response = await axios.get(`${API_BASE_URL}/inventory/check/item_code`, { 
        params: { itemCode, storeId } 
      });
      
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
        const storeId = user ? user.storeId : '';
        const response = await axios.post(`${API_BASE_URL}/inventory/stock/add?storeId=${storeId}`,items);
        alert(`Item added: ${JSON.stringify(response.data)}`); // Use template literals to format the message
        clearItemRows();
        fetchItemCategoryAndType();
      } catch (error) {
        console.error('Error submitting data:', error);
      }
    }
  };

  const getHighestMatch = (value, options) => {
    if (!value) return '';
  
    const normalizedValue = value.toLowerCase();
  
    let bestMatch = '';
    let highestMatchScore = 0;
  
    options.forEach(option => {
      const normalizedOption = option.toLowerCase();
      let matchScore = 0;
  
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
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
  
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
          description: row[9] || '',
          groupId: row[10] || ''
        };
      });
  
      setItems(parsedItems);
    };
  
    reader.readAsBinaryString(file);
  };

  return (
    <div className='add-stock-cont'>
      <h2>Add Item Stock</h2>
      <div className="actionBtns">
  <div className="actionBtns-left">
    <button className="clear-button" onClick={clearItemRows}>Clear Items</button>
    <button className="refresh-button" onClick={fetchItemCategoryAndType}>Refresh</button>
    <input
      type="file"
      accept=".xlsx, .xls"
      onChange={handleFileUpload}
      className="upload-button"
      ref={fileInputRef} // Reference for resetting the file input
    />
  </div>

  <div className="download-btn-container">
    <button className="download-button" onClick={downloadExcelFormat}>Download Format</button>
  </div>
</div>



 <div className="add-item-stock">
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
            <th>Group ID</th>
            
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
              <input
                  value={item.groupId}
                  onChange={(e) => handleInputChange(e, rowIndex, 'groupId')}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, 10)}
                  placeholder="Group Id"
                />
              
              </td>
              <td>
        <button onClick={() => removeItemRow(rowIndex)} className="remove-button">Remove</button>
      </td>
            </tr>
          ))}
        </tbody>
      </table>
  
    </div>
    <div className="add-item-stock-btn">
  <button className="add-row-button" onClick={addItemRow}>Add Item</button>
  <button className="submit-button" onClick={handleSubmit}>Submit</button>
</div>

    </div>
  );
};

export default AddItemStock;
