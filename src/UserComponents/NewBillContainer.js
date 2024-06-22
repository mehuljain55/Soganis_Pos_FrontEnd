import React, { useState, useRef, useEffect } from 'react';
import './NewBillContainer.css'; // Import your CSS file

const NewBillContainer = ({ itemList }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Update searchResults based on searchTerm
  useEffect(() => {
    const results = itemList.filter(item =>
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  }, [itemList, searchTerm]);

  const handleQuantityChange = (itemId, newQuantity) => {
    const updatedItems = selectedItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setSelectedItems(updatedItems);
  };
  

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add item to selectedItems
  const addItemToBill = (item) => {
    setSelectedItems([...selectedItems, item]);
    setSearchTerm('');
    setDropdownOpen(false);
    searchInputRef.current.focus(); // Focus back on the search input after selecting an item
  };

  // Handle keyboard navigation within dropdown
  const handleKeyDown = (event, item) => {
    if (event.key === 'Enter') {
      addItemToBill(item);
    }
  };


  // Handle key events for dropdown navigation
  const handleDropdownKeyEvents = (event) => {
    const items = dropdownRef.current.querySelectorAll('li');

    if (event.key === 'ArrowDown' && items.length > 0) {
      event.preventDefault(); // Prevent page scrolling
      items[0].focus();
    } else if (event.key === 'Escape') {
      setDropdownOpen(false);
      searchInputRef.current.focus(); // Focus back on the search input on escape
    }
  };

  // Focus on the first item in the dropdown when it opens
  useEffect(() => {
    if (dropdownOpen && searchResults.length > 0 && dropdownRef.current) {
      dropdownRef.current.firstChild.focus();
    }
  }, [dropdownOpen, searchResults]);

  // Submit button handler
  const handleSubmit = () => {
    // Handle submission logic (e.g., send selectedItems to backend)
    console.log('Submitting items:', selectedItems);
    // Reset selectedItems or perform other actions as needed
  };

  return (
    <div>
      <h2>New Bill Container</h2>
      
      {/* Search bar */}
      <div className="search-bar" ref={searchInputRef} tabIndex="0">
        <input
          type="text"
          placeholder="Search by item code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={handleDropdownKeyEvents}
        />
        {dropdownOpen && (
          <div className="dropdown" ref={dropdownRef}>
            <ul>
              {searchResults.map(item => (
                <li
                  key={item.id}
                  onClick={() => addItemToBill(item)}
                  onKeyDown={(e) => handleKeyDown(e, item)}
                  tabIndex="0" // Enable focus for keyboard navigation
                >
                  {item.itemCode} - {item.itemName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Billing items table */}
      <table>
        <thead>
          <tr>
            <th> Barcode ID</th>
            <th>Item Code</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
             <th> Amount </th>       
          </tr>
        </thead>
        <tbody>
          {selectedItems.map(item => (
              <tr key={item.id}>
              <td>{item.itemBarcodeID}</td>
              <td>{item.itemCode}</td>
              <td>{`${item.itemCategory} ${item.itemType} ${item.itemSize}`}</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                />
              </td>
              <td>{item.price}</td>
              <td>{item.quantity * item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Submit button */}
      <button onClick={handleSubmit}>Submit Bill</button>
    </div>
  );
};

export default NewBillContainer;
