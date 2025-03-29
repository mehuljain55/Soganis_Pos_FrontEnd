import React, { useEffect, useRef } from 'react';
import './CustomItemPopup.css';

const CustomItemPopup = ({ 
  showCustomItemModal, 
  setShowCustomItemModal, 
  customItem, 
  handleCustomItemChange, 
  handleAddCustomItem 
}) => {
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowCustomItemModal(false);
      }
    };

    if (showCustomItemModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomItemModal, setShowCustomItemModal]);

  // Handle ESC key to close popup
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowCustomItemModal(false);
      }
    };

    if (showCustomItemModal) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCustomItemModal, setShowCustomItemModal]);

  // Focus on the first input field when the popup opens
  useEffect(() => {
    if (showCustomItemModal && popupRef.current) {
      const firstInput = popupRef.current.querySelector('input[name="itemName"]');
      if (firstInput) {
        setTimeout(() => {
          firstInput.focus();
        }, 100);
      }
    }
  }, [showCustomItemModal]);

  if (!showCustomItemModal) {
    return null;
  }

  return (
    <div className="popup-overlay">
      <div className="billing-custom-item-modal" ref={popupRef}>
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title">Add Custom Item</div>
            <button 
              className="close-button" 
              onClick={() => setShowCustomItemModal(false)}
            >
              ×
            </button>
          </div>
          <div className="modal-body">
            <form>
              <div className="form-row">
                <div className="form-group">
                  <label>Item Barcode ID:</label>
                  <input type="text" name="itemBarcodeID" value={customItem.itemBarcodeID} onChange={handleCustomItemChange} readOnly />
                </div>
                <div className="form-group">
                  <label>Item Name:</label>
                  <input type="text" name="itemName" value={customItem.itemName} onChange={handleCustomItemChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Item Type:</label>
                  <input type="text" name="itemType" value={customItem.itemType} onChange={handleCustomItemChange} />
                </div>
                <div className="form-group">
                  <label>Item Color:</label>
                  <input type="text" name="itemColor" value={customItem.itemColor} onChange={handleCustomItemChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Item Size:</label>
                  <input type="text" name="itemSize" value={customItem.itemSize} onChange={handleCustomItemChange} />
                </div>
                <div className="form-group">
                  <label>Quantity:</label>
                  <input 
                    type="text" 
                    name="quantity" 
                    value={customItem.quantity} 
                    onChange={handleCustomItemChange} 
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price:</label>
                  <input
                    type="text"
                    name="price"
                    value={customItem.price}
                    onChange={handleCustomItemChange}
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Discount %:</label>
                  <input
                    type="text"
                    name="discount"
                    value={customItem.discount}
                    onChange={handleCustomItemChange}
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sell Price:</label>
                  <input type="text" name="sellPrice" value={customItem.sellPrice} readOnly />
                </div>
                <div className="form-group">
                  <label>Total Amount:</label>
                  <input type="text" name="amount" value={customItem.amount} readOnly />
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button 
              className="btn btn-primary" 
              onClick={() => {
                handleAddCustomItem();
                setShowCustomItemModal(false);
              }}
            >
              Add Item
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowCustomItemModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomItemPopup;