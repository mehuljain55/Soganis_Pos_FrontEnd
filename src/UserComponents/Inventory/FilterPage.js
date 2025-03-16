import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../Config.js";
import View from "./View.js";
import "./FilterPage.css"

const FilterPage = () => {
  const [selectedFilter, setSelectedFilter] = useState("filter1");
  const [schoolList, setSchoolList] = useState([]);
  const [itemTypeList, setItemTypeList] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");
  const [filteredItemTypeList, setFilteredItemTypeList] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const userData = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    const storeId = userData?.storeId; 
    if (storeId) {
      axios
        .get(`${API_BASE_URL}/user/filter/getSchool`, {
          params: { storeId: storeId }
        })
        .then((response) => setSchoolList(response.data))
        .catch((error) => console.error("Error fetching schools:", error));
    } else {
      console.error("Store ID not found in session storage");
    }
  }, []);

  useEffect(() => {
    if (selectedFilter === "filter1" && selectedSchool) {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const storeId = userData?.storeId;
  
      if (storeId) {
        axios
          .get(`${API_BASE_URL}/user/filter/school/item_type`, {
            params: { schoolCode: selectedSchool, storeId: storeId }
          })
          .then((response) => setFilteredItemTypeList(response.data))
          .catch((error) =>
            console.error("Error fetching item types for school:", error)
          );
      } else {
        console.error("Store ID not found in session storage");
      }
    }
  }, [selectedFilter, selectedSchool]);

  useEffect(() => {
    if (selectedFilter === "filter2") {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      const storeId = userData?.storeId;
  
      if (storeId) {
        axios
          .get(`${API_BASE_URL}/user/filter/item_type`, {
            params: { storeId: storeId }
          })
          .then((response) => setItemTypeList(response.data))
          .catch((error) => console.error("Error fetching item types:", error));
      } else {
        console.error("Store ID not found in session storage");
      }
    }
  }, [selectedFilter]);
  
  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const storeId = userData?.storeId;
    
    setLoading(true);
    
    if (selectedFilter === "filter1" && selectedSchool && selectedItemType) {
      axios
        .get(`${API_BASE_URL}/user/filter/item_category/item_type`, {
          params: {
            schoolCode: selectedSchool,
            itemType: selectedItemType,
            storeId: storeId,
          },
        })
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data for Filter 1:", error);
          setLoading(false);
        });
    } else if (selectedFilter === "filter2" && selectedItemType) {
      axios
        .get(`${API_BASE_URL}/user/filter/item_list_type`, {
          params: {
            itemType: selectedItemType,
            storeId: storeId,
          },
        })
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data for Filter 2:", error);
          setLoading(false);
        });
    } else if (selectedFilter === "filter3" && selectedSchool) {
      axios
      .get(`${API_BASE_URL}/user/filter/item_list_school_code`, {
        params: {
          schoolCode: selectedSchool,
          storeId: storeId, 
        },
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data for Filter 3:", error);
        setLoading(false);
      });
    } else if (selectedFilter === "filter4") {
      axios
      .get(`${API_BASE_URL}/user/filter/getAllItems`, {
        params: {
          storeId: storeId,
        },
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [selectedFilter, selectedSchool, selectedItemType]);

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
    if (event.target.value !== "filter1") {
      setSelectedSchool("");
    }
    setSelectedItemType("");
    setData([]);
  };

  const handleSchoolChange = (event) => {
    setSelectedSchool(event.target.value);
    setSelectedItemType("");
  };

  const handleItemTypeChange = (event) => {
    setSelectedItemType(event.target.value);
  };

  const refreshData = () => {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    const storeId = userData?.storeId; 
    
    setLoading(true);
  
    if (selectedFilter === "filter1" && selectedSchool && selectedItemType) {
      axios
        .get(`${API_BASE_URL}/user/filter/item_category/item_type`, {
          params: {
            schoolCode: selectedSchool,
            itemType: selectedItemType,
            storeId: storeId,
          },
        })
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setLoading(false);
        });
    } else if (selectedFilter === "filter2" && selectedItemType) {
      axios
        .get(`${API_BASE_URL}/user/filter/item_list_type`, {
          params: {
            itemType: selectedItemType,
            storeId: storeId,
          },
        })
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setLoading(false);
        });
    } else if (selectedFilter === "filter3" && selectedSchool) {
      axios
      .get(`${API_BASE_URL}/user/filter/item_list_school_code`, {
        params: {
          schoolCode: selectedSchool,
          storeId: storeId,
        },
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
    } else if (selectedFilter === "filter4") {
      axios
      .get(`${API_BASE_URL}/user/filter/getAllItems`, {
        params: {
          storeId: storeId,
        },
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
    }
  };

  return (
    <div className={loading ? "view-filter-stock-blur" : ""}>
      {loading && <div className="view-filter-stock-spinner"></div>}
      
      <div className="view-filter-stock-container">
        <h3 className="view-filter-stock-title">View Stock</h3>

        <div className="view-filter-stock-options">
          <div className="view-filter-stock-radio-group">
            <div className="view-filter-stock-radio">
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

            <div className="view-filter-stock-radio">
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

            <div className="view-filter-stock-radio">
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

            <div className="view-filter-stock-radio">
              <input
                type="radio"
                id="filter4"
                name="filter"
                value="filter4"
                checked={selectedFilter === "filter4"}
                onChange={handleFilterChange}
              />
              <label htmlFor="filter4">All Items</label>
            </div>
          </div>

          <div className="view-filter-stock-selects">
            {(selectedFilter === "filter1" || selectedFilter === "filter3") && (
              <div className="view-filter-stock-select-group">
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

            {(selectedFilter === "filter1" && selectedSchool) || selectedFilter === "filter2" ? (
              <div className="view-filter-stock-select-group">
                <label htmlFor="itemType">Item Type:</label>
                <select
                  id="itemType"
                  value={selectedItemType}
                  onChange={handleItemTypeChange}
                >
                  <option value="">Select an item type</option>
                  {(selectedFilter === "filter1" ? filteredItemTypeList : itemTypeList).map((itemType) => (
                    <option key={itemType} value={itemType}>
                      {itemType}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </div>

        {data.length > 0 && <View data={data} onUpdateSuccess={refreshData} />}
      </div>
    </div>
  );
};

export default FilterPage;