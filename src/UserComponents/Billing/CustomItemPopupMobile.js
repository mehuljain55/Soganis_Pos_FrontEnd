import React, { useEffect, useRef } from 'react';
import styles from './CustomItemMobilePopup.module.css';

const CustomItemMobilePopup = ({ 
  showCustomItemModal, 
  setShowCustomItemModal, 
  customItem, 
  handleCustomItemChange, 
  handleAddCustomItem 
}) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (showCustomItemModal && popupRef.current) {
      const firstInput = popupRef.current.querySelector('input[name="itemType"]');
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
    <div className={styles.customItemMobilePopupOverlay}>
      <div className={styles.customItemMobilePopupModal} ref={popupRef}>
        <div className={styles.customItemMobilePopupContent}>
          <div className={styles.customItemMobilePopupHeader}>
            <h4 className={styles.customItemMobilePopupTitle}> Custom Item</h4>
            <button 
              className={styles.customItemMobilePopupCloseButton} 
              onClick={() => setShowCustomItemModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          <div className={styles.customItemMobilePopupBody}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className={styles.customItemMobilePopupFormRow}>
                <div className={styles.customItemMobilePopupFormGroup}>
                  <label className={styles.customItemMobilePopupLabel}>Item Type:</label>
                  <input 
                    className={styles.customItemMobilePopupInput}
                    type="text" 
                    name="itemType" 
                    value={customItem.itemType} 
                    onChange={handleCustomItemChange} 
                    placeholder="Enter item type"
                    onKeyDown={handleCustomItemKeyDown}
                  />
                </div>
              </div>

              <div className={styles.customItemMobilePopupFormRow}>
                <div className={styles.customItemMobilePopupFormGroup}>
                  <label className={styles.customItemMobilePopupLabel}>Item Color:</label>
                  <input 
                    className={styles.customItemMobilePopupInput}
                    type="text" 
                    name="itemColor" 
                    value={customItem.itemColor} 
                    onChange={handleCustomItemChange} 
                    placeholder="Enter item color"
                    onKeyDown={handleCustomItemKeyDown}
                  />
                </div>
              </div>

              <div className={styles.customItemMobilePopupFormRow}>
                <div className={styles.customItemMobilePopupFormGroup}>
                  <label className={styles.customItemMobilePopupLabel}>Item Size:</label>
                  <input 
                    className={styles.customItemMobilePopupInput}
                    type="text" 
                    name="itemSize" 
                    value={customItem.itemSize} 
                    onChange={handleCustomItemChange} 
                    placeholder="Enter item size"
                    onKeyDown={handleCustomItemKeyDown}
                  />
                </div>
              </div>

              <div className={styles.customItemMobilePopupFormRow}>
                <div className={styles.customItemMobilePopupFormGroup}>
                  <label className={styles.customItemMobilePopupLabel}>Quantity:</label>
                  <input 
                    className={styles.customItemMobilePopupInput}
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

              <div className={styles.customItemMobilePopupFormRow}>
                <div className={styles.customItemMobilePopupFormGroup}>
                  <label className={styles.customItemMobilePopupLabel}>Price:</label>
                  <input
                    className={styles.customItemMobilePopupInput}
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

              <div className={styles.customItemMobilePopupFormRow}>
                <div className={styles.customItemMobilePopupFormGroup}>
                  <label className={styles.customItemMobilePopupLabel}>Discount %:</label>
                  <input
                    className={styles.customItemMobilePopupInput}
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

              <div className={styles.customItemMobilePopupFormRow}>
                <div className={styles.customItemMobilePopupFormGroup}>
                  <label className={styles.customItemMobilePopupLabel}>Sell Price (Auto Calculate)</label>
                  <input 
                    className={styles.customItemMobilePopupInput}
                    type="text" 
                    name="sellPrice" 
                    value={sellPrice} 
                    readOnly 
                    onKeyDown={handleCustomItemKeyDown}
                  />
                </div>
              </div>

              <div className={styles.customItemMobilePopupFormRow}>
                <div className={styles.customItemMobilePopupFormGroup}>
                  <label className={styles.customItemMobilePopupLabel}>Total Amount:</label>
                  <input 
                    className={styles.customItemMobilePopupInput}
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
          <div className={styles.customItemMobilePopupFooter}>

            <button 
              className={`${styles.customItemMobilePopupBtn} ${styles.customItemMobilePopupBtnPrimary}`} 
              onClick={() => {
                handleAddCustomItem();
                setShowCustomItemModal(false);
              }}
              onKeyDown={handleCustomItemKeyDown}
            >
              Add Item
            </button>

            <button 
              className={`${styles.customItemMobilePopupBtn} ${styles.customItemMobilePopupBtnSecondary}`} 
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

export default CustomItemMobilePopup;