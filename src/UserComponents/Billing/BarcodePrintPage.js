import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { API_BASE_URL } from '../Config.js';
import { width } from '@fortawesome/free-solid-svg-icons/fa0';
import ItemCodeFetcher from './ItemCodeFetcher.js'; 


const BarcodePrintPage = () => {
  
  const userData = JSON.parse(sessionStorage.getItem('user'));
  const storeId = userData?.storeId; 
  const [images, setImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [barcodeOptions, setBarcodeOptions] = useState([]);
  const [selectedBarcode, setSelectedBarcode] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef(null); 
  const itemRefs = useRef([]); 
  const dropdownRef = useRef(null); 
  const [currentPage, setCurrentPage] = useState(0);
  const barcodeRef = useRef(null);
  const quantityRef = useRef(null);
  const [barcodeImages, setBarcodeImages] = useState([]);
  
  const imagesPerPage = 40;
  

  
  const handleGenerateBarcode = async () => {
     if (!searchTerm.trim()|| quantity < 1) return;
  
    try {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const storeId = userData?.storeId; 
      const response = await fetch(`${API_BASE_URL}/user/generate_barcodes?itemCode=${searchTerm}&storeId=${storeId}`);

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
   

    
      setImages((prevImages) => {
        const newImages = [...prevImages];
        for (let i = 0; i < quantity; i++) {
          newImages.push(imageUrl);
        }
        return newImages;
      });
  
    } catch (error) {
      console.error('Error generating barcode:', error);
    }
  };


  const handleGenerateBarcodeInventoryUpdate = async () => {
    if (!searchTerm.trim() || quantity < 1) return;
  
    try {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const storeId = userData?.storeId;
  
      // Generate barcode
      const barcodeResponse = await fetch(`${API_BASE_URL}/user/generate_barcodes?itemCode=${searchTerm}&storeId=${storeId}`);

      const blob = await barcodeResponse.blob();
      const imageUrl = URL.createObjectURL(blob);
  
      // Call the stock update API
      const stockUpdateResponse = await fetch(`${API_BASE_URL}/inventory/stock_update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemCode: searchTerm,
          qty: quantity,
          storeId: storeId,
        }),
      });

      const stockUpdateMessage = await stockUpdateResponse.text();
      alert(stockUpdateMessage);
  
     
  
      // Set images for the barcode
      setImages((prevImages) => {
        const newImages = [...prevImages];
        for (let i = 0; i < quantity; i++) {
          newImages.push(imageUrl);
        }
        return newImages;
      });
  
    } catch (error) {
      console.error('Error generating barcode or updating stock:', error);
    }
  };
  
  const handleGenerateBarcodeList = async (finalList) => {
    if (!finalList || finalList.length === 0) {
      console.error('No items to generate barcodes');
      return;
    }

    try {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const storeId = userData?.storeId;

      const imagePromises = finalList.map(async ({ itemCode, quantity }) => {
        const response = await fetch(
          `${API_BASE_URL}/user/generate_barcodes?itemCode=${itemCode}&storeId=${storeId}`
        );
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // Generate multiple images based on quantity
        return Array(quantity).fill(imageUrl);
      });

      const results = await Promise.all(imagePromises);

      // Flatten the results and update state
      setImages((prevImages) => [...prevImages, ...results.flat()]);
    } catch (error) {
      console.error('Error generating barcodes:', error);
    }
  };
  
 

  const fetchBarcodes = async (searchTerm) => {
    if (!storeId) {
      console.error('Store ID is not available.');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/getAllItemCode`, {
        params: {
          storeId,
          searchTerm,         },
      });
      const options = response.data.map(item => ({
        value: item.itemCode,
        label: item.description || item.itemCode,
      }));
      setBarcodeOptions(options);
      setShowDropdown(true); // Show dropdown after fetching options
    } catch (error) {
      console.error('Error fetching barcodes:', error);
    }
  };

  
  const handleDeleteImage = (index) => {
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };


  const handlePrint = () => {
    const startIndex = currentPage * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcodes</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0; /* Remove default margins */
              }
              body {
                margin: 0;
                padding: 0;
                background: white; /* Set background color to white for print */
              }
              #printableArea {
                display: grid;
                grid-template-columns: repeat(4, 1fr); /* 4 columns */
                grid-template-rows: repeat(10, 112px); /* 10 rows with specific height */
                width: 794px; /* Ensure exact A4 width for print */
                height: 1123px; /* Ensure exact A4 height for print */
                margin: 0;
                padding: 0;
                overflow: hidden; /* Prevent any scrolling during print */
              }
              .imageWrapper {
                display: flex; /* Center images */
                justify-content: center;
                align-items: center;
                height: 112px; /* Height for each row */
                border: none !important; /* Ensure no border during print */
              }
              img {
                max-width: 100%;
                max-height: 100%;
                display: block;
              }
              .emptySlot {
                display: none; /* Hide the placeholder text */
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
            }
          </style>
        </head>
        <body>
          <div id="printableArea">
            ${Array.from({ length: imagesPerPage }).map((_, index) => {
                const imageIndex = startIndex + index; 
                const image = images[imageIndex]; 
                return `
                  <div class="imageWrapper">
                    ${image ? `<img src="${image}" alt="Barcode" />` : '<div class="emptySlot"></div>'}
                  </div>
                `;
              }).join('')}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close(); 

    printWindow.onload = () => {
      printWindow.print(); 
      printWindow.close(); 
    };
};


  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleClearAll = () => {
    setImages([]);
    setCurrentPage(0); 
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault(); // Prevent scrolling
      if (showDropdown && barcodeOptions.length > 0) {
        const newIndex = Math.min(focusedIndex + 1, barcodeOptions.length - 1);
        setFocusedIndex(newIndex); // Move down
        if (itemRefs.current[newIndex]) {
          itemRefs.current[newIndex].scrollIntoView({ block: 'nearest' }); // Scroll the focused item into view
        }
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault(); // Prevent scrolling
      if (showDropdown) {
        const newIndex = Math.max(focusedIndex - 1, 0);
        setFocusedIndex(newIndex); // Move up
        if (itemRefs.current[newIndex]) {
          itemRefs.current[newIndex].scrollIntoView({ block: 'nearest' }); // Scroll the focused item into view
        }
      }
    } else if (event.key === 'Enter') {
      if (showDropdown) {
        handleSelectBarcode(barcodeOptions[focusedIndex].value); // Select the focused barcode
      } else {
        quantityRef.current.focus(); // Move focus to quantity input
      }
    }
  };

  useEffect(() => {
    // Reset focused index when options change or dropdown is hidden
    if (!showDropdown) {
      setFocusedIndex(0);
    }
  }, [showDropdown]);


  const handleClearCurrentPage = () => {
    const startIndex = currentPage * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
  
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(startIndex, imagesPerPage); // Remove all images from the current page
      return updatedImages;
    });
};

const handleSelectBarcode = (barcode) => {
  setSelectedBarcode(barcode); // Set the selected barcode
  setSearchTerm(barcode); // Set the input field to the selected barcode
  setShowDropdown(false); // Hide the dropdown after selection
  setFocusedIndex(0); // Reset focused index
};

const handleInputChange = (e) => {
  const value = e.target.value;
  setSearchTerm(value);

  if (value.trim() !== '') {
    fetchBarcodes(value); // Fetch barcodes only if input is not empty
  } else {
    setBarcodeOptions([]); // Clear options if the input is empty
    setShowDropdown(false); // Hide the dropdown if no search term
  }
};


  

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
      <head>
        <title>Print Barcodes</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 0; /* Remove default margins */
            }
            body {
              margin: 0;
              padding: 0;
            }
            .page {
              width: 794px; /* A4 width in pixels at 96 DPI */
              height: 1123px; /* A4 height in pixels at 96 DPI */
              display: grid;
              grid-template-columns: repeat(4, 1fr); /* 4 columns */
              grid-template-rows: repeat(10, 1fr); /* 10 rows */
              page-break-after: always; /* New page after each */
              background-color: white; /* Ensure background is white */
            }
            .imageWrapper {
              display: flex;
              justify-content: center;
              align-items: center;
              border: none; /* Hide grid lines */
            }
            img {
              max-width: 100%;
              max-height: 100%;
            }
          }
        </style>
      </head>
      <body>
    `);

    const validImages = images.filter(image => image && image !== 'placeholder');
    const totalPages = Math.ceil(validImages.length / imagesPerPage);
    console.log('Total pages:', totalPages);


    for (let page = 0; page < totalPages; page++) {
      printWindow.document.write('<div class="page">');
      const currentImages = validImages.slice(page * imagesPerPage, (page + 1) * imagesPerPage);
      currentImages.forEach(image => {
        printWindow.document.write(`
          <div class="imageWrapper">
            <img src="${image}" alt="Barcode" />
          </div>
        `);
      });
      printWindow.document.write('</div>');
    }

    printWindow.document.write(`
      </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDrop = (index) => {
    if (draggedIndex !== null) {
      const updatedImages = [...images];
      const temp = updatedImages[index];
      updatedImages[index] = updatedImages[draggedIndex];
      updatedImages[draggedIndex] = temp;
      setImages(updatedImages);
      setDraggedIndex(null);
    }
  };

  const renderGrid = () => {
    const startIndex = currentPage * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const grid = [];
    for (let i = startIndex; i < endIndex; i++) {
      grid.push(
        <div
          key={i}
          style={styles.imageWrapper}
          className="imageWrapper"
          draggable={images[i] ? true : false}
          onDragStart={() => handleDragStart(i)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(i)}
        >
          {images[i] ? (
            <>
              <img src={images[i]} alt={`Barcode ${i + 1}`} style={styles.image} />
              <button
                style={styles.deleteButton}
                className="no-print"
                onClick={() => handleDeleteImage(i)}
              >
                &times;
              </button>
            </>
          ) : (
            <div style={styles.placeholder} className="no-print">
              Empty Slot {i + 1}
            </div>
          )}
        </div>
      );
    }
    return grid;
  };

  const totalPages = Math.ceil(images.length / imagesPerPage);

  const renderPageNavigation = () => (
    <div className="no-print" style={styles.pagination}>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => setCurrentPage(index)}
          style={{
            ...styles.pageButton,
            backgroundColor: currentPage === index ? '#007bff' : '#ccc',
            color: currentPage === index ? '#fff' : '#000',
          }}
        >
          {index + 1}

        </button>
        
      ))}
    </div>
  );
  

 
  useEffect(() => {
    // Reset focused index when options change or dropdown is hidden
    if (!showDropdown) {
      setFocusedIndex(0);
    }
  }, [showDropdown]);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);
  return (
    <div style={styles.container}>
      <div className="sidebar">
        <div style={styles.sidebar}>
          <div className="no-print" style={styles.header}>
          <label>Barcode Id</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm} 
                onChange={handleInputChange} 
                onKeyDown={handleKeyDown} 
                placeholder="Search for Barcode"
                style={styles.input}
              />
              {showDropdown && barcodeOptions.length > 0 && (
                <div ref={dropdownRef} style={styles.dropdown}>
                  {barcodeOptions.map((option, index) => (
                    <div
                      key={option.value}
                      ref={el => itemRefs.current[index] = el} 
                      style={{ ...styles.dropdownItem, ...(focusedIndex === index ? styles.dropdownItemHover : {}) }} 
                      onClick={() => handleSelectBarcode(option.value)}
                    >
                      {option.label} 
                    </div>
                  ))}
                </div>
              )}
            </div>
            <label>Quantity</label>
            <input
              type="number"
              ref={quantityRef}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, e.target.value))} // Ensure quantity is at least 1
              min="1"
              style={styles.input}
            />
            <button 
              onClick={handleGenerateBarcode} 
              style={styles.button}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor} 
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
            >
              Generate Barcode
            </button>

            <button 
              onClick={handleGenerateBarcodeInventoryUpdate} 
              style={styles.button}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor} 
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
            >
              Generate Barcode & Update Inventory
            </button>
            <button 
              onClick={handlePrint} 
              style={styles.button}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor} 
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
            >
              Print
            </button>
            <button 
              onClick={handlePrintAll} 
              style={styles.button}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor} 
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
            >
              Print All
            </button>
            <button 
              onClick={handleClearAll} 
              style={styles.button}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor} 
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
            >
              Clear All
            </button>
            <button 
              onClick={handleClearCurrentPage} 
              style={styles.button}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor} 
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
            >
              Clear Current Page
            </button>
          </div>

          <div classname='right-side-bae'>
          <ItemCodeFetcher
        onFinalize={(finalList) => handleGenerateBarcodeList(finalList)}
      />
          </div>
          {/* Render Pagination Inside the Sidebar */}
          <div className="no-print" style={styles.paginationWrapper}>
            {renderPageNavigation()}
          </div>
        </div>
      </div>
      <div id="printableArea" style={styles.page}>
        {renderGrid()}
      </div>
    </div>
  );
  
};

const styles = {
  container: {
    display: 'flex',
    maxHeight: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: '50px', 
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    width: '250px', // Fixed width for sidebar
    borderRight: '1px solid lightgray',
    position: 'fixed', // Sidebar stays fixed on the screen
    top: 0, // Align with the top of the page
    left: 0, // Align with the left side of the page
    height: '100vh', // Ensure sidebar covers the full height of the screen
    backgroundColor: '#fff', // Ensure the background remains white
    zIndex: 1000, // Ensure it stays above the main content
    overflowY: 'auto', // Allow scrolling within the sidebar if content overflows
  },
  rightSideBar: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    width: '250px', // Fixed width for right sidebar
    borderLeft: '1px solid lightgray',
    position: 'fixed', // Sidebar stays fixed on the screen
    top: 0, // Align with the top of the page
    right: 0, // Align with the right side of the page
    height: '100vh', // Ensure sidebar covers the full height of the screen
    backgroundColor: '#fff', // Ensure the background remains white
    zIndex: 1000, // Ensure it stays above the main content
    overflowY: 'auto', // Allow scrolling within the sidebar if content overflows
  },
  header: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column', // Stack inputs vertically
    gap: '10px',
    alignItems: 'flex-start',
  },
  page: {
    width: '794px', // A4 width in pixels
    height: '1123px', // A4 height in pixels
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(10, 1fr)',
    padding: '20px', // Add padding for spacing
    marginLeft: '270px', // Adjust this to be slightly larger than the sidebar width
  },
  imageWrapper: {
    border: '1px solid lightgray',
    margin: '5px',
    padding: '5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    height: '100%', // Make it fill the grid cell
    position: 'relative', // Set relative positioning
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  deleteButton: {
    position: 'absolute', // Position absolute to the wrapper
    top: '5px', // Adjust top positioning
    right: '5px', // Adjust right positioning
    background: 'none',
    border: 'none',
    color: 'red',
    fontSize: '20px',
    cursor: 'pointer',
    marginTop: '5px',
  },
  placeholder: {
    height: '100px', // Set a fixed height for empty slots
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px dashed gray',
    width: '100%',
    color: 'gray',
  },
 
  pagination: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // Create exactly 3 equal-width columns
    gap: '10px', 
    marginTop: '20px',
    justifyContent: 'center', // Ensure the buttons are centered if fewer than 3 per row
  },
  dropdown: { border: '1px solid #ccc',
    borderRadius: '4px', 
    width: '200px', position: 'absolute',
    zIndex: 1000, backgroundColor: '#fff',
    maxHeight: '200px', 
    overflowY: 'auto' 
    }, // Set fixed size
dropdownItem: { padding: '5px', 
    cursor: 'pointer' 
},
dropdownItemHover: { 
    backgroundColor: '#f0f0f0'
 },

  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    width:'250px',
    cursor: 'pointer',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
};
const printStyles = `
@media print {
  @page {
    size: A4;
    margin: 0; /* Remove default margins */
  }

  body {
    margin: 0;
    padding: 0;
  }

  .no-print {
    display: none !important; /* Ensure elements with 'no-print' class are hidden */
  }

  #printableArea {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(10, 1fr);
    width: 794px; /* Ensure exact A4 width for print */
    height: 1100px; /* Ensure exact A4 height for print */
    margin: 0;
    padding: 0;
    background: white; /* Set background color to white for print */
    overflow: hidden; /* Prevent any scrolling during print */
  }

  .imageWrapper {
    border: none !important; /* Hide grid lines during print */
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}
`;

export default BarcodePrintPage;