import React, { useState, useEffect } from 'react';
import './FilterSalesPage.css'; // Import custom CSS for styling
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import SalesReport from './SalesReport'; // Import the SalesReport component

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
  const [salesData, setSalesData] = useState([]);
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

  const fetchSalesData = () => {
    let url = `${API_BASE_URL}/report/findReportAll`; // Default URL for all reports
    const params = {};
  
    // Check if Date Range filter is selected
    if (filters.dateRange) {
      params.startDate = selectedFilters.dateRange.startDate;
      params.endDate = selectedFilters.dateRange.endDate;
    }
  
    // Check if School filter is selected
    if (filters.school && selectedFilters.school) {
      params.schoolCode = selectedFilters.school;
    }
  
    // Check if Item filter is selected
    if (filters.item && selectedFilters.item) {
      params.itemCode = selectedFilters.item;
    }
  
    // Determine the URL based on the filters
    if (filters.dateRange && filters.school && filters.item) {
      url = `${API_BASE_URL}/report/school_item_type_date`;
    } else if (filters.dateRange && filters.school) {
      url = `${API_BASE_URL}/report/school_code_and_date`;
    } else if (filters.dateRange && filters.item) {
      url = `${API_BASE_URL}/report/item_code_and_date`;
    } else if (filters.school && filters.item) {
      url = `${API_BASE_URL}/report/school_and_item_type`;
    } else if (filters.dateRange) {
      url = `${API_BASE_URL}/report/sales_date`;
    } else if (filters.school) {
      url = `${API_BASE_URL}/report/school_code`;
    } else if (filters.item) {
      url = `${API_BASE_URL}/report/item_code`;
    }
  
    // Make the API call
    if (Object.keys(params).length > 0) {
      axios.get(url, { params })
        .then(response => {
          setSalesData(response.data);
        })
        .catch(error => {
          console.error('Error fetching sales data:', error);
        });
    } else {
      // If no filters are applied, fetch all sales data
      axios.get(url)
        .then(response => {
          setSalesData(response.data);
        })
        .catch(error => {
          console.error('Error fetching sales data:', error);
        });
    }
  };

  // Handle Export functionality
  const handleExport = () => {
    let url = `${API_BASE_URL}/report/export`; // Default URL for export
    const params = {};
  
    // Check if Date Range filter is selected
    if (filters.dateRange) {
      params.startDate = selectedFilters.dateRange.startDate;
      params.endDate = selectedFilters.dateRange.endDate;
    }
  
    // Check if School filter is selected
    if (filters.school && selectedFilters.school) {
      params.schoolCode = selectedFilters.school;
    }
  
    // Check if Item filter is selected
    if (filters.item && selectedFilters.item) {
      params.itemCode = selectedFilters.item;
    }
  
    axios.get(url, { params, responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sales_report.xlsx'); // Use the desired file name here
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(error => {
        console.error('Error exporting data:', error);
      });
  };

  return (
    <div className="filter-sales-page">
      <div className="filter-container">
        <h1>View Sales</h1>
        <div className="checkbox-group">
          <div className="checkbox-group-item">
            <label>
              <input
                type="checkbox"
                name="dateRange"
                checked={filters.dateRange}
                onChange={handleCheckboxChange}
              />
              Date Range
            </label>
          </div>
          <div className="checkbox-group-item">
            <label>
              <input
                type="checkbox"
                name="item"
                checked={filters.item}
                onChange={handleCheckboxChange}
              />
              Item
            </label>  
          </div>
          <div className="checkbox-group-item">
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
        </div>

        {/* Combine all dropdowns in a single row */}
        <div className="dropdown-group">
          {filters.dateRange && (
            <>
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
            </>
          )}

          {filters.school && (
            <>
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
            </>
          )}

          {filters.item && (
            <>
              <label htmlFor="itemDropdown">Select Item Code:</label>
              <select
                id="itemDropdown"
                name="item"
                value={selectedFilters.item}
                onChange={handleDropdownChange}
              >
                <option value="">--Select--</option>
                {selectedFilters.school
                  ? filteredItems.map((item, index) => (
                      <option key={index} value={item}>
                        {item}
                      </option>
                    ))
                  : items.map((item, index) => (
                      <option key={index} value={item}>
                        {item}
                      </option>
                    ))}
              </select>
            </>
          )}
        </div>

        <div className="button-group">
          <button onClick={fetchSalesData}>Submit</button>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>

      <div className="sales-report">
        <SalesReport data={salesData} />
      </div>
    </div>
  );
};

export default FilterSalesPage;
