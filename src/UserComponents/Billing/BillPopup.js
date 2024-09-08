import React from 'react';
import './BillPopup.css'; // Import CSS for styling

const BillPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="bill-popup">
      <div className="bill-popup-content">
        <h3>Confirm Bill Generation</h3>
        <p>Are you sure you want to generate the bill?</p>
        <div className="bill-popup-buttons">
          <button onClick={onConfirm}>Yes</button>
          <button onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default BillPopup;
