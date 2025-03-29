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

  // Implement keyboard navigation based on the provided code
  const handleCustomItemKeyDown = (e) => {
    // Prevent event propagation to stop parent handlers
    e.stopPropagation();
    
    const inputs = popupRef.current.querySelectorAll('.custom-item-billing-input');
    const currentIndex = Array.from(inputs).findIndex(input => input === document.activeElement);
    
    switch (e.key) {
      case 'ArrowRight':
        // Check if we're at the end of a row (even indices 0,2,4,6...)
        if (currentIndex % 2 === 0 && currentIndex < inputs.length - 1) {
          inputs[currentIndex + 1].focus();
          e.preventDefault();
        }
        break;
        
      case 'ArrowLeft':
        // Check if we're at the start of a row (odd indices 1,3,5,7...)
        if (currentIndex % 2 === 1) {
          inputs[currentIndex - 1].focus();
          e.preventDefault();
        }
        break;
        
      case 'ArrowDown':
        // Move down to the next row (add 2 to index)
        if (currentIndex < inputs.length - 2) {
          inputs[currentIndex + 2].focus();
          e.preventDefault();
        }
        break;
        
      case 'ArrowUp':
        // Move up to the previous row (subtract 2 from index)
        if (currentIndex >= 2) {
          inputs[currentIndex - 2].focus();
          e.preventDefault();
        }
        break;
        
      case 'Enter':
        // If Enter is pressed on Add Item button
        if (e.target.textContent === 'Add Item') {
          handleAddCustomItem();
          setShowCustomItemModal(false);
          e.preventDefault();
        } else if (currentIndex === inputs.length - 1) {
          // If we're on the last input, simulate clicking the Add Item button
          popupRef.current.querySelector('.custom-item-billing-btn-primary').click();
          e.preventDefault();
        } else {
          // Move to the next input
          const nextInput = inputs[currentIndex + 1];
          if (nextInput) {
            nextInput.focus();
            e.preventDefault();
          }
        }
        break;
        
      case 'Escape':
        setShowCustomItemModal(false);
        e.preventDefault();
        break;
        
      default:
        break;
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
                    onKeyDown={handleCustomItemKeyDown}
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
              className="custom-item-billing-btn custom-item-billing-btn-primary" 
              onClick={() => {
                handleAddCustomItem();
                setShowCustomItemModal(false);
              }}
              onKeyDown={handleCustomItemKeyDown}
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