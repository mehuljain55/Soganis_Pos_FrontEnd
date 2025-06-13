import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './Cloth.css';
import {API_BASE_URL} from '../Api/ApiConstants.js';

const Cloth = () => {
  const [itemCloth, setItemCloth] = useState({
    description: '',
    pannaType: '',
    type: 'SHIRTING',
    price: '',
    itemCategory: '',
    storeId: ''
  });

  const [schoolList, setSchoolList] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Excel upload states
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'excel'
  const [excelData, setExcelData] = useState([]);
  const [reviewData, setReviewData] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [mappingErrors, setMappingErrors] = useState([]);

  // Get user data from session storage
  const getUserData = () => {
    const user = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    return {
      user: user ? JSON.parse(user) : null,
      token: token || null
    };
  };

  // Function to find best match from school list
  const findBestMatch = (inputValue, schoolList) => {
    if (!inputValue || !schoolList.length) return null;
    
    const normalizedInput = inputValue.toLowerCase().trim();
    const matches = [];

    schoolList.forEach((school) => {
      const schoolName = (school.name || school.schoolName || school || '').toLowerCase();
      
      // Exact match
      if (schoolName === normalizedInput) {
        matches.push({ school, score: 100, type: 'exact' });
        return;
      }
      
      // Starts with match
      if (schoolName.startsWith(normalizedInput)) {
        matches.push({ school, score: 90, type: 'starts' });
        return;
      }
      
      // Contains match
      if (schoolName.includes(normalizedInput)) {
        matches.push({ school, score: 70, type: 'contains' });
        return;
      }
      
      // Word match - split both input and school name into words
      const inputWords = normalizedInput.split(/\s+/);
      const schoolWords = schoolName.split(/\s+/);
      
      let wordMatches = 0;
      inputWords.forEach(inputWord => {
        if (inputWord.length > 2) { // Only consider words longer than 2 characters
          schoolWords.forEach(schoolWord => {
            if (schoolWord.includes(inputWord) || inputWord.includes(schoolWord)) {
              wordMatches++;
            }
          });
        }
      });
      
      if (wordMatches > 0) {
        const score = Math.min(60, (wordMatches / inputWords.length) * 60);
        matches.push({ school, score, type: 'partial' });
      }
    });

    // Return best match or null
    const bestMatch = matches.sort((a, b) => b.score - a.score)[0];
    return bestMatch ? bestMatch.school : null;
  };

  const findBestMatches = (inputValue, schoolList) => {
    if (!inputValue || !schoolList.length) return [];
    
    const normalizedInput = inputValue.toLowerCase().trim();
    const matches = [];

    schoolList.forEach((school) => {
      const schoolName = (school.name || school.schoolName || school || '').toLowerCase();
      
      // Exact match
      if (schoolName === normalizedInput) {
        matches.push({ school, score: 100, type: 'exact' });
        return;
      }
      
      // Starts with match
      if (schoolName.startsWith(normalizedInput)) {
        matches.push({ school, score: 90, type: 'starts' });
        return;
      }
      
      // Contains match
      if (schoolName.includes(normalizedInput)) {
        matches.push({ school, score: 70, type: 'contains' });
        return;
      }
      
      // Word match - split both input and school name into words
      const inputWords = normalizedInput.split(/\s+/);
      const schoolWords = schoolName.split(/\s+/);
      
      let wordMatches = 0;
      inputWords.forEach(inputWord => {
        if (inputWord.length > 2) { // Only consider words longer than 2 characters
          schoolWords.forEach(schoolWord => {
            if (schoolWord.includes(inputWord) || inputWord.includes(schoolWord)) {
              wordMatches++;
            }
          });
        }
      });
      
      if (wordMatches > 0) {
        const score = Math.min(60, (wordMatches / inputWords.length) * 60);
        matches.push({ school, score, type: 'partial' });
      }
    });

    // Sort by score (highest first) and return top 5
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(match => match.school);
  };

  // Fetch school list on component mount
  useEffect(() => {
    const fetchSchoolList = async () => {
      const userData = getUserData();
      
      if (!userData.user || !userData.user.storeId) {
        setMessage('Store ID not found. Please login again.');
        setMessageType('error');
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/user/filter/getSchoolNameandCode`,
          {
            params: { storeId: userData.user.storeId },
            headers: {
              'Authorization': `Bearer ${userData.token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setSchoolList(response.data);
        setFilteredSchools(response.data);
        setItemCloth(prev => ({
          ...prev,
          storeId: userData.user.storeId
        }));
      } catch (error) {
        console.error('Error fetching school list:', error);
        setMessage('Failed to fetch school list');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolList();
  }, []);

  // Handle Excel file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Process and map the data
        const processedData = data.map((row, index) => {
          const userData = getUserData();
          
          // Map Excel columns to our structure
          const mappedRow = {
            id: index + 1,
            pannaType: row['Pana (36/58)'] || row['pannaType'] || '',
            type: mapClothType(row['Type (Shirting / Suiting/ Salwar (Spun))'] || row['type'] || ''),
            price: parseInt(row['Price'] || row['price'] || 0),
            itemCategory: row['Item Category'] || row['itemCategory'] || '',
            description: row['Description'] || row['description'] || '',
            storeId: userData.user?.storeId || '',
            originalItemCategory: row['Item Category'] || row['itemCategory'] || '',
            mappedSchool: null,
            mappingStatus: 'pending', // 'pending', 'mapped', 'error'
            mappingError: null
          };

          // Try to map school
          if (mappedRow.itemCategory) {
            const matchedSchool = findBestMatch(mappedRow.itemCategory, schoolList);
            if (matchedSchool) {
              mappedRow.mappedSchool = matchedSchool;
              mappedRow.itemCategory = matchedSchool.name || matchedSchool.schoolName || matchedSchool;
              mappedRow.mappingStatus = 'mapped';
            } else {
              mappedRow.mappingStatus = 'error';
              mappedRow.mappingError = 'No matching school found';
            }
          } else {
            mappedRow.mappingStatus = 'error';
            mappedRow.mappingError = 'Item category is required';
          }

          return mappedRow;
        });

        setExcelData(data);
        setReviewData(processedData);
        setFileUploaded(true);
        setMessage(`Successfully loaded ${processedData.length} rows from Excel`);
        setMessageType('success');

        // Check for mapping errors
        const errors = processedData.filter(row => row.mappingStatus === 'error');
        setMappingErrors(errors);

      } catch (error) {
        console.error('Error reading Excel file:', error);
        setMessage('Error reading Excel file. Please check the format.');
        setMessageType('error');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Map cloth type from Excel
  const mapClothType = (excelType) => {
    if (!excelType) return 'SHIRTING';
    
    const type = excelType.toLowerCase();
    if (type.includes('suiting')) return 'SUITING';
    if (type.includes('shirting')) return 'SHIRTING';
    if (type.includes('salwar')) return 'SALWAR';
    
    return 'SHIRTING'; // default
  };

  // Handle school mapping change in review
  const handleSchoolMappingChange = (rowId, newSchool) => {
    setReviewData(prev => prev.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          itemCategory: newSchool.name || newSchool.schoolName || newSchool,
          mappedSchool: newSchool,
          mappingStatus: 'mapped',
          mappingError: null
        };
      }
      return row;
    }));
  };

  // Handle review data edit
  const handleReviewEdit = (rowId, field, value) => {
    setReviewData(prev => prev.map(row => {
      if (row.id === rowId) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  // Show review screen
  const showReviewScreen = () => {
    if (reviewData.length === 0) {
      setMessage('No data to review. Please upload an Excel file first.');
      setMessageType('error');
      return;
    }
    setShowReview(true);
  };

  // Handle input changes for single entry
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemCloth(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle school search with suggestions
    if (name === 'itemCategory') {
      if (value.trim()) {
        const matches = findBestMatches(value, schoolList);
        setFilteredSchools(matches);
        setShowSuggestions(true);
      } else {
        setFilteredSchools(schoolList);
        setShowSuggestions(false);
      }
    }
  };

  // Handle school selection from suggestions
  const handleSchoolSelect = (school) => {
    const schoolName = school.name || school.schoolName || school;
    setItemCloth(prev => ({
      ...prev,
      itemCategory: schoolName
    }));
    setShowSuggestions(false);
  };

  // Handle input focus and blur for suggestions
  const handleFocus = () => {
    if (itemCloth.itemCategory && filteredSchools.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for click
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Handle single item submission
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!itemCloth.description || !itemCloth.pannaType || !itemCloth.price || !itemCloth.itemCategory) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }

    const userData = getUserData();
    if (!userData.token) {
      setMessage('Authentication token not found. Please login again.');
      setMessageType('error');
      return;
    }

    setSubmitLoading(true);
    try {
      const itemData = {
        ...itemCloth,
        price: parseInt(itemCloth.price)
      };

      const response = await axios.post(
        `${API_BASE_URL}/inventory/stock/cloth/add`,
        [itemData], // API expects a list
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage('Cloth item added successfully!');
      setMessageType('success');
      
      // Reset form
      setItemCloth({
        description: '',
        pannaType: '',
        type: 'SHIRTING',
        price: '',
        itemCategory: '',
        storeId: userData.user.storeId
      });

    } catch (error) {
      console.error('Error adding cloth item:', error);
      setMessage(error.response?.data?.message || 'Failed to add cloth item');
      setMessageType('error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle bulk submission
  const handleBulkSubmit = async () => {
    const userData = getUserData();
    if (!userData.token) {
      setMessage('Authentication token not found. Please login again.');
      setMessageType('error');
      return;
    }

    // Validate all rows
    const validRows = reviewData.filter(row => 
      row.mappingStatus === 'mapped' && 
      row.description && 
      row.pannaType && 
      row.price && 
      row.itemCategory
    );

    if (validRows.length === 0) {
      setMessage('No valid rows to submit. Please fix the errors first.');
      setMessageType('error');
      return;
    }

    setSubmitLoading(true);
    try {
      // Prepare data for API
      const itemsData = validRows.map(row => ({
        description: row.description,
        pannaType: row.pannaType,
        type: row.type,
        price: parseInt(row.price),
        itemCategory: row.itemCategory,
        storeId: row.storeId
      }));

      const response = await axios.post(
        `${API_BASE_URL}/inventory/stock/cloth/add`,
        itemsData,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage(`Successfully added ${validRows.length} cloth items!`);
      setMessageType('success');
      
      // Reset states
      setExcelData([]);
      setReviewData([]);
      setShowReview(false);
      setFileUploaded(false);
      setMappingErrors([]);

    } catch (error) {
      console.error('Error adding cloth items:', error);
      setMessage(error.response?.data?.message || 'Failed to add cloth items');
      setMessageType('error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Download Excel template
  const downloadTemplate = () => {
    const templateData = [
      {
        'Pana (36/58)': '36/58',
        'Type (Shirting / Suiting/ Salwar (Spun))': 'SHIRTING',
        'Price': '220',
        'Item Category': 'CHOITHRAM SCHOOL',
        'Description': 'BOTH'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'cloth_template.xlsx');
  };

  // Render single entry form
  const renderSingleForm = () => (
    <form onSubmit={handleSingleSubmit} className="add-item-cloth-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <input
            type="text"
            id="description"
            name="description"
            value={itemCloth.description}
            onChange={handleInputChange}
            placeholder="Enter cloth description"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pannaType">Panna Type *</label>
          <input
            type="text"
            id="pannaType"
            name="pannaType"
            value={itemCloth.pannaType}
            onChange={handleInputChange}
            placeholder="e.g., 36/58"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="type">Cloth Type *</label>
          <select
            id="type"
            name="type"
            value={itemCloth.type}
            onChange={handleInputChange}
            required
          >
            <option value="SHIRTING">Shirting</option>
            <option value="SUITING">Suiting</option>
            <option value="SALWAR">Salwar (Spun)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={itemCloth.price}
            onChange={handleInputChange}
            placeholder="Enter price"
            min="0"
            required
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label htmlFor="itemCategory">School/Item Category *</label>
        <div className="autocomplete-container">
          {loading ? (
            <div className="loading-select">Loading schools...</div>
          ) : (
            <>
              <input
                type="text"
                id="itemCategory"
                name="itemCategory"
                value={itemCloth.itemCategory}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Type to search for school..."
                required
                className="school-search-input"
              />
              
              {showSuggestions && filteredSchools.length > 0 && (
                <div className="suggestions-dropdown">
                  {filteredSchools.map((school, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSchoolSelect(school)}
                    >
                      {school.name || school.schoolName || school}
                    </div>
                  ))}
                </div>
              )}
              
              {showSuggestions && filteredSchools.length === 0 && itemCloth.itemCategory && (
                <div className="suggestions-dropdown">
                  <div className="no-suggestions">
                    No matching schools found
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        className="submit-btn"
        disabled={submitLoading || loading}
      >
        {submitLoading ? 'Adding...' : 'Add Cloth Item'}
      </button>
    </form>
  );

  // Render Excel upload section
  const renderExcelUpload = () => (
    <div className="excel-upload-section">
      <div className="upload-header">
        <h3>Upload Excel File</h3>
        <button 
          type="button" 
          className="template-btn"
          onClick={downloadTemplate}
        >
          Download Template
        </button>
      </div>
      
      <div className="file-upload-container">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="file-input"
          id="excel-file"
        />
        <label htmlFor="excel-file" className="file-label">
          Choose Excel File
        </label>
      </div>

      {fileUploaded && (
        <div className="upload-summary">
          <p>✅ File uploaded successfully!</p>
          <p>Total rows: {reviewData.length}</p>
          <p>Mapped successfully: {reviewData.filter(r => r.mappingStatus === 'mapped').length}</p>
          <p>Mapping errors: {mappingErrors.length}</p>
          
          <div className="upload-actions">
            <button 
              type="button" 
              className="review-btn"
              onClick={showReviewScreen}
            >
              Review Data
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Render review screen
  const renderReviewScreen = () => (
    <div className="review-screen">
      <div className="review-header">
        <h3>Review Data Before Submission</h3>
        <div className="review-stats">
          <span className="stat">Total: {reviewData.length}</span>
          <span className="stat success">Valid: {reviewData.filter(r => r.mappingStatus === 'mapped').length}</span>
          <span className="stat error">Errors: {reviewData.filter(r => r.mappingStatus === 'error').length}</span>
        </div>
      </div>

      <div className="review-table-container">
        <table className="review-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Panna Type</th>
              <th>Type</th>
              <th>Price</th>
              <th>Original Category</th>
              <th>Mapped School</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviewData.map((row, index) => (
              <tr key={row.id} className={`review-row ${row.mappingStatus}`}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    value={row.pannaType}
                    onChange={(e) => handleReviewEdit(row.id, 'pannaType', e.target.value)}
                    className="review-input"
                  />
                </td>
                <td>
                  <select
                    value={row.type}
                    onChange={(e) => handleReviewEdit(row.id, 'type', e.target.value)}
                    className="review-select"
                  >
                    <option value="SHIRTING">Shirting</option>
                    <option value="SUITING">Suiting</option>
                    <option value="SALWAR">Salwar</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={row.price}
                    onChange={(e) => handleReviewEdit(row.id, 'price', e.target.value)}
                    className="review-input"
                  />
                </td>
                <td className="original-category">{row.originalItemCategory}</td>
                <td>
                  {row.mappingStatus === 'mapped' ? (
                    <div className="mapped-school">
                      <span className="school-name">{row.itemCategory}</span>
                      <select
                        onChange={(e) => {
                          const selectedSchool = schoolList.find(s => 
                            (s.name || s.schoolName || s) === e.target.value
                          );
                          if (selectedSchool) {
                            handleSchoolMappingChange(row.id, selectedSchool);
                          }
                        }}
                        className="school-select"
                        defaultValue=""
                      >
                        <option value="">Change School</option>
                        {schoolList.map((school, idx) => (
                          <option key={idx} value={school.name || school.schoolName || school}>
                            {school.name || school.schoolName || school}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="mapping-error">
                      <span className="error-text">{row.mappingError}</span>
                      <select
                        onChange={(e) => {
                          const selectedSchool = schoolList.find(s => 
                            (s.name || s.schoolName || s) === e.target.value
                          );
                          if (selectedSchool) {
                            handleSchoolMappingChange(row.id, selectedSchool);
                          }
                        }}
                        className="school-select"
                        defaultValue=""
                      >
                        <option value="">Select School</option>
                        {schoolList.map((school, idx) => (
                          <option key={idx} value={school.name || school.schoolName || school}>
                            {school.name || school.schoolName || school}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => handleReviewEdit(row.id, 'description', e.target.value)}
                    className="review-input"
                  />
                </td>
                <td>
                  <span className={`status-badge ${row.mappingStatus}`}>
                    {row.mappingStatus === 'mapped' ? '✅' : '❌'}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="auto-map-btn"
                    onClick={() => {
                      const matches = findBestMatches(row.originalItemCategory, schoolList);
                      if (matches.length > 0) {
                        handleSchoolMappingChange(row.id, matches[0]);
                      }
                    }}
                  >
                    Auto Map
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="review-actions">
        <button 
          type="button" 
          className="back-btn"
          onClick={() => setShowReview(false)}
        >
          Back to Upload
        </button>
        <button 
          type="button" 
          className="submit-bulk-btn"
          onClick={handleBulkSubmit}
          disabled={submitLoading || reviewData.filter(r => r.mappingStatus === 'mapped').length === 0}
        >
          {submitLoading ? 'Submitting...' : `Submit ${reviewData.filter(r => r.mappingStatus === 'mapped').length} Items`}
        </button>
      </div>
    </div>
  );

  if (showReview) {
    return (
      <div className="add-item-cloth-container">
        <div className="add-item-cloth-card review-card">
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
          {renderReviewScreen()}
        </div>
      </div>
    );
  }

  return (
    <div className="add-item-cloth-container">
      <div className="add-item-cloth-card">
        <h2 className="add-item-cloth-title">Add Cloth Item</h2>
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="mode-selector">
          <button 
            type="button"
            className={`mode-btn ${uploadMode === 'single' ? 'active' : ''}`}
            onClick={() => setUploadMode('single')}
          >
            Single Entry
          </button>
          <button 
            type="button"
            className={`mode-btn ${uploadMode === 'excel' ? 'active' : ''}`}
            onClick={() => setUploadMode('excel')}
          >
            Excel Upload
          </button>
        </div>

        {uploadMode === 'single' ? renderSingleForm() : renderExcelUpload()}
      </div>
    </div>
  );
};

export default Cloth;