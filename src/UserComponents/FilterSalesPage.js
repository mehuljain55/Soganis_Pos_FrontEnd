import React, { useState, useEffect } from 'react';
import './FilterSalesPage.css'; // Import custom CSS for styling
import axios from 'axios';
import { API_BASE_URL } from './Config.js';

const FilterSalesPage = () => {
  const [filters, setFilters] = useState({
    dateRange: false,
    item: false,
    school: false,
  });

  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: { startDate: '', endDate: '' },
    item: '',
    school: '',
  });

  const [schools, setSchools] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
    
    // Reset the selections when filters are changed
    if (name === 'school' && !checked) {
      setSelectedFilters((prevSelected) => ({
        ...prevSelected,
        school: '',
      }));
    }
    if (name === 'item' && !checked) {
      setSelectedFilters((prevSelected) => ({
        ...prevSelected,
        item: '',
      }));
    }
  };

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    setSelectedFilters((prevSelected) => ({
      ...prevSelected,
      [name]: value,
    }));
    if (name === 'school') {
      setErrorMessage(''); // Clear error when a school is selected
    }
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    setSelectedFilters((prevSelected) => ({
      ...prevSelected,
      dateRange: {
        ...prevSelected.dateRange,
        [name]: value,
      },
    }));
  };

  // Fetch schools when the school filter is selected
  useEffect(() => {
    if (filters.school) {
      axios.get(`${API_BASE_URL}/filter/getSchool`)
        .then(response => {
          setSchools(response.data);
        })
        .catch(error => {
          console.error('Error fetching schools:', error);
        });
    }
  }, [filters.school]);

  // Fetch items when the item filter is selected and populate based on school code
  useEffect(() => {
    if (filters.item) {
      if (selectedFilters.school) {
        axios.get(`${API_BASE_URL}/filter/school/item_type`, { params: { schoolCode: selectedFilters.school } })
          .then(response => {
            setFilteredItems(response.data);
          })
          .catch(error => {
            console.error('Error fetching filtered items:', error);
          });
      } else if (filters.item && filters.school && !selectedFilters.school) {
        setErrorMessage('Please select a school first.');
      } else {
        axios.get(`${API_BASE_URL}/filter/item_type`)
          .then(response => {
            setItems(response.data);
          })
          .catch(error => {
            console.error('Error fetching items:', error);
          });
      }
    }
  }, [filters.item, selectedFilters.school]);

  return (
    <div className="filter-container">
      <h1>View Sales</h1>
      <div className="checkbox-group">
        <label>
          <input
            type="checkbox"
            name="dateRange"
            checked={filters.dateRange}
            onChange={handleCheckboxChange}
          />
          Date Range
        </label>
        <label>
          <input
            type="checkbox"
            name="item"
            checked={filters.item}
            onChange={handleCheckboxChange}
          />
          Item
        </label>
        <label>
          <input
            type="checkbox"
            name="school"
            checked={filters.school}
            onChange={handleCheckboxChange}
          />
          School
        </label>
      </div>

      {/* Dropdowns for each filter */}
      {filters.dateRange && (
        <div className="dropdown-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={selectedFilters.dateRange.startDate}
            onChange={handleDateChange}
          />

          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={selectedFilters.dateRange.endDate}
            onChange={handleDateChange}
          />
        </div>
      )}

      {/* Conditionally render school dropdown */}
      {filters.school && (
        <div className="dropdown-group">
          <label htmlFor="schoolDropdown">Select School Code:</label>
          <select
            id="schoolDropdown"
            name="school"
            value={selectedFilters.school}
            onChange={handleDropdownChange}
          >
            <option value="">--Select--</option>
            {schools.map((school, index) => (
              <option key={index} value={school}>
                {school}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Conditionally render item dropdown */}
      {filters.item && (
        <div className="dropdown-group">
          <label htmlFor="itemDropdown">Select Item Code:</label>
          <select
            id="itemDropdown"
            name="item"
            value={selectedFilters.item}
            onChange={handleDropdownChange}
            disabled={!selectedFilters.school && filters.school && filters.item}
          >
            <option value="">--Select--</option>
            {(selectedFilters.school ? filteredItems : items).map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display error message if applicable */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default FilterSalesPage;
