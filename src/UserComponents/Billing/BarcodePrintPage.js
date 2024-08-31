import React, { useState } from 'react';

const BarcodePrintPage = () => {
  const [images, setImages] = useState([]);

  // Calculate max images to fit 5 rows and 3 columns
  const maxImages = 15; // 5 rows x 3 columns

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (images.length + files.length <= maxImages) {
      const newImages = files.map((file) => URL.createObjectURL(file));
      setImages((prevImages) => [...prevImages, ...newImages]);
    } else {
      alert(`You can only upload up to ${maxImages} images to fit on an A4 sheet.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      <div className="no-print" style={styles.header}>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
        <button onClick={handlePrint}>Print</button>
      </div>
      <div id="printableArea" style={styles.page}>
        {images.map((image, index) => (
          <div key={index} style={styles.imageWrapper}>
            <img src={image} alt={`Barcode ${index + 1}`} style={styles.image} />
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
    gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns
    gridTemplateRows: 'repeat(5, 1fr)',    // 5 rows
    rowGap: '2px', // Vertical gap to prevent cutting off content
    boxSizing: 'border-box', // Include padding and border in element's total width and height
  },
  imageWrapper: {
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
};

// Print styles
const printStyles = `
@media print {
  .no-print {
    display: none;
  }
  #printableArea {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(5, 1fr);
    row-gap: 2px; /* Maintain vertical gap for printing */
    width: 794px;
    height: 1123px;
  }
  * {
    margin: 0;
    padding: 0;
  }
}
`;

// Add print styles to the page
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = printStyles;
document.head.appendChild(styleSheet);

export default BarcodePrintPage;