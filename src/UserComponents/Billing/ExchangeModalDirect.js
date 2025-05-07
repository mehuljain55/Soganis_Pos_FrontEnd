import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ExchangeModalDirect.css';
import { API_BASE_URL } from '../Config.js';

const ExchangeModalDirect = ({ isOpen, onClose, addItemToBillExchange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const searchInputRef = useRef(null);

  // Add temporary values to search results
  const [tempValues, setTempValues] = useState({});

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      const fetchItems = async () => {
        try {
          const user = JSON.parse(sessionStorage.getItem('user'));
          const storeId = user ? user.storeId : '';

          const response = await axios.get(`${API_BASE_URL}/inventory/getAllItems`, {
            params: { searchTerm, storeId }
          });

          setSearchResults(response.data || []);
          
          // Initialize temp values for each search result
          const initialTempValues = {};
          response.data.forEach(item => {
            initialTempValues[item.itemBarcodeID] = {
              quantity: 1,
              status: 'EXCHANGE'
            };
          });
          setTempValues(initialTempValues);
          
          setDropdownOpen(true);
        } catch (error) {
          console.error('Error fetching items:', error);
          setSearchResults([]);
        }
      };

      fetchItems();
    }
  }, [searchTerm]);

  const handleSelectItem = (item) => {
    // Get the quantity and status from tempValues
    const { quantity, status } = tempValues[item.itemBarcodeID];
    
    // Directly add item to bill exchange
    addItemToBillExchange(item, quantity, status);
    
    // Optionally keep track of selected items for display
    const existing = selectedItems.find(i => i.itemBarcodeID === item.itemBarcodeID);
    if (!existing) {
      setSelectedItems([...selectedItems, { ...item, quantity, status }]);
    }
    
    // Clear search
    setSearchTerm('');
    setSearchResults([]);
    setDropdownOpen(false);
  };
  
  const handleTempValueChange = (itemId, field, value) => {
    setTempValues(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: field === 'quantity' ? parseInt(value) : value
      }
    }));
  };
  
  // This now only removes from the displayed list
  // The item has already been added to the bill exchange
  const handleRemoveItem = (index) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems.splice(index, 1);
    setSelectedItems(newSelectedItems);
  };

  if (!isOpen) return null;

  return (
    <div className="exchange-return-modal-overlay">
      <div className="exchange-return-modal">
        <h4>Exchange / Return Items</h4>

        <div className="exchange-return-input-row">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search item"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
          />
        </div>

        {dropdownOpen && searchResults.length > 0 && (
          <div className="exchange-return-dropdown">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Action</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((item) => (
                  <tr key={item.itemBarcodeID}>
                    <td>{item.itemCode}</td>
                    <td>{item.itemName}</td>
                    <td>{item.itemType}</td>
                    <td>{item.itemColor}</td>
                    <td>{item.itemSize}</td>
                    <td>{item.price}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={tempValues[item.itemBarcodeID]?.quantity || 1}
                        onChange={(e) => handleTempValueChange(
                          item.itemBarcodeID, 
                          'quantity', 
                          e.target.value
                        )}
                        onClick={(e) => e.stopPropagation()}
                        className="quantity-input"
                      />
                    </td>
                    <td>
                      <select
                        value={tempValues[item.itemBarcodeID]?.status || 'EXCHANGE'}
                        onChange={(e) => handleTempValueChange(
                          item.itemBarcodeID, 
                          'status', 
                          e.target.value
                        )}
                        onClick={(e) => e.stopPropagation()}
                        className="status-select"
                      >
                        <option value="EXCHANGE">Exchange</option>
                        <option value="RETURN">Return</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleSelectItem(item)}
                        className="add-item-button"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

       

        <div className="exchange-return-modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeModalDirect;