import React, { useState } from 'react';
import './SalesReport.css';
import { API_BASE_URL } from "../Config.js";

const SalesReport = ({ data }) => {
  const [billTypeFilter, setBillTypeFilter] = useState('Both');

  const handleFilterChange = (event) => {
    setBillTypeFilter(event.target.value);
  };

  const filteredData = Array.isArray(data)
    ? data.filter(item => item.totalQuantity > 0 && (billTypeFilter === 'Both' || item.billType === billTypeFilter))
    : [];

  const totalAmountSum = filteredData.reduce((sum, item) => sum + item.totalAmount, 0);

  const handleExport = async () => {
    if (filteredData.length === 0) {
      alert('No data to export.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sales/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredData),
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
    
      
      {/* Bill Type Filter Dropdown */}
      <div className="filter-container">
        <label htmlFor="billTypeFilter">Bill Type: </label>
        <select id="billTypeFilter" value={billTypeFilter} onChange={handleFilterChange}>
          <option value="Both">Both</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Retail">Retail</option>
        </select>
      </div>

      <div className="table-container">
        {filteredData.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Bill Type</th>
                <th>Description</th>
                <th>Item Type</th>
                <th>Item Color</th>
                <th>Size</th>
                <th>Price</th>
                <th>Avg Sell Price</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Item Desc</th>
             
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.billType}</td>
                  <td>{item.description}</td>
                  <td>{item.itemType}</td>
                  <td>{item.itemColor}</td>
                  <td>{item.itemSize}</td>
                  <td>{item.price}</td>
                  <td>{item.sellPrice}</td>
                  <td>{item.totalQuantity}</td>
                  <td>{item.totalAmount}</td>
                  <td>{item.desc}</td>
             
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
