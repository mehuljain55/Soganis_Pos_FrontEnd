import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../Config.js";
import InventoryManager from './InventoryManager';
import InventoryModal from './InventoryModal.js';
import './InventoryUpdate.css';

const InventoryUpdate = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const[showItemModal,setShowItemModal]= useState(false);
  const[itemUpdateList,setItemUpdateList]=useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileContent(''); 
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover'); 
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover'); 
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    setFileContent('');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover'); 
  };

 const handleUpload = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const storeId = user?.storeId;

    if (!file) return;
    setIsUploading(true);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('storeId', storeId);

    try {
      const response = await axios.post(`${API_BASE_URL}/inventory/edit/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setItemUpdateList(response.data.payload)
      setShowItemModal(true);
      console.log('Upload successful:', response);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setIsLoading(false);
      setFile(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setFileContent(''); 
  };

  return (
    <div className="inventory-update-container">
      {/* Left half - Inventory Upload */}
      <div className="inventory-upload-section">
        <h2 className="section-title">Inventory Upload</h2>
        
        {!file ? (
          <label
            className="drop-zone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              style={{ display: 'none' }} // Hide default file input
            />
            <p>Drag & drop Excel file here, or click to select file</p>
          </label>
        ) : (
          <div className="file-info">
            <span className="file-icon">📄</span>
            <span className="file-name">{file.name}</span>
            <button onClick={handleClear} disabled={isLoading || isUploading}>Remove</button>
          </div>
        )}

        <div className="button-group">
          <button onClick={handleUpload} disabled={!file || isLoading || isUploading}>
            {isUploading ? 'Uploading file...' : isLoading ? 'Waiting for response...' : 'Submit'}
          </button>
        </div>

        {isLoading && <div className="loading-animation">Waiting for response...</div>}

        {fileContent && (
          <div className="response-box">
            <h3>File Content:</h3>
            <pre>{fileContent}</pre>
          </div>
        )}


      </div>

      {/* Right half - Inventory Manager */}
      <div className="inventory-manager-section">
        <h2 className="section-title">Inventory Manager</h2>
        <InventoryManager />
      </div>

    {showItemModal && <InventoryModal data={itemUpdateList} onClose={() => setShowItemModal(false)} />}


    </div>
  );
};

export default InventoryUpdate;