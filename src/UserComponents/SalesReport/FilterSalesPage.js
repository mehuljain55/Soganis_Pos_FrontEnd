import React, { useState, useEffect } from 'react';
import './FilterSalesPage.css'; 
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import SalesReport from './SalesReport'; 

import { Button, Form, Spinner, Container, Row, Col, Card } from "react-bootstrap";

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
  const [loading, setLoading] = useState(false);

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
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const storeId = userData?.storeId; // Retrieve storeId from user data
      if (storeId) {
        // Make API call with storeId as a query parameter
        axios.get(`${API_BASE_URL}/user/filter/getSchool`, {
          params: { storeId: storeId }
        })
        .then(response => {
          setSchools(response.data);
        })
        .catch(error => {
          console.error('Error fetching schools:', error);
        });
      } else {
        console.error('Store ID not found in user data');
      }
    }
  }, [filters.school]);

  // Fetch items when the item filter is selected and populate based on school code
  useEffect(() => {
    if (filters.item) {

      const userData = JSON.parse(sessionStorage.getItem('user'));
      const storeId = userData?.storeId; // Retrieve storeId from user data

      if (!storeId) {
        console.error('Store ID not found in user data');
        return;
      }
  
      if (selectedFilters.school) {
        axios.get(`${API_BASE_URL}/user/filter/school/item_type`, {
          params: { 
            schoolCode: selectedFilters.school, 
            storeId: storeId 
          }
        })
        .then(response => {
          setFilteredItems(response.data);
        })
        .catch(error => {
          console.error('Error fetching filtered items:', error);
        });
  
      // If no school is selected, show an error message
      } else if (filters.item && filters.school && !selectedFilters.school) {
        setErrorMessage('Please select a school first.');
      } else {
        axios.get(`${API_BASE_URL}/user/filter/item_type`, {
          params: { storeId: storeId } 
        })
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
    setLoading(true);
    let url = `${API_BASE_URL}/report/findReportAll`; // Default URL for all reports
    const params = {};
    const user = JSON.parse(sessionStorage.getItem("user"));
    const storeId = user ? user.storeId : '';

    if (storeId) {
      params.storeId = storeId;
    }
  
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
      url = `${API_BASE_URL}/sales/report/school_item_type_date`;
      console.log("Filter 1");
    } else if (filters.dateRange && filters.school) {
      url = `${API_BASE_URL}/sales/report/school_code_and_date`;
      console.log("Filter 2");
    } else if (filters.dateRange && filters.item) {
      url = `${API_BASE_URL}/sales/report/item_code_and_date`;
      console.log("Filter 3");
    } else if (filters.school && filters.item) {
      url = `${API_BASE_URL}/sales/report/school_and_item_type`;
      console.log("Filter 4");
    } else if (filters.dateRange) {
      url = `${API_BASE_URL}/sales/report/sales_date`;
      console.log("Filter 5");
    } else if (filters.school) {
      url = `${API_BASE_URL}/sales/report/school_code`;
      console.log("Filter 6");
    } else if (filters.item) {
      url = `${API_BASE_URL}/sales/report/item_code`;
      console.log("Filter 7");
    }
  
    // Make the API call
    if (Object.keys(params).length > 0) {
      axios.get(url, { params })
        .then(response => {
          setSalesData(response.data);
          setLoading(false); 
        })
        .catch(error => {
          console.error('Error fetching sales data:', error);
          setLoading(false); 
        }).finally(() => {
          setLoading(false); // Re-enable button after response
        });
    } else {
      // If no filters are applied, fetch all sales data
      axios.get(url)
        .then(response => {
          setSalesData(response.data);
          setLoading(false); // Re-enable button after response
        })
        .catch(error => {
          console.error('Error fetching sales data:', error);
          setLoading(false); // Re-enable button after response
        }) .finally(() => {
          setLoading(false); // Re-enable button after response
        });
    }
  };

  return (
    <Container className="filter-sales-page mt-4">
      <Card className="p-4 shadow-sm">
        <h1 className="text-center mb-4">View Sales</h1>
        
        <div className="checkbox-group d-flex justify-content-center gap-3 mb-3">
          {['dateRange', 'item', 'school'].map((filter) => (
            <Form.Check 
              key={filter}
              type="checkbox"
              label={filter.charAt(0).toUpperCase() + filter.slice(1).replace(/([A-Z])/g, ' $1')}
              name={filter}
              checked={filters[filter]}
              onChange={handleCheckboxChange}
            />
          ))}
        </div>

        <Row className="dropdown-group d-flex justify-content-center gap-2 mb-3">
          {filters.dateRange && (
            <>
              <Col xs="auto">
                <Form.Label>Start Date:</Form.Label>
                <Form.Control type="date" name="startDate" value={selectedFilters.dateRange.startDate} onChange={handleDateChange} />
              </Col>
              <Col xs="auto">
                <Form.Label>End Date:</Form.Label>
                <Form.Control type="date" name="endDate" value={selectedFilters.dateRange.endDate} onChange={handleDateChange} />
              </Col>
            </>
          )}
          
          {filters.school && (
            <Col xs="auto">
              <Form.Label>Select School Code:</Form.Label>
              <Form.Select name="school" value={selectedFilters.school} onChange={handleDropdownChange}>
                <option value="">--Select--</option>
                {schools.map((school, index) => (
                  <option key={index} value={school}>{school}</option>
                ))}
              </Form.Select>
            </Col>
          )}
          
          {filters.item && (
            <Col xs="auto">
              <Form.Label>Select Item Code:</Form.Label>
              <Form.Select name="item" value={selectedFilters.item} onChange={handleDropdownChange}>
                <option value="">--Select--</option>
                {(selectedFilters.school ? filteredItems : items).map((item, index) => (
                  <option key={index} value={item}>{item}</option>
                ))}
              </Form.Select>
            </Col>
          )}
        </Row>

        <div className="text-center">
  <button onClick={fetchSalesData} disabled={loading} className="search-button">
    {loading ? (
      <>
        <span className="custom-spinner"></span> Generating Report
      </>
    ) : (
      "View"
    )}
  </button>
</div>


        {errorMessage && <p className="text-danger text-center mt-3">{errorMessage}</p>}
      </Card>

      <div className="sales-report-container mt-4">
        <SalesReport data={salesData} />
      </div>
    </Container>
  );
};

export default FilterSalesPage;
