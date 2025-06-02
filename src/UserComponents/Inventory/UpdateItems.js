import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { API_BASE_URL } from "../Config";

const UpdateItems = () => {
  const [items, setItems] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Skip header row and map index-based columns
      const formatted = sheetData.slice(1).map((row) => ({
        barcodeId: row[0]?.toString() || "",
        itemCode: row[1]?.toString() || "",
        description: row[2]?.toString() || "",
        size: row[3]?.toString() || "",
        color: row[4]?.toString() || "",
        schoolName: row[5]?.toString() || "",
        storeId: row[6]?.toString() || "",
      }));

      setItems(formatted);
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    const requestData = {
      itemUpdateList: items,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/item_update/update`, requestData);
      alert(response.data);
    } catch (error) {
      console.error("Error updating items:", error);
      alert("Update failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Update Item List</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {fileName && <p><strong>File:</strong> {fileName}</p>}
      {items.length > 0 && (
        <>
          <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
            <thead>
              <tr>
                <th>Barcode ID</th>
                <th>Item Code</th>
                <th>Description</th>
                <th>Size</th>
                <th>Color</th>
                <th>School Name</th>
                <th>Store ID</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.barcodeId}</td>
                  <td>{item.itemCode}</td>
                  <td>{item.description}</td>
                  <td>{item.size}</td>
                  <td>{item.color}</td>
                  <td>{item.schoolName}</td>
                  <td>{item.storeId}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={{ marginTop: "20px" }} onClick={handleSubmit}>
            Submit to API
          </button>
        </>
      )}
    </div>
  );
};

export default UpdateItems;
