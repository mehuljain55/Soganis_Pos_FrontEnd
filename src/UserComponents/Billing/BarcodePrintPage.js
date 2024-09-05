import React, { useState } from 'react';
import axios from 'axios';

const BarcodePrintPage = () => {
  const [images, setImages] = useState([]);
  const [itemCode, setItemCode] = useState('');

  const maxImages = 40; // 10 rows x 4 columns

  const handleGenerateBarcode = async () => {
    try {
      const response = await axios.get('http://localhost:8080/generate_barcodes', {
        params: { itemCode },
        responseType: 'arraybuffer',
      });

      const imageBlob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(imageBlob);

      if (images.length < maxImages) {
        setImages((prevImages) => [...prevImages, imageUrl]);
      } else {
        alert(`You can only generate up to ${maxImages} barcodes to fit on an A4 sheet.`);
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
      alert('Failed to generate the barcode. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <div style={styles.container}>
      <div className="no-print" style={styles.header}>
        <input
          type="text"
          value={itemCode}
          placeholder="Enter item code"
          onChange={(e) => setItemCode(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleGenerateBarcode}>Generate Barcode</button>
        <button onClick={handlePrint}>Print</button>
      </div>

      {/* Scrollable container */}
      <div id="printableArea" style={styles.page}>
        {images.map((image, index) => (
          <div key={index} style={styles.imageWrapper}>
            <img src={image} alt={`Barcode ${index + 1}`} style={styles.image} />
            <button style={styles.deleteButton} onClick={() => handleDeleteImage(index)}>
              &times;
            </button>
          </div>
        ))}
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
    height: '100vh', // Full page height to enable scrolling
    overflowY: 'auto', // Enable vertical scroll
  },
  header: {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    width: '200px',
  },
  page: {
    width: '794px',  // A4 width in pixels at 96 DPI
    height: '1123px', // A4 height in pixels at 96 DPI
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(10, 1fr)',
    rowGap: '10px',
    columnGap: '10px',
    boxSizing: 'border-box',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    display: 'block',
  },
  deleteButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// Print styles
const printStyles = `
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  
  body {
    margin: 0;
    padding: 0;
  }

  .no-print {
    display: none;
  }
  
  #printableArea {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(10, 1fr);
    width: 794px;
    height: 1123px;
    row-gap: 10px;
    column-gap: 10px;
    margin: 0 auto;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = printStyles;
document.head.appendChild(styleSheet);

export default BarcodePrintPage;
