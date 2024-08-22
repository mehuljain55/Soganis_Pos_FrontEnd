import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "./Config.js";
import View from "./View.js"; // Import the View component

const FilterPage = () => {
  const [selectedFilter, setSelectedFilter] = useState("filter1");
  const [schoolList, setSchoolList] = useState([]);
  const [itemTypeList, setItemTypeList] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedItemType, setSelectedItemType] = useState(""); // State for selected item type
  const [filteredItemTypeList, setFilteredItemTypeList] = useState([]);
  const [data, setData] = useState([]); // State for storing fetched data

  useEffect(() => {
    // Fetch the list of schools when the component mounts
    axios
      .get(`${API_BASE_URL}/filter/getSchool`)
      .then((response) => setSchoolList(response.data))
      .catch((error) => console.error("Error fetching schools:", error));
  }, []);

  useEffect(() => {
    if (selectedFilter === "filter1" && selectedSchool) {
      // Fetch item types based on the selected school
      axios
        .get(
          `${API_BASE_URL}/filter/school/item_type?schoolCode=${selectedSchool}`,
        )
        .then((response) => setFilteredItemTypeList(response.data))
        .catch((error) =>
          console.error("Error fetching item types for school:", error),
        );
    }
  }, [selectedFilter, selectedSchool]);

  useEffect(() => {
    if (selectedFilter === "filter2") {
      // Fetch all item types when filter 2 is selected
      axios
        .get(`${API_BASE_URL}/filter/item_type`)
        .then((response) => setItemTypeList(response.data))
        .catch((error) => console.error("Error fetching item types:", error));
    }
  }, [selectedFilter]);

  useEffect(() => {
    if (selectedFilter === "filter1" && selectedSchool && selectedItemType) {
      // Fetch data based on the selected school and item type for Filter 1
      axios
        .get(`${API_BASE_URL}/filter/item_category/item_type`, {
          params: {
            schoolCode: selectedSchool,
            itemType: selectedItemType,
          },
        })
        .then((response) => setData(response.data))
        .catch((error) =>
          console.error("Error fetching data for Filter 1:", error),
        );
    } else if (selectedFilter === "filter2" && selectedItemType) {
      // Fetch data based on the selected item type for Filter 2
      axios
        .get(`${API_BASE_URL}/filter/item_list_type`, {
          params: {
            itemType: selectedItemType,
          },
        })
        .then((response) => setData(response.data))
        .catch((error) =>
          console.error("Error fetching data for Filter 2:", error),
        );
    } else if (selectedFilter === "filter3" && selectedSchool) {
      // Fetch data based on the selected school for Filter 3
      axios
        .get(
          `${API_BASE_URL}/filter/item_list_school_code?schoolCode=${selectedSchool}`,
        )
        .then((response) => setData(response.data))
        .catch((error) =>
          console.error("Error fetching data for Filter 3:", error),
        );
    }
  }, [selectedFilter, selectedSchool, selectedItemType]);

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
    if (event.target.value !== "filter1") {
      setSelectedSchool(""); // Clear selected school if not using filter 1
    }
    setData([]); // Clear data when changing filter
  };

  const handleSchoolChange = (event) => {
    setSelectedSchool(event.target.value);
  };

  const handleItemTypeChange = (event) => {
    setSelectedItemType(event.target.value);
  };

  return (
    <div>
      <h1>Filter Page</h1>

      <div className="filter-page-radio">
        <div className="filter-page-radio-option">
          <input
            type="radio"
            id="filter1"
            name="filter"
            value="filter1"
            checked={selectedFilter === "filter1"}
            onChange={handleFilterChange}
          />
          <label htmlFor="filter1">School and Item</label>
        </div>

        <div className="filter-page-radio-option">
          <input
            type="radio"
            id="filter2"
            name="filter"
            value="filter2"
            checked={selectedFilter === "filter2"}
            onChange={handleFilterChange}
          />
          <label htmlFor="filter2">Item</label>
        </div>

        <div className="filter-page-radio-option">
          <input
            type="radio"
            id="filter3"
            name="filter"
            value="filter3"
            checked={selectedFilter === "filter3"}
            onChange={handleFilterChange}
          />
          <label htmlFor="filter3">School</label>
        </div>
      </div>



      <div className="filter-page-radio-output">
        {selectedFilter === "filter1" && (
          <div>
            <label htmlFor="school">School:</label>
            <select
              id="school"
              value={selectedSchool}
              onChange={handleSchoolChange}
            >
              <option value="">Select a school</option>
              {schoolList.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>

            <label htmlFor="itemType">Item Type:</label>
            <select
              id="itemType"
              value={selectedItemType}
              onChange={handleItemTypeChange}
            >
              <option value="">Select an item type</option>
              {filteredItemTypeList.map((itemType) => (
                <option key={itemType} value={itemType}>
                  {itemType}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedFilter === "filter2" && (
          <div>
            <label htmlFor="itemType">Item Type:</label>
            <select
              id="itemType"
              value={selectedItemType}
              onChange={handleItemTypeChange}
            >
              <option value="">Select an item type</option>
              {itemTypeList.map((itemType) => (
                <option key={itemType} value={itemType}>
                  {itemType}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedFilter === "filter3" && (
          <div>
            <label htmlFor="school">School:</label>
            <select
              id="school"
              value={selectedSchool}
              onChange={handleSchoolChange}
            >
              <option value="">Select a school</option>
              {schoolList.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Display the View component if data is available */}
        {data.length > 0 && <View data={data} />}
      </div>
    </div>


  );
};

export default FilterPage;
