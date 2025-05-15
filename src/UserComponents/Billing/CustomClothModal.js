import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CustomClothModal.css';
import { CUSTOM_CLOTH_CATEGORY, CUSTOM_CLOTH_TYPE, CUSTOM_CLOTH_COLOR, CUSTOM_CLOTH_PRICE } from '../Api/ApiConstants';

const CustomClothModal = ({ onAddCloth, onClose }) => {
  const [description, setDescription] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemType, setItemType] = useState('');
  const [itemColor, setItemColor] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState(1.0);

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);

  const getUserData = () => {
    const user = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    return {
      user: user ? JSON.parse(user) : null,
      token: token || null
    };
  };

  // L1: Fetch Cloth Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { user, token } = getUserData();
        const requestBody = {
          user,
          token,
          storeId: user.storeId
        };
        const response = await axios.post(CUSTOM_CLOTH_CATEGORY, requestBody);
        if (response.data.status === 'success') {
          setCategoryOptions(response.data.payload);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching cloth categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // L2: Fetch Cloth Types based on category
  useEffect(() => {
    const fetchTypes = async () => {
      if (!itemCategory) return;
      try {
        const { user, token } = getUserData();
        const requestBody = {
          user,
          token,
          itemCategory,
        };
        const response = await axios.post(CUSTOM_CLOTH_TYPE, requestBody);
        if (response.data.status === 'success') {
          setTypeOptions(response.data.payload);
          setItemType('');
          setItemColor('');
          setColorOptions([]);
          setDescription('');
          setPrice('');
        } else {
          console.error('Failed to fetch types');
        }
      } catch (error) {
        console.error('Error fetching cloth types:', error);
      }
    };

    fetchTypes();
  }, [itemCategory]);

  // L3: Fetch Colors based on category and type
  useEffect(() => {
    const fetchColors = async () => {
      if (!itemCategory || !itemType) return;
      try {
        const { user, token } = getUserData();
        const requestBody = {
          user,
          token,
          storeId: user.storeId, // Use the actual store ID from user
          itemCategory,
          clothType: itemType,
        };
        const response = await axios.post(CUSTOM_CLOTH_COLOR, requestBody);
        if (response.data.status === 'success') {
          setColorOptions(response.data.payload);
          setItemColor('');
          setDescription('');
          setPrice('');
        } else {
          console.error('Failed to fetch colors');
        }
      } catch (error) {
        console.error('Error fetching colors:', error);
      }
    };

    fetchColors();
  }, [itemType]);

  // L4: Fetch Description and Price
  useEffect(() => {
    const fetchPrice = async () => {
      if (!itemCategory || !itemType || !itemColor) return;
      try {
        const { user, token } = getUserData();
        const requestBody = {
          user,
          token,
          storeId: user.storeId, // Use the actual store ID from user
          itemCategory,
          clothType: itemType,
          itemColor,
        };
        const response = await axios.post(CUSTOM_CLOTH_PRICE, requestBody);
        if (response.data.status === 'success') {
          setDescription(response.data.payload.description);
          setPrice(response.data.payload.price);
        } else {
          console.error('Failed to fetch price/description');
        }
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    fetchPrice();
  }, [itemColor]);

  const handleSubmit = () => {
    onAddCloth(description, itemCategory, itemColor, size.toFixed(1), price);
    onClose();
  };

  // Stop propagation on modal click to prevent closing when clicking inside
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="custom-cloth-modal" onClick={handleModalClick}>
        <h5>Add Custom Cloth</h5>

        <label>Category</label>
        <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}>
          <option value="">Select</option>
          {categoryOptions.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>

        <label>Type</label>
        <select value={itemType} onChange={(e) => setItemType(e.target.value)} disabled={!itemCategory}>
          <option value="">Select</option>
          {typeOptions.map((type, idx) => (
            <option key={idx} value={type}>{type}</option>
          ))}
        </select>

        <label>Color</label>
        <select value={itemColor} onChange={(e) => setItemColor(e.target.value)} disabled={!itemType}>
          <option value="">Select</option>
          {colorOptions.map((col, idx) => (
            <option key={idx} value={col}>{col}</option>
          ))}
        </select>

        <label>Size</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={size}
          onChange={(e) => setSize(parseFloat(e.target.value) || 0)}
          className="number-field"
        />

        <label>Price</label>
        <div className="info-field">₹{price || '0'}</div>
        
        <label>Description</label>
        <div className="info-field">{description || 'No description available'}</div>

        <div className="modal-actions">
          <button onClick={handleSubmit} disabled={!price}>Add</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CustomClothModal;