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

  // Calculate sell price and total amount when price, discount or quantity changes
  const calculatePrices = () => {
    const price = parseInt(customItem.price) || 0;  // Convert to integer
    const discount = parseInt(customItem.discount) || 0;  // Convert to integer
    const quantity = parseInt(customItem.quantity) || 0;  // Convert to integer
    
    const sellPrice = Math.round(price - (price * discount / 100));  // Round sellPrice to integer
    const amount = Math.round(sellPrice * quantity);  // Round amount to integer
    
    return {
      sellPrice: sellPrice,
      amount: amount
    };
  };

  if (!showCustomItemModal) {
    return null;
  }

  const { sellPrice, amount } = calculatePrices();

  return (
    <div className="custom-item-billing-overlay">
      <div className="custom-item-billing-modal" ref={popupRef}>
        <div className="custom-item-billing-content">
          <div className="custom-item-billing-header">
            <div className="custom-item-billing-title">Add Custom Item</div>
            <button 
              className="custom-item-billing-close-button" 
              onClick={() => setShowCustomItemModal(false)}
            >
              ×
            </button>
          </div>
          <div className="custom-item-billing-body">
            <form>
              <div className="custom-item-billing-form-row">
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Item Barcode ID:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="itemBarcodeID" 
                    value={customItem.itemBarcodeID} 
                    onChange={handleCustomItemChange} 
                    readOnly 
                  />
                </div>
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Item Name:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="itemName" 
                    value={customItem.itemName} 
                    onChange={handleCustomItemChange} 
                    placeholder="Enter item name"
                  />
                </div>
              </div>

              <div className="custom-item-billing-form-row">
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Item Type:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="itemType" 
                    value={customItem.itemType} 
                    onChange={handleCustomItemChange} 
                    placeholder="Enter item type"
                  />
                </div>
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Item Color:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="itemColor" 
                    value={customItem.itemColor} 
                    onChange={handleCustomItemChange} 
                    placeholder="Enter item color"
                  />
                </div>
              </div>

              <div className="custom-item-billing-form-row">
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Item Size:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="itemSize" 
                    value={customItem.itemSize} 
                    onChange={handleCustomItemChange} 
                    placeholder="Enter item size"
                  />
                </div>
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Quantity:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="quantity" 
                    value={customItem.quantity} 
                    onChange={handleCustomItemChange} 
                    placeholder="Enter quantity"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="custom-item-billing-form-row">
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Price:</label>
                  <input
                    className="custom-item-billing-input"
                    type="text"
                    name="price"
                    value={customItem.price}
                    onChange={handleCustomItemChange}
                    placeholder="0"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Discount %:</label>
                  <input
                    className="custom-item-billing-input"
                    type="text"
                    name="discount"
                    value={customItem.discount}
                    onChange={handleCustomItemChange}
                    placeholder="0"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="custom-item-billing-form-row">
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Sell Price:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="sellPrice" 
                    value={sellPrice} 
                    readOnly 
                  />
                </div>
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Total Amount:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="amount" 
                    value={amount} 
                    readOnly 
                  />
                </div>
              </div>
            </form>
          </div>
          <div className="custom-item-billing-footer">
            <button 
              className="custom-item-billing-btn custom-item-billing-btn-primary" 
              onClick={() => {
                handleAddCustomItem();
                setShowCustomItemModal(false);
              }}
            >
              Add Item
            </button>
            <button 
              className="custom-item-billing-btn custom-item-billing-btn-secondary" 
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
