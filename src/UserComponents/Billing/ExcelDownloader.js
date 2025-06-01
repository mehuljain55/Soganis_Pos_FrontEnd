import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config';

const ExcelDownloader = () => {
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/item_update/getItemType`)
      .then((response) => {
        setItemTypes(response.data);
        if (response.data.length > 0) {
          setSelectedType(response.data[0]);
        }
      })
      .catch((error) => {
        console.error('Error fetching item types:', error);
      });
  }, []);

  const downloadExcel = async () => {
    if (!selectedType) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/item_update/export-items`, {
        params: { itemType: selectedType },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `items_${selectedType}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading Excel file:', error);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Download Items by Type</h3>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="itemType">Select Item Type: </label>
        <select
          id="itemType"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {itemTypes.map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <button onClick={downloadExcel} disabled={!selectedType}>
        Download Excel
      </button>
    </div>
  );
};

export default ExcelDownloader;
