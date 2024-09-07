import { useState, useRef, useEffect } from 'react';

const Bill = () => {
  const [mode, setMode] = useState('search'); // 'search' or 'barcode'
  const [barcode, setBarcode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]); // Assuming you fetch or have search results
  const barcodeInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Toggle between focusing search and barcode inputs when Shift is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        if (mode === 'search') {
          // Switch to barcode mode and focus on the barcode input
          setMode('barcode');
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus(); // Focus on the actual barcode input
          }
        } else {
          // Switch to search mode and focus on the search input
          setMode('search');
          if (searchInputRef.current) {
            searchInputRef.current.focus(); // Focus on the actual search input
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode]);

  const handleDropdownKeyEvents = (e) => {
    // Your existing dropdown key handling logic
  };

  const addItemToBill = (item) => {
    // Logic for adding item to bill
  };

  const handleKeyDown = (e, item) => {
    // Logic to handle keyboard events on dropdown items
  };

  return (
    <div className="search-bar-container">
      {/* Show mode indicator based on current focus */}
      <div className="top-bar">
        {mode === 'barcode' ? (
          <span>Barcode Scanner Active</span>
        ) : (
          <span>Search Mode Active</span>
        )}
      </div>

      {/* Both input fields on the same page */}
      <div className="inputs-container">
        {/* Search input */}
        <div className="search-bar">
          <label>
            Search:
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by item code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setMode('search')}
              onKeyDown={handleDropdownKeyEvents}
            />
          </label>
          {dropdownOpen && (
            <div className="dropdown" ref={dropdownRef}>
              <table>
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((item, index) => (
                    <tr
                      key={item.id}
                      onClick={() => addItemToBill(item)}
                      onKeyDown={(e) => handleKeyDown(e, item)}
                      tabIndex="0"
                    >
                      <td>{item.itemCode}</td>
                      <td>{item.itemName}</td>
                      <td>{item.itemCategory}</td>
                      <td>{item.itemType}</td>
                      <td>{item.itemColor}</td>
                      <td>{item.itemSize}</td>
                      <td>{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Barcode input */}
        <div className="barcode-input">
          <label>
            Barcode:
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan or enter barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onFocus={() => setMode('barcode')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Logic to handle item fetching by barcode
                  e.preventDefault();
                }
              }}
              hi
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Bill;
