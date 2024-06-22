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

  // Handle keyboard navigation within dropdown
  const handleKeyDown = (event, item) => {
    if (event.key === 'Enter') {
      addItemToBill(item);
    }
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
    const newItem = {
      ...item,
      quantity: 1, // Initial quantity set to 1
      amount: item.price * 1 // Initial amount based on price and quantity
    };
    setSelectedItems([...selectedItems, newItem]);
    setSearchTerm('');
    setDropdownOpen(false);
    searchInputRef.current.focus(); // Focus back on the search input after selecting an item
  };

  // Remove item from selectedItems
  const removeItemFromBill = (index) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
  };

  // Handle quantity change
  const handleQuantityChange = (index, quantity) => {
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: quantity,
      amount: quantity * updatedItems[index].price // Calculate amount based on quantity and price
    };
    setSelectedItems(updatedItems);
  };

  // Handle key events for dropdown navigation
  const handleDropdownKeyEvents = (event) => {
    const items = dropdownRef.current.querySelectorAll('tr');

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

  // Calculate total amount
  const calculateTotalAmount = () => {
    let total = 0;
    selectedItems.forEach(item => {
      total += item.amount;
    });
    return total;
  };

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
            <table>
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Color</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => addItemToBill(item)}
                    onKeyDown={(e) => handleKeyDown(e, item)}
                    tabIndex="0" // Enable focus for keyboard navigation
                  >
                    <td>{item.itemCode}</td>
                    <td>{item.itemCategory}</td>
                    <td>{item.itemType}</td>
                    <td>{item.itemColor}</td>
                    <td>{item.itemSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Billing items table */}
      <table>
        <thead>
          <tr>
            <th>Barcode ID</th>
            <th>Item Code</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {selectedItems.map((item, index) => (
            <tr key={item.sno}>
              <td>{item.itemBarcodeID}</td>
              <td>{item.itemCode}</td>
              <td>{item.itemCategory} {item.itemType} {item.itemSize}</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                />
              </td>
              <td>{item.price}</td>
              <td>{item.amount}</td>
              <td>
                <button onClick={() => removeItemFromBill(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5" style={{ textAlign: 'right' }}>Total:</td>
            <td>{calculateTotalAmount()}</td>
          </tr>
        </tfoot>
      </table>

      {/* Submit button */}
      <button onClick={handleSubmit}>Submit Bill</button>
    </div>
  );
};

export default NewBillContainer;
