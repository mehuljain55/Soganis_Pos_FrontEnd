import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomClothModal.css';
import Select from 'react-select';
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


    useEffect(() => {
    if (clothType) {
      setSize('');
      setPannaSize('');
      setSelectedCloth(null);
    }
  }, [clothType]);

  
const reset = () => {
  setSize('');
  setPannaSize('');
  setClothType('SHIRTING');
  setSelectedCloth(null);
};



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
      const pannaList = response.data.payload || [];
      setPannaSizeList(pannaList);

      if (pannaList.length === 1) {
        setPannaSize(pannaList[0]); // Auto-select if only one option
      }
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
  const sortedClothList = (response.data.payload || []).sort((a, b) =>
    a.itemCategory.localeCompare(b.itemCategory)
  );
  setClothList(sortedClothList);
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
      reset();
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
          <label>Panna</label>
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
          <Select
            className="custom-item-cloth-popup__react-select"
            classNamePrefix="custom-react-select"
            value={clothList.find(c => c.sno === selectedCloth?.sno) || null}
            onChange={(selectedOption) => {
              setSelectedCloth(selectedOption);
            }}
            isDisabled={loading || !pannaSize}
            options={clothList}
           getOptionLabel={(cloth) =>
  cloth.description && cloth.description.trim() !== ''
    ? `${cloth.itemCategory} - ${cloth.description}`
    : cloth.itemCategory
}

            getOptionValue={(cloth) => cloth.sno.toString()}
            placeholder="Select Cloth"
            menuPlacement="auto"
            menuPosition="fixed"
            styles={{
              control: (provided, state) => ({
                ...provided,
                border: '2px solid #e5e5e5',
                borderRadius: '6px',
                minHeight: '48px',
                boxShadow: 'none',
                borderColor: state.isFocused ? '#007bff' : '#e5e5e5',
                '&:hover': {
                  borderColor: state.isFocused ? '#007bff' : '#e5e5e5'
                }
              }),
              menu: (provided) => ({
                ...provided,
                left: 0,
                right: 'auto',
                zIndex: 9999
              }),
              menuList: (provided) => ({
                ...provided,
                maxHeight: '200px'
              })
            }}
          />
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
            <label>Quantity</label>
            <input
              type="text"
              className="custom-item-cloth-popup__input"
              value={size}
              onChange={(e) => {
                let value = e.target.value;
                
                // Only allow digits and one decimal point
                value = value.replace(/[^\d.]/g, '');
                
                // If user types just digits without decimal, auto-format
                if (!value.includes('.') && value.length > 0) {
                  // Add decimal point after first digit
                  if (value.length === 1) {
                    value = value + '.';
                  } else if (value.length > 1) {
                    value = value.charAt(0) + '.' + value.slice(1);
                  }
                }
                
                // Prevent multiple decimal points
                const parts = value.split('.');
                if (parts.length > 2) {
                  value = parts[0] + '.' + parts.slice(1).join('');
                }
                
                setSize(value);
              }}
              placeholder="Enter size"
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