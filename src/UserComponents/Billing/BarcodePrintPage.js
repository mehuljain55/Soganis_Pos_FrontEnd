import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config.js';

const BarcodePrintPage = () => {
  
  const [images, setImages] = useState([]);
  
  const [barcode, setBarcode] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const barcodeRef = useRef(null);
  const quantityRef = useRef(null);
  
  const imagesPerPage = 40;

  
  const handleGenerateBarcode = async () => {
    if (!barcode || quantity < 1) return;

    try {
      const response = await fetch(`${API_BASE_URL}/generate_barcodes?itemCode=${barcode}`);
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
                const imageIndex = startIndex + index; // Calculate the image index
                const image = images[imageIndex]; // Get the image at that index
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

    printWindow.document.close(); // Close the document to apply styles

    printWindow.onload = () => {
      printWindow.print(); // Trigger print when the content is loaded
      printWindow.close(); // Close the print window after printing
    };
};


  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleClearAll = () => {
    setImages([]);
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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (document.activeElement === barcodeRef.current) {
        quantityRef.current.focus();
        event.preventDefault(); 
      }else if (document.activeElement === quantityRef.current) {
        // Generate barcode when Enter is pressed in the quantity input
        handleGenerateBarcode();
        event.preventDefault(); 
      }
    
    } else if (event.key === 'ArrowDown') {
      event.preventDefault(); // Prevent the default scrolling behavior
      if (document.activeElement === barcodeRef.current) {
        quantityRef.current.focus();
      } else if (document.activeElement === quantityRef.current) {
        barcodeRef.current.focus();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (document.activeElement === quantityRef.current) {
        barcodeRef.current.focus();
      } else if (document.activeElement === barcodeRef.current) {
        quantityRef.current.focus();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


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
      <div style={styles.sidebar}>
        <div className="no-print" style={styles.header}>
          <label>
            Barcode Id
          </label>
          <input
          type="text"
          ref={barcodeRef}
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Enter Barcode"
          style={styles.input}
        />
          <label>
            Quantity
          </label>
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
        </div>
        {renderPageNavigation()}
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
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    width: '250px', // Fixed width for sidebar
    borderRight: '1px solid lightgray',
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
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  },
  pageButton: {
    padding: '10px',
    cursor: 'pointer',
    border: '1px solid #007bff',
    borderRadius: '4px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
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
