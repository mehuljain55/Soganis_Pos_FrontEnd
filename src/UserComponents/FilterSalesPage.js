import React, { useState } from 'react';
import './FilterSalesPage.css'; // Import custom CSS for styling

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

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };

  const handleDropdownChange = (event) => {
    const { name, value } = event.target;
    setSelectedFilters((prevSelected) => ({
      ...prevSelected,
      [name]: value,
    }));
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

  const identifyFilter = () => {
    const { dateRange, item, school } = filters;

    if (dateRange && item && school) return 'Filter 7 - Item, School, Date Range';
    if (dateRange && item) return 'Filter 4 - Date Range, Item';
    if (dateRange && school) return 'Filter 5 - Date Range, School';
    if (item && school) return 'Filter 6 - Item, School';
    if (dateRange) return 'Filter 1 - Date Range';
    if (item) return 'Filter 2 - Item';
    if (school) return 'Filter 3 - School';
    return 'No Filter Selected';
  };

  return (
    <div className="filter-container">
      <h1>Select Filters</h1>
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

      {/* Conditionally render school dropdown before item dropdown */}
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
            <option value="school1">School 1</option>
            <option value="school2">School 2</option>
            <option value="school3">School 3</option>
          </select>
        </div>
      )}

      {filters.item && (
        <div className="dropdown-group">
          <label htmlFor="itemDropdown">Select Item Code:</label>
          <select
            id="itemDropdown"
            name="item"
            value={selectedFilters.item}
            onChange={handleDropdownChange}
          >
            <option value="">--Select--</option>
            <option value="item1">Item 1</option>
            <option value="item2">Item 2</option>
            <option value="item3">Item 3</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default FilterSalesPage;
