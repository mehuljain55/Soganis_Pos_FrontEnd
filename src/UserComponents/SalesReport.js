import React from 'react';

const SalesReport = ({ data }) => {
  // Calculate the sum of totalAmount
  const totalAmountSum = data.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="sales-report">
      <h2>Sales Report</h2>
      {data.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Item Barcode ID</th>
                <th>Description</th>
                <th>Item Type</th>
                <th>Item Color</th>
                <th>Sell Price</th>
                <th>Total Quantity</th>
                <th>Total Amount</th>
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
          {/* Display the sum of totalAmount */}
          <div className="total-amount-sum">
            <strong>Total Amount Sum: </strong> {totalAmountSum}
          </div>
        </>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default SalesReport;
