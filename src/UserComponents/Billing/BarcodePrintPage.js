import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../Config.js';

const BarcodePrintPage = () => {
  const [images, setImages] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
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
    overflowY: 'auto',
    maxHeight: '115vh',
    overflowX: 'hidden',
  },
  header: {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  page: {
    width: '794px',
    height: '1100px',
    backgroundColor: 'white',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(10, 1fr)',
    rowGap: '0',
    columnGap: '0',
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    border: '1px solid lightgray',
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
    width: '200px',
  },
  button: {
    padding: '8px 12px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  pagination: {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  pageButton: {
    padding: '8px 16px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#ccc',
    color: '#000',
  },
};
const printStyles = `
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body * {
    visibility: hidden;
  }
  #printableArea, #printableArea * {
    visibility: visible;
  }
  #printableArea {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: white;
    overflow: visible; /* Ensure no scrollbars are visible */
    border: none; /* Ensure no borders are printed */
  }
  .no-print {
    display: none; /* Hide elements that should not be printed */
  }
  .imageWrapper {
    border: none !important; /* Ensure no borders are printed around images */
  }
  img {
    border: none !important; /* Ensure no borders are printed around images */
  }
}
`;

export default BarcodePrintPage;
