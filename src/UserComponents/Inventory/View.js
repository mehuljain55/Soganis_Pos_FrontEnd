import React, { useState } from "react";
import axios from "axios";
import './AddInventoryItem.css'; // CSS file for styling
import { API_BASE_URL } from '../Config.js';

function AddInventoryItem() {
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_BASE_URL}/inventory/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setItems(response.data); // The parsed data from backend
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to upload file");
    }
  };

  // Handle refreshing data (clear the state)
  const handleRefresh = () => {
    setFile(null);
    setItems([]);
    setError(null);
    document.getElementById('fileInput').value = null; // Reset file input field
  };

  return (
    <div className="container">
      <h1>Upload Excel File</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          accept=".xlsx"
        />
        <button type="submit">Upload</button>
        <button type="button" onClick={handleRefresh} className="refresh-button">
          Refresh
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {items.length > 0 && (
        <div className="table-container">
          <h2>Parsed Data</h2>
          <table className="styled-table">
            <thead>
              <tr>
                <th>School Code</th>
                <th>Item Code</th>
                <th>Size</th>
                <th>Color</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className={`row-${(index % 2) + 1}`}>
                  <td>{item.schoolCode}</td>
                  <td>{item.itemCode}</td>
                  <td>{item.size}</td>
                  <td>{item.itemColor}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AddInventoryItem;
