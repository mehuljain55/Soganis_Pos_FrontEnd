import React, { useState } from "react";
import axios from "axios";

function AddInventoryItem() {
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8080/inventory/add", formData, {
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
    <div>
      <h1>Upload Excel File</h1>
      <form onSubmit={handleSubmit}>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          accept=".xlsx"
        />
        <button type="submit">Upload</button>
        <button type="button" onClick={handleRefresh} style={{ marginLeft: "10px" }}>
          Refresh
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {items.length > 0 && (
        <div>
          <h2>Parsed Data</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>School Code</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Item Code</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Size</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Color</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.schoolCode}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.itemCode}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.size}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.itemColor}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.quantity}</td>
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
