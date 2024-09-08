import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../Config.js';
import { height } from '@fortawesome/free-solid-svg-icons/fa0';

const BarcodePrintPage = () => {
  const [images, setImages] = useState(Array(40).fill(null)); // Initialize with null values
  const [barcode, setBarcode] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null); // Store the index of the dragged image

  const maxImages = 40;

  const handleGenerateBarcode = async () => {
    if (!barcode) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/generate_barcodes?itemCode=${barcode}`);
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      // Find the first empty slot (index with `null` or `undefined` image)
      const emptyIndex = images.findIndex((image) => !image);

      if (emptyIndex !== -1) {
        // Place the new image in the first empty slot
        setImages((prevImages) => {
          const newImages = [...prevImages];
          newImages[emptyIndex] = imageUrl;
          return newImages;
        });
      } else {
        alert(`All ${maxImages} slots are filled.`);
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
    }
  };

  const handleDeleteImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages[index] = null; // Reset to null
      return updatedImages;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
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
      setDraggedIndex(null); // Reset the dragged index
    }
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const renderGrid = () => {
    const grid = [];
    for (let i = 0; i < maxImages; i++) {
      grid.push(
        <div
          key={i}
          style={styles.imageWrapper}
          className="imageWrapper"
          draggable={images[i] ? true : false} // Make image slot draggable if it has an image
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

  return (
    <div style={styles.container}>
      <div className="no-print" style={styles.header}>
        <input
          type="text"
          placeholder="Enter barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />
        <button onClick={handleGenerateBarcode}>Generate Barcode</button>
        <button onClick={handlePrint}>Print</button>
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
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  header: {
    marginBottom: '20px',
  },
  page: {
    width: '794px', // A4 width in pixels at 96 DPI
    height: '1100px', // A4 height in pixels at 96 DPI
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns
    gridTemplateRows: 'repeat(10, 1fr)', // 10 rows
    rowGap: '0', // Remove row gap
    columnGap: '0', // Remove column gap
    boxSizing: 'border-box',
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
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
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
