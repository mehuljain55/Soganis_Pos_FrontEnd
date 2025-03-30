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

  const handleCustomItemKeyDown = (e) => {
    // Prevent the event from propagating to parent elements
    e.stopPropagation();
  
    // Get all input elements within the form
    const formElements = Array.from(e.target.form?.elements || []).filter(
      (el) => el.tagName === "INPUT"
    );
  
    const currentIndex = formElements.indexOf(e.target);
  
    if (e.key === "ArrowDown" && currentIndex < formElements.length - 1) {
      formElements[currentIndex + 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowUp" && currentIndex > 0) {
      formElements[currentIndex - 1]?.focus();
      e.preventDefault();
    }
  };
  
  
  



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
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Each field in its own row */}
   
  
              <div className="custom-item-billing-form-row">
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Item Name:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="itemName" 
                    value={customItem.itemName} 
                    onChange={handleCustomItemChange} 
                    placeholder="Enter item name"
                    onKeyDown={handleCustomItemKeyDown}
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
                    onKeyDown={handleCustomItemKeyDown}
                  />
                </div>
              </div>
  
              <div className="custom-item-billing-form-row">
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Item Color:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="itemColor" 
                    value={customItem.itemColor} 
                    onChange={handleCustomItemChange} 
                    placeholder="Enter item color"
                    onKeyDown={handleCustomItemKeyDown}
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
                    onKeyDown={handleCustomItemKeyDown}
                  />
                </div>
              </div>
  
              <div className="custom-item-billing-form-row">
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Quantity:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="quantity" 
                    value={customItem.quantity} 
                    onChange={handleCustomItemChange} 
                    placeholder="Enter quantity"
                    onKeyDown={handleCustomItemKeyDown}
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
                    onKeyDown={handleCustomItemKeyDown}
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
                  <label className="custom-item-billing-label">Discount %:</label>
                  <input
                    className="custom-item-billing-input"
                    type="text"
                    name="discount"
                    value={customItem.discount}
                    onChange={handleCustomItemChange}
                    placeholder="0"
                    onKeyDown={handleCustomItemKeyDown}
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
                    onKeyDown={handleCustomItemKeyDown}
                  />
                </div>
              </div>
  
              <div className="custom-item-billing-form-row">
                <div className="custom-item-billing-form-group">
                  <label className="custom-item-billing-label">Total Amount:</label>
                  <input 
                    className="custom-item-billing-input"
                    type="text" 
                    name="amount" 
                    value={amount} 
                    readOnly 
                    onKeyDown={handleCustomItemKeyDown}
                  />
                </div>
              </div>
            </form>
          </div>
          <div className="custom-item-billing-footer">
            <button 
              className="custom-item-billing-btn custom-item-billing-btn-secondary" 
              onClick={() => setShowCustomItemModal(false)}
            >
              Cancel
            </button>
            <button 
              className="custom-item-billing-btn custom-item-billing-btn-primary" 
              onClick={() => {
                handleAddCustomItem();
                setShowCustomItemModal(false);
              }}
              onKeyDown={handleCustomItemKeyDown}
            >
              Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomItemPopup;