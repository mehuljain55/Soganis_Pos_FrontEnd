import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../Config.js";
import InventoryManager from './InventoryManager';
import InventoryModal from './InventoryModal.js';
import styles from './InventoryUpdate.module.css';

const InventoryUpdate = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showFieldSelectionModal, setShowFieldSelectionModal] = useState(false);
  const [itemUpdateList, setItemUpdateList] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);

  const availableFields = [
    'Item Code',
    'Item Description',
    'Item Type',
    'Item Color',
    'Item Size',
    'School Name',
    'Price',
    'Wholesale Price',
    'Quantity'
  ];

  const getUserData = () => {
    const user = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    return {
      user: user ? JSON.parse(user) : null,
      token: token || null
    };
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileContent(''); 
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add(styles.dragover); 
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles.dragover); 
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    setFileContent('');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove(styles.dragover); 
  };

  const handleUpload = () => {
    if (!file) return;
    setShowFieldSelectionModal(true);
  };

  const handleFieldSelection = (field) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleConfirmUpload = async () => {
    if (selectedFields.length === 0) {
      alert('Please select at least one field to update.');
      return;
    }

    const userData = getUserData();
    const storeId = userData.user?.storeId;

    setIsUploading(true);
    setIsLoading(true);
    setShowFieldSelectionModal(false);

    const formData = new FormData();
    formData.append('file', file);
    
    // Create the request data object
    const requestData = {
      user: userData.user,
      token: userData.token,
      storeId: storeId,
      itemUpdateValueList: selectedFields
    };
    
    formData.append('requestData', new Blob([JSON.stringify(requestData)], {
      type: 'application/json'
    }));

    try {
      const response = await axios.post(`${API_BASE_URL}/inventory/edit/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setItemUpdateList(response.data.payload);
      setShowItemModal(true);
      console.log('Upload successful:', response);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setIsLoading(false);
      setFile(null);
      setSelectedFields([]);
    }
  };

  const handleCancelUpload = () => {
    setShowFieldSelectionModal(false);
    setSelectedFields([]);
  };

  const handleClear = () => {
    setFile(null);
    setFileContent(''); 
  };

  return (
    <div className={styles.inventoryUpdateContainer}>
      {/* Left half - Inventory Upload */}
      <div className={styles.inventoryUploadSection}>
        <h2 className={styles.sectionTitle}>Inventory Upload</h2>
        
        {!file ? (
          <label
            className={styles.dropZone}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
            />
            <p>Drag & drop Excel file here, or click to select file</p>
          </label>
        ) : (
          <div className={styles.fileInfo}>
            <span className={styles.fileIcon}>📄</span>
            <span className={styles.fileName}>{file.name}</span>
            <button onClick={handleClear} disabled={isLoading || isUploading}>Remove</button>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button onClick={handleUpload} disabled={!file || isLoading || isUploading}>
            {isUploading ? 'Uploading file...' : isLoading ? 'Waiting for response...' : 'Upload & Review'}
          </button>
        </div>

        {isLoading && <div className={styles.loadingAnimation}>Waiting for response...</div>}

        {fileContent && (
          <div className={styles.responseBox}>
            <h3>File Content:</h3>
            <pre>{fileContent}</pre>
          </div>
        )}
      </div>

      {/* Right half - Inventory Manager */}
      <div className={styles.inventoryManagerSection}>
        <h2 className={styles.sectionTitle}>Inventory Manager</h2>
        <InventoryManager />
      </div>

      {/* Field Selection Modal */}
      {showFieldSelectionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Select Fields to Update</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Choose which fields you want to update from the uploaded file:</p>
              <div className={styles.fieldCheckboxContainer}>
                {availableFields.map(field => (
                  <label key={field} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={() => handleFieldSelection(field)}
                      className={styles.checkbox}
                    />
                    <span>{field}</span>
                  </label>
                ))}
              </div>
              <div className={styles.selectedCount}>
                Selected: {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                onClick={handleCancelUpload} 
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmUpload}
                className={styles.confirmButton}
                disabled={selectedFields.length === 0}
              >
                Confirm & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {showItemModal && <InventoryModal data={itemUpdateList} onClose={() => setShowItemModal(false)} />}
    </div>
  );
};

export default InventoryUpdate;