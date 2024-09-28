import React, { useEffect } from 'react';

const PrintAllPage = ({ images }) => {
  const imagesPerPage = 40; // 4 columns x 10 rows per page

  // Divide images into pages of 40 barcodes each
  const getPages = () => {
    const pages = [];
    for (let i = 0; i < images.length; i += imagesPerPage) {
      pages.push(images.slice(i, i + imagesPerPage));
    }
    return pages;
  };

  useEffect(() => {
    if (images.length > 0) {
      setTimeout(() => {
        window.print(); // Slight delay to ensure all images and pages are fully loaded before printing
      }, 500);
    }
  }, [images]);

  return (
    <div>
      {getPages().map((pageImages, pageIndex) => (
        <div key={pageIndex} className="printable-page" style={styles.page}>
          {pageImages.map((image, index) => (
            <div key={index} style={styles.imageWrapper}>
              <img src={image} alt={`Barcode ${index + 1}`} style={styles.image} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const styles = {
  page: {
    width: '794px', // A4 width in pixels at 96 DPI
    height: '1100px', // A4 height in pixels at 96 DPI
    backgroundColor: 'white',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns
    gridTemplateRows: 'repeat(10, 1fr)', // 10 rows (total 40 barcodes per page)
    rowGap: '0',
    columnGap: '0',
    boxSizing: 'border-box',
    pageBreakAfter: 'always', // This ensures that each page is printed separately
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

  .printable-page {
    width: 794px; /* A4 width for print */
    height: 1100px; /* A4 height for print */
    margin: 0;
    padding: 0;
    background: white;
    overflow: hidden; /* Prevent any scrolling during print */
    page-break-after: always; /* Ensure proper page breaks after every A4 page */
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


export default PrintAllPage;
