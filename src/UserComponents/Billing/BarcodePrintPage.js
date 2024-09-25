import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Config.js';
import PrintAllPage from './PrintAllPage';



const BarcodePrintPage = () => {
  const [images, setImages] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [showPrintAllPage, setShowPrintAllPage] = useState(false);
  const navigate = useNavigate();
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
    window.print();
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
  
    // Filter out any invalid images (e.g., placeholders)
    const validImages = images.filter(image => image && image !== 'placeholder'); // Adjust condition as necessary
  
    // Calculate how many full pages are needed based on valid images
    const imagesPerPage = 40;
    const totalPages = Math.ceil(validImages.length / imagesPerPage);
  
    for (let page = 0; page < totalPages; page++) {
      printWindow.document.write('<div class="page">');
  
      // Get the current set of images for the page
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
  
    // Wait for the new window to load and then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close(); // Close the window after printing
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
      <div className="no-print" style={styles.header}>
        <input
          type="text"
          placeholder="Enter barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
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

      <div id="printableArea" style={styles.page}>
        {renderGrid()}
      </div>

      {renderPageNavigation()}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    overflowY: 'auto', // Allow vertical scrolling
    maxHeight: '110vh', // Set maximum height for the container to allow vertical scrolling
    overflowX: 'hidden', // Prevent horizontal scrolling
  },
  header: {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px', // Add space between the input and buttons
    alignItems: 'center',
  },
  page: {
    width: '794px', // A4 width in pixels at 96 DPI
    height: '1100px', // A4 height in pixels at 96 DPI
    backgroundColor: 'white', // Set background color to white
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns
    gridTemplateRows: 'repeat(10, 1fr)', // 10 rows
    rowGap: '0', // Remove row gap
    columnGap: '0', // Remove column gap
    boxSizing: 'border-box',
    overflowY: 'auto', // Enable vertical scroll if content exceeds the height
    overflowX: 'hidden', // Prevent horizontal scrolling
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    border: '1px solid lightgray', // Show grid lines on UI
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    display: 'block',
  },
  placeholder: {
    fontSize: '12px',
    color: 'gray',
  },
  deleteButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  input: {
    padding: '8px 12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: '200px', // Set width for consistency
  },
  button: {
    padding: '8px 16px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'white',
    backgroundColor: '#007bff',
    margin: '0 5px', // Space between buttons
    transition: 'background-color 0.3s',
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

