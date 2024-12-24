import React, { useState, useEffect } from 'react';
import axios from "axios";
import { API_BASE_URL } from '../Config.js';
import './AddInventoryItem.css'; // Import the CSS file

function AddInventoryItem() {
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [groupList, setGroupList] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity; // Update the quantity for the specific item
    setItems(updatedItems);
  };

  

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0) {
        document.getElementById(`quantityInput-${index - 1}`).focus(); // Focus the previous input
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index < items.length - 1) {
        document.getElementById(`quantityInput-${index + 1}`).focus(); // Focus the next input
      }
    }
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index); // Remove the item at the specified index
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(sessionStorage.getItem("user"));
    const storeId = user ? user.storeId : '';
    setStoreId(storeId); // Set the storeId state

    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeId", storeId);

    try {
      const response = await axios.post(`${API_BASE_URL}/inventory/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const itemsWithStoreId = response.data.map(item => ({ ...item, storeId })); // Add storeId to each item
      setItems(itemsWithStoreId);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to upload file");
    }
  };

  useEffect(() => {
    const fetchGroupList = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/inventory/groupList`);
        setGroupList(response.data);
      } catch (err) {
        console.error("Failed to fetch group list:", err);
      }
    };
    fetchGroupList();
  }, []);

  const handleDownloadGroupData = async () => {
    if (!selectedGroup) {
      alert("Please select a group before downloading!");
      return;
    }

    try {
      const user = JSON.parse(sessionStorage.getItem("user")); // Fetch user data
      const response = await axios.post(
        `${API_BASE_URL}/inventory/format/groupData?groupId=${selectedGroup}`,
        user,
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob", // Expect a file as a response
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `group_${selectedGroup}_inventory.xlsx`); // Dynamic file name
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      alert("Excel downloaded successfully!");
    } catch (err) {
      console.error("Failed to download group data:", err);
      alert("Error downloading Excel. Please try again.");
    }
  };

  const handleRefresh = () => {
    setFile(null);
    setItems([]);
    setError(null);
    document.getElementById('fileInput').value = null;
  };

  const handleUpdateInventory = async () => {
    try {
      // Make the POST request to get the text file as a response
      const response = await axios.post(`${API_BASE_URL}/inventory/upload`, items, {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: 'blob',  // Important to set response type as 'blob' to handle file download
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
  
      const link = document.createElement('a');
      link.href = url;
  
      link.setAttribute('download', 'inventory_update_status.txt');
  
      // Append the anchor to the document body
      document.body.appendChild(link);
  
      link.click();
  
      // Remove the anchor from the document
      link.parentNode.removeChild(link);
  
      alert('Inventory updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update inventory');
    }
  };
  
  

  return (
    <div>
       <h1>Inventory Management</h1>
      
    {/* Section for Group Format Dropdown */}
    <div>
        <h2>Download Format</h2>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="groupDropdown" style={{ marginRight: "10px" }}>
            Select Item:
          </label>
          <select
  id="groupDropdown"
  value={selectedGroup}
  onChange={(e) => setSelectedGroup(e.target.value)}
  style={{ padding: "5px" }}
>
  <option value="">-- Select Group --</option>
  {groupList.map((group) => {
    // Filter out empty items and join with commas
    const groupDetails = [
      group.item1,
      group.item2,
      group.item3,
      group.item4,
      group.item5,
      group.item6,
    ]
      .filter((item) => item && item.trim() !== "") // Exclude empty or whitespace items
      .join(", "); // Join non-empty items with commas

    return (
      <option key={group.sno} value={group.sno}>
        Group {group.sno} - {groupDetails || "No Items"}
      </option>
    );
  })}
</select>

          <button
            onClick={handleDownloadGroupData}
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Download
          </button>
        </div>
      </div>

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
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Store ID</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.schoolCode}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.itemCode}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.size}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.itemColor}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <input
                      id={`quantityInput-${index}`} // Unique ID for each input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)} // Handle key down events
                      style={{ width: "60px" }}
                    />
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{storeId}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <button onClick={() => handleDeleteItem(index)} >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleUpdateInventory} style={{ marginTop: "20px" }}>
            Submit Updated Inventory
          </button>
        </div>
      )}
    </div>
  );
}

export default AddInventoryItem;
