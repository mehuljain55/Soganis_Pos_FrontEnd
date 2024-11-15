import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config';
import './ItemCodeFetcher.css';

const ItemCodeFetcher = ({ onFinalize }) => {
  const userData = JSON.parse(sessionStorage.getItem('user'));
  const storeId = userData?.storeId;

  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedItemType, setSelectedItemType] = useState('');
  const [itemColors, setItemColors] = useState([]);
  const [selectedItemColor, setSelectedItemColor] = useState('');
  const [itemCodes, setItemCodes] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/user/filter/getSchool`, { params: { storeId } })
      .then((response) => setSchools(response.data))
      .catch((error) => console.error('Error fetching schools:', error));
  }, [storeId]);

  useEffect(() => {
    if (selectedSchool) {
      axios
        .get(`${API_BASE_URL}/user/filter/school/item_type`, { params: { schoolCode: selectedSchool, storeId } })
        .then((response) => setItemTypes(response.data))
        .catch((error) => console.error('Error fetching item types:', error));
      setSelectedItemType('');
      setItemColors([]);
      setSelectedItemColor('');
      setItemCodes([]);
      setQuantities({});
    }
  }, [selectedSchool, storeId]);

  useEffect(() => {
    if (selectedSchool && selectedItemType) {
      axios
        .get(`${API_BASE_URL}/user/filter/school/item_color`, { 
          params: { schoolCode: selectedSchool, itemType: selectedItemType, storeId } 
        })
        .then((response) => setItemColors(response.data))
        .catch((error) => console.error('Error fetching item colors:', error));
      setSelectedItemColor('');
      setItemCodes([]);
      setQuantities({});
    }
  }, [selectedSchool, selectedItemType, storeId]);

  const fetchItemCodes = () => {
    if (selectedSchool && selectedItemType && selectedItemColor) {
      axios
        .get(`${API_BASE_URL}/user/filter/school/item_code`, {
          params: { schoolCode: selectedSchool, itemType: selectedItemType, itemColor: selectedItemColor, storeId },
        })
        .then((response) => setItemCodes(response.data))
        .catch((error) => console.error('Error fetching item codes:', error));
      setQuantities({});
    }
  };

  const handleQuantityChange = (code, value) => {
    setQuantities({ ...quantities, [code]: value });
  };

  const handleFinalize = () => {
    const finalList = itemCodes
      .filter((code) => quantities[code] && quantities[code] > 0)
      .map((code) => ({
        itemCode: code,
        quantity: parseInt(quantities[code], 10),
      }));
    onFinalize(finalList);
  };

  return (
    <div className="item-code-manager">
      <h1>Item Code Manager</h1>
      <div>
        <label>School:</label>
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
        >
          <option value="">Select School</option>
          {schools.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Item Type:</label>
        <select
          value={selectedItemType}
          onChange={(e) => setSelectedItemType(e.target.value)}
          disabled={!selectedSchool}
        >
          <option value="">Select Item Type</option>
          {itemTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Item Color:</label>
        <select
          value={selectedItemColor}
          onChange={(e) => setSelectedItemColor(e.target.value)}
          disabled={!selectedSchool || !selectedItemType}
        >
          <option value="">Select Item Color</option>
          {itemColors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={fetchItemCodes}
        disabled={!selectedSchool || !selectedItemType || !selectedItemColor}
      >
        Fetch 
      </button>
      {itemCodes.length > 0 && (
        <div className="item-code-table">
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {itemCodes.map((code) => (
                <tr key={code}>
                  <td>{code}</td>
                  <td>
                    <input
                      type="number"
                      value={quantities[code] || ''}
                      onChange={(e) => handleQuantityChange(code, e.target.value)}
                      min="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        onClick={handleFinalize}
        disabled={itemCodes.length === 0 || Object.values(quantities).every((q) => !q || q <= 0)}
      >
        Generate Barcode
      </button>
    </div>
  );
};

export default ItemCodeFetcher;
