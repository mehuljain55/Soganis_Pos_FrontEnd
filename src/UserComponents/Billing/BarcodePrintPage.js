import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../Config.js';

const BarcodePrintPage = () => {
  const [images, setImages] = useState([]);
  const [barcode, setBarcode] = useState('');

  const maxImages = 40;

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (images.length + files.length <= maxImages) {
      const newImages = files.map((file) => URL.createObjectURL(file));
      setImages((prevImages) => [...prevImages, ...newImages]);
    } else {
      alert(`You can only upload up to ${maxImages} images to fit on an A4 sheet.`);
    }
  };

  const handleGenerateBarcode = async () => {
    if (!barcode) return;
    try {
      const response = await fetch(`${API_BASE_URL}/generate_barcodes?itemCode=${barcode}`);
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      if (images.length < maxImages) {
        setImages((prevImages) => [...prevImages, imageUrl]);
      } else {
        alert(`You can only upload up to ${maxImages} images to fit on an A4 sheet.`);
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
    }
  };

  const handleDeleteImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    // Add print styles to the page
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
        />
        <button onClick={handleGenerateBarcode}>Generate Barcode</button>
        <button onClick={handlePrint}>Print</button>
      </div>
      <div id="printableArea" style={styles.page}>
        {images.map((image, index) => (
          <div key={index} style={styles.imageWrapper}>
            <img src={image} alt={`Barcode ${index + 1}`} style={styles.image} />
            <button 
              style={styles.deleteButton} 
              className="no-print" 
              onClick={() => handleDeleteImage(index)}
            >
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
  },
  header: {
    marginBottom: '20px',
  },
  page: {
    width: '794px',  // A4 width in pixels at 96 DPI
    height: '1123px', // A4 height in pixels at 96 DPI
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns
    gridTemplateRows: 'repeat(10, 1fr)',   // 10 rows
    rowGap: '0',  // Remove row gap
    columnGap: '0',  // Remove column gap
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
    box-shadow: inset 0 -1px 0 0 black, inset -1px 0 0 0 black; /* Grid lines for print */
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}
`;

export default BarcodePrintPage;
