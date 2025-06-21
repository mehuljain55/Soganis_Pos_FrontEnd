import React, { useState, useEffect } from 'react';
import styles from './FilterSalesPage.module.css'; 
import axios from 'axios';
import { API_BASE_URL } from '../Config.js';
import SalesReport from './SalesReport'; 

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
  const [showFilterModal, setShowFilterModal] = useState(true);

  const handleApplyFilters = () => {
  setSalesData([]);
  fetchSalesData();
};

const clearFilter = (filterType) => {
  setFilters(prev => ({
    ...prev,
    [filterType]: false
  }));
  
  if (filterType === 'dateRange') {
    setSelectedFilters(prev => ({
      ...prev,
      dateRange: { startDate: '', endDate: '' }
    }));
  } else {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: ''
    }));
  }
  
  // Clear error message when filters are cleared
  setErrorMessage('');
};

const clearAllFilters = () => {
  setFilters({
    dateRange: false,
    item: false,
    school: false
  });
  
  setSelectedFilters({
    dateRange: { startDate: '', endDate: '' },
    item: '',
    school: ''
  });
  
  setSalesData([]);
  setErrorMessage('');
};

// Add this useEffect for keyboard event handling (after your existing useEffects)
useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && showFilterModal) {
      setShowFilterModal(false);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [showFilterModal]);

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

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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

              if (response.data.length > 0) {
      setShowFilterModal(false);
    }

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

              if (response.data.length > 0) {
              setShowFilterModal(false);
             }

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
    <>
      {/* Filter Modal */}
      {showFilterModal && (
        <div className={styles.salesReportModalOverlay} onClick={() => setShowFilterModal(false)}>
          <div className={styles.salesReportModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.salesReportModalHeader}>
              <h3>Filter Sales Report</h3>
              <button 
                className={styles.salesReportCloseBtn} 
                onClick={() => setShowFilterModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.salesReportModalBody}>
              <div className={styles.salesReportFilterSection}>
                <h4>Select Filters</h4>
                <div className={styles.salesReportCheckboxGrid}>
                  {[
                    { key: 'dateRange', label: 'Date Range' },
                    { key: 'school', label: 'School' },
                    { key: 'item', label: 'Item' }
                  ].map((filter) => (
                    <label key={filter.key} className={styles.salesReportCheckboxLabel}>
                      <input
                        type="checkbox"
                        name={filter.key}
                        checked={filters[filter.key]}
                        onChange={handleCheckboxChange}
                      />
                      <span className={styles.salesReportCheckmark}></span>
                      {filter.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.salesReportFilterInputs}>
                {filters.dateRange && (
                  <div className={styles.salesReportInputRow}>
                    <div className={styles.salesReportInputField}>
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={selectedFilters.dateRange.startDate}
                        onChange={handleDateChange}
                      />
                    </div>
                    <div className={styles.salesReportInputField}>
                      <label>End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        value={selectedFilters.dateRange.endDate}
                        onChange={handleDateChange}
                      />
                    </div>
                  </div>
                )}
                
                {filters.school && (
                  <div className={styles.salesReportInputRow}>
                    <div className={`${styles.salesReportInputField} ${styles.salesReportFullWidth}`}>
                      <label>School Code</label>
                      <select
                        name="school"
                        value={selectedFilters.school}
                        onChange={handleDropdownChange}
                      >
                        <option value="">Select School</option>
                        {schools.map((school, index) => (
                          <option key={index} value={school}>{school}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                {filters.item && (
                  <div className={styles.salesReportInputRow}>
                    <div className={`${styles.salesReportInputField} ${styles.salesReportFullWidth}`}>
                      <label>Item Code</label>
                      <select
                        name="item"
                        value={selectedFilters.item}
                        onChange={handleDropdownChange}
                      >
                        <option value="">Select Item</option>
                        {(selectedFilters.school ? filteredItems : items).map((item, index) => (
                          <option key={index} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className={styles.salesReportErrorMessage}>
                  <i className={styles.salesReportErrorIcon}>⚠</i>
                  {errorMessage}
                </div>
              )}
            </div>

            <div className={styles.salesReportModalFooter}>
              <button 
                className={styles.salesReportBtnCancel} 
                onClick={() => setShowFilterModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.salesReportBtnApply} 
                onClick={handleApplyFilters}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.salesReportSpinner}></span>
                    Generating...
                  </>
                ) : (
                  'Apply Filters'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.salesReportViewContainer}>
        <div className={styles.salesReportPageHeader}>
          <div className={styles.salesReportHeaderContent}>
            <h1>Sales Report</h1>
          </div>
          <div className={styles.salesReportHeaderActions}>
            <button 
              className={styles.salesReportBtnFilter} 
              onClick={() => setShowFilterModal(true)}
            >
              <i className={styles.salesReportFilterIcon}>🔍</i>
              Filters
            </button>
            {salesData.length > 0 && (
              <button className={styles.salesReportBtnRefresh} onClick={() => fetchSalesData()}>
                <i className={styles.salesReportRefreshIcon}>🔄</i>
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.dateRange || filters.school || filters.item) && (
          <div className={styles.salesReportActiveFilters}>
            <div className={styles.salesReportFilterTags}>
              <span className={styles.salesReportFilterTitle}>Active Filters:</span>
              {filters.dateRange && selectedFilters.dateRange.startDate && (
                <span className={styles.salesReportFilterTag}>
                  Date: {formatDateForDisplay(selectedFilters.dateRange.startDate)} to {formatDateForDisplay(selectedFilters.dateRange.endDate)}
                </span>
              )}
              {filters.school && selectedFilters.school && (
                <span className={styles.salesReportFilterTag}>
                  School: {selectedFilters.school}
                </span>
              )}
              {filters.item && selectedFilters.item && (
                <span className={styles.salesReportFilterTag}>
                  Item: {selectedFilters.item}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sales Report Container */}
        <div className={styles.salesReportReportContainer}>
          <SalesReport data={salesData} />
        </div>
      </div>
    </>
  );


};

export default FilterSalesPage;
