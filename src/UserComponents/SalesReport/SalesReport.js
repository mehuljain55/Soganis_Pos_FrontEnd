import React from 'react';
import './SalesReport.css';
import { API_BASE_URL } from "../Config.js";

const SalesReport = ({ data }) => {
  const totalAmountSum = data.length > 0 ? data.reduce((sum, item) => sum + item.totalAmount, 0) : 0;

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to export sales report.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Sales_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error exporting sales report:', error);
    }
  };


  return (
    <div className="sales-report">
      <h5>Sales Report </h5>
      <div className="table-container">
        {data.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Item Barcode ID</th>
                <th>Description</th>
                <th>Item Type</th>
                <th>Item Color</th>
                <th>Size</th>
               
                <th>Sell Price</th>
                <th>Quantity</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.itemBarcodeID}</td>
                  <td>{item.description}</td>
                  <td>{item.itemType}</td>
                  <td>{item.itemColor}</td>
                  <td>{item.itemSize}</td>
                  
                  <td>{item.sellPrice}</td>
                  <td>{item.totalQuantity}</td>
                  <td>{item.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data available.</p>
        )}
      </div>
      {/* Display the sum of totalAmount outside of the scrollable container */}
      <div className="total-amount-sum">
        <strong>Total Amount : </strong> {totalAmountSum}
      </div>
      <button className="export-button" onClick={handleExport}>
        Export
      </button>
    </div>
  );
};

export default SalesReport;
