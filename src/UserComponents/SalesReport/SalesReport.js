import React from 'react';
import './SalesReport.css';

const SalesReport = ({ data }) => {
  // Calculate the sum of totalAmount, set to 0 if no data
  const totalAmountSum = data.length > 0 ? data.reduce((sum, item) => sum + item.totalAmount, 0) : 0;

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
    </div>
  );
};

export default SalesReport;
