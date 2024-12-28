import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../Config.js";
import InventoryManager from './InventoryManager';
import './InventoryUpdate.css';


const InventoryUpdate = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileContent, setFileContent] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setDownloadUrl(''); 
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
    setDownloadUrl('');
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
            responseType: 'blob', // Ensure the response is in blob format
        });


        const blob = new Blob([response.data], { type: 'text/plain' });
        
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'downloaded_file.txt'; // Specify the file name
        document.body.appendChild(link); // Append the link to the document
        link.click(); // Programmatically click the link
        link.remove(); // Remove the link element from the document
        window.URL.revokeObjectURL(url);

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
    setDownloadUrl('');
    setFileContent(''); 
  };

  return (
    <div className="inventory-update-container">
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

      {downloadUrl && (
        <a href={downloadUrl} download="InventoryUpdate.txt">
          Download Inventory Edit Status
        </a>
      )}

      <div classname='download-excel'>
                  <InventoryManager />   
      </div>
    </div>
  );
};

export default InventoryUpdate;
