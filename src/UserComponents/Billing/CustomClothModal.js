import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomClothModal.css';
import { CUSTOM_CLOTH_PANA_SIZE, FIND_CLOTH } from '../Api/ApiConstants';

const CustomClothModal = ({ onAddItem, onClose }) => {
  const [clothType, setClothType] = useState('SHIRTING');
  const [pannaSize, setPannaSize] = useState('');
  const [selectedCloth, setSelectedCloth] = useState(null);
  const [size, setSize] = useState('');
  const [pannaSizeList, setPannaSizeList] = useState([]);
  const [clothList, setClothList] = useState([]);
  const [loading, setLoading] = useState(false);

  const getUserData = () => {
    const user = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    return {
      user: user ? JSON.parse(user) : null,
      token: token || null
    };
  };

  // Fetch panna sizes when cloth type changes
  useEffect(() => {
    if (clothType) {
      fetchPannaSizes();
    }
  }, [clothType]);

  // Fetch cloth items when panna size changes
  useEffect(() => {
    if (pannaSize && clothType) {
      fetchClothItems();
    }
  }, [pannaSize, clothType]);

  const fetchPannaSizes = async () => {
    try {
      setLoading(true);
      const userData = getUserData();
      
      const response = await axios.post(CUSTOM_CLOTH_PANA_SIZE, {
        user: userData.user,
        token: userData.token,
        clothType: clothType
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        setPannaSizeList(response.data.payload || []);
      }
    } catch (error) {
      console.error('Error fetching panna sizes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClothItems = async () => {
    try {
      setLoading(true);
      const userData = getUserData();
      
      const response = await axios.post(FIND_CLOTH, {
        user: userData.user,
        token: userData.token,
        pannaType: pannaSize,
        clothType: clothType
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        setClothList(response.data.payload || []);
      }
    } catch (error) {
      console.error('Error fetching cloth items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (selectedCloth && size) {
      const parsedSize = parseFloat(size) || 0;
      const amount = Math.round(parsedSize * selectedCloth.price);
      
      onAddItem(
        selectedCloth.itemBarcodeID,
        selectedCloth.description,
        selectedCloth.itemCategory,
        size,
        selectedCloth.price
      );
    }
  };

  const calculateAmount = () => {
    if (selectedCloth && size) {
      const parsedSize = parseFloat(size) || 0;
      return Math.round(parsedSize * selectedCloth.price);
    }
    return 0;
  };

  return (
    <div className="custom-item-cloth-popup">
      <div className="custom-item-cloth-popup__overlay" onClick={onClose}>
        <div className="custom-item-cloth-popup__content" onClick={(e) => e.stopPropagation()}>
          <div className="custom-item-cloth-popup__header">
            <h3>Cloth Type</h3>
            <button className="custom-item-cloth-popup__close" onClick={onClose}>×</button>
          </div>

          <div className="custom-item-cloth-popup__cloth-types">
            <button
              className={`custom-item-cloth-popup__cloth-btn ${clothType === 'SHIRTING' ? 'active' : ''}`}
              onClick={() => setClothType('SHIRTING')}
            >
              SHIRTING
            </button>
            <button
              className={`custom-item-cloth-popup__cloth-btn ${clothType === 'SUITING' ? 'active' : ''}`}
              onClick={() => setClothType('SUITING')}
            >
              SUITING
            </button>
          </div>

          <div className="custom-item-cloth-popup__field">
            <label>Panna Size</label>
            <select
              className="custom-item-cloth-popup__select"
              value={pannaSize}
              onChange={(e) => setPannaSize(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Panna Size</option>
              {pannaSizeList.map((size, index) => (
                <option key={index} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="custom-item-cloth-popup__field">
            <label>Select Cloth</label>
            <select
              className="custom-item-cloth-popup__select"
              value={selectedCloth?.sno || ''}
              onChange={(e) => {
                const cloth = clothList.find(c => c.sno === parseInt(e.target.value));
                setSelectedCloth(cloth);
              }}
              disabled={loading || !pannaSize}
            >
              <option value="">Select Cloth</option>
              {clothList.map((cloth) => (
                <option key={cloth.sno} value={cloth.sno}>
                  {cloth.itemCategory}- {cloth.description}
                </option>
              ))}
            </select>
          </div>

          <div className="custom-item-cloth-popup__row">
            <div className="custom-item-cloth-popup__field">
              <label>Price</label>
              <input
                type="text"
                className="custom-item-cloth-popup__input"
                value={selectedCloth ? selectedCloth.price : ''}
                readOnly
                placeholder="Auto filled from cloth"
              />
            </div>
            <div className="custom-item-cloth-popup__field">
              <label>Size</label>
              <input
                type="number"
                className="custom-item-cloth-popup__input"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Enter size"
                step="0.01"
              />
            </div>
          </div>

          <div className="custom-item-cloth-popup__field">
            <label>Amount</label>
            <input
              type="text"
              className="custom-item-cloth-popup__input"
              value={calculateAmount()}
              readOnly
              placeholder="Price * quantity"
            />
          </div>

          <button
            className="custom-item-cloth-popup__add-btn"
            onClick={handleAdd}
            disabled={!selectedCloth || !size}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomClothModal;