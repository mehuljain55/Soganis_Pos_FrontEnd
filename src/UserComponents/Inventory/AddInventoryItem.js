import React, { useState, useEffect } from 'react';
import axios from "axios";
import { API_BASE_URL } from '../Config.js';
import './AddInventoryItem.css'; // Import the CSS file
import InventoryUpdateHistory from './InventoryUpdateHistory.js';

function AddInventoryItem() {
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [groupList, setGroupList] = useState([]);
  const [storeId, setStoreId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupDataList, setGroupDataList] = useState([]);
  const [selectGroupData, setSelectedGroupData] = useState("");
  const [status,setStatus]=useState("");
  const [showHistory, setShowHistory] = useState(false); // State to toggle history popup


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setItems([]);
    setStatus("");
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
  
    // Retrieve the user object from sessionStorage
    const user = JSON.parse(sessionStorage.getItem("user"));
    const storeId = user?.storeId || ""; // Use optional chaining and fallback to an empty string
  
    if (!storeId) {
      setError("Store ID is missing. Please ensure you are logged in.");
      return;
    }
  
    if (!file) {
      setError("No file selected. Please choose a file to upload.");
      return;
    }
  
    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeId", storeId);
  
    try {
      // Make the API request
      const response = await axios.post(`${API_BASE_URL}/inventory/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // Process the response data
      const itemModel = response.data.itemModelList || [];
      const itemsWithStoreId = itemModel.map((item) => ({ ...item, storeId })); // Add storeId to each item
  
      // Update states
      setItems(itemsWithStoreId);
      setStatus(response.data.status);
      setError(null);
    } catch (err) {
      // Log detailed error information and set error state
      console.error("Error during file upload:", err);
      setError(err.response?.data?.message || "Failed to upload file. Please try again.");
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

  useEffect(() => {
    const fetchGroupDataList = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/inventory/groupDataList`);
        setGroupDataList(response.data);
      } catch (err) {
        console.error("Failed to fetch group list:", err);
      }
    };
    fetchGroupDataList();
  }, []);

 
  const handleDownloadGroupWiseData = async () => {
    if (!selectedGroup) {
      alert("Please select a group before downloading!");
      return;
    }
  
    try {
      const user = JSON.parse(sessionStorage.getItem("user")); // Fetch user data
  
      console.log("Group List:", groupList);
  
      // Ensure groupList is not empty and find the selected group
      if (!groupList || groupList.length === 0) {
        alert("Group list is empty. Please try again later.");
        return;
      }
  
      const selectedGroupData = groupList.find((group) => String(group.sno) === String(selectedGroup));
  
      console.log("Selected Group Data:", selectedGroupData);
  
      // If the group is not found, show an alert and return
      if (!selectedGroupData) {
        alert("Selected group not found. Please refresh and try again.");
        return;
      }
  
      // Extract and filter item names, separated by commas instead of underscores
      const groupItems = [
        selectedGroupData.item1,
        selectedGroupData.item2,
        selectedGroupData.item3,
        selectedGroupData.item4,
        selectedGroupData.item5,
        selectedGroupData.item6,
      ]
        .filter((item) => item && item.trim() !== "") // Remove empty values
        .join(","); // Join with commas for filename
  
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
  
      const fileName = `${groupItems || "No_Items"}.xlsx`;
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
  
      // Show toast with countdown
      setShowToast(true);
      setCountdown(5);
  
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setShowToast(false);
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Failed to download group data:", err);
      alert("Error downloading Excel. Please try again.");
    }
  };
  
  
  const handleDownloadGroupData = async () => {
    if (!selectGroupData) {
      alert("Please select a group before downloading!");
      return;
    }

    try {
      const user = JSON.parse(sessionStorage.getItem("user")); // Fetch user data
      const response = await axios.post(
        `${API_BASE_URL}/inventory/format/group/groupData?itemType=${selectGroupData}`,
        user,
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `GROUP_${selectGroupData}.xlsx`); // Dynamic file name
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
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
      handleClearFile();
    } catch (err) {
      console.error(err);
      alert('Failed to update inventory');
    }
  };
  
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFile(file);
    }
  };

  return (
    <div className="item-add-inventory-update-container" style={{ position: "relative" }}>
    <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Inventory Management</h1>
    <button
      className="view-history-button"
      onClick={() => setShowHistory(true)}
    >
      View Update History
    </button>

      <div className="item-add-inventory-update-grid">
        {/* Section 1: Upload Excel */}
        <div className="item-add-inventory-update-section">
          <h2>Upload Excel File</h2>
          {file ? (
            <div>
              <div className="file-info">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/8/86/Microsoft_Excel_2013_logo.svg"
                  alt="Excel Icon"
                  style={{ width: "50px", marginRight: "10px" }}
                />
                <span>{file.name}</span>
              </div>
              <button onClick={handleClearFile} style={{ backgroundColor: "#f44336" }}>
                Clear
              </button>
              <button onClick={handleSubmit}>Show</button>
            </div>
          ) : (
            <div>
              <div
                className="item-add-inventory-update-drag-area"
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("fileInput").click()}
              >
                Drag & Drop File Here or Click to Upload
              </div>
              <input
                id="fileInput"
                type="file"
                onChange={handleFileChange}
                accept=".xlsx"
                style={{ display: "none" }}
              />
          
            </div>
          )}
        </div>
  
        {/* Section 2: Download Item Data */}
        <div className="item-add-inventory-update-section">
          <h2>Download Item Data</h2>
          <label htmlFor="itemDropdown">Select Item:</label>
          <select
            id="itemDropdown"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">-- Select Item --</option>
            {groupList.map((group) => {
              const groupDetails = [
                group.item1,
                group.item2,
                group.item3,
                group.item4,
                group.item5,
                group.item6,
              ]
                .filter((item) => item && item.trim() !== "")
                .join(", ");
  
              return (
                <option key={group.sno} value={group.sno}>
                  Group {group.sno} - {groupDetails || "No Items"}
                </option>
              );
            })}
          </select>
          <button onClick={handleDownloadGroupWiseData}>Download</button>
        </div>
  
        {/* Section 3: Download Group Data */}
        <div className="item-add-inventory-update-section">
          <h2>Download Group Data</h2>
          <label htmlFor="groupDropdown">Select Group:</label>
          <select
            id="groupDropdown"
            value={selectGroupData}
            onChange={(e) => setSelectedGroupData(e.target.value)}
          >
            <option value="">-- Select Group --</option>
            {groupDataList.map((group, index) => (
              <option key={index} value={group}>
                {group}
              </option>
            ))}
          </select>
          <button onClick={handleDownloadGroupData}>Download</button>
        </div>
         {/* Section 4: Group Data Status */}
         <div className="item-add-inventory-update-section">
  <h2>Group Data Status</h2>
  <div className="status-box" role="status" aria-live="polite">
    {status
      ? status.split("\n").map((line, index) => <div key={index}>{line}</div>)
      : "Status will appear here..."}
  </div>
  </div>
  
      </div>
  
      {/* Table Section */}
      {items.length > 0 && (
        <div>
          <h2 style={{ textAlign: "center", marginTop: "30px" }}>Item Data</h2>
          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>School Code</th>
                  <th>Item Code</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Current Quantity</th>
                  <th>Quantity</th>
                  <th>Store ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.schoolCode}</td>
                    <td>{item.itemCode}</td>
                    <td>{item.size}</td>
                    <td>{item.itemColor}</td>
                    <td>{item.currentQuantity}</td>
                    <td>
                      <input
                        id={`quantityInput-${index}`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>{storeId}</td>
                    <td>
                      <button onClick={() => handleDeleteItem(index)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleUpdateInventory} style={{ marginTop: "20px" }}>
            Submit Updated Inventory
          </button>
        </div>
      )}
            {showHistory && (
        <InventoryUpdateHistory onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
  }

  export default AddInventoryItem;