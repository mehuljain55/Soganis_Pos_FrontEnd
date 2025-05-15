import React from 'react';
import './InventoryModal.css';

const InventoryModal = ({ data, onClose }) => {
  // Sort: failed items first
  const sortedData = [...data].sort((a, b) => {
    if (a.status === 'FAILED' && b.status === 'SUCEESS') return -1;
    if (a.status === 'SUCEESS' && b.status === 'FAILED') return 1;
    return 0;
  });

  return (
    <div className="inventory-modal-overlay">
      <div className="inventory-modal-content">
        <h2 className="inventory-modal-title">Inventory Update Summary</h2>
        <ul className="inventory-status-list">
          {sortedData.map((item, index) => (
            <li
              key={index}
              className={`inventory-status-item ${item.status === 'SUCEESS' ? 'inventory-success' : 'inventory-failed'}`}
            >
              <strong>{item.itemCode}:</strong> {item.description}
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="inventory-close-btn">Close</button>
      </div>
    </div>
  );
};

export default InventoryModal;
