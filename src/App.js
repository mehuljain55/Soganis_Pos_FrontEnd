// src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './UserComponents/Login';
import MainComponent from './UserComponents/MainComponent';
import FilterPage from './UserComponents/FilterPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Optionally, import CSS for styling

function App() {
  const [userData, setUserData] = useState(null);

  return (
    <Router>
      <div className="App">
        {!userData ? (
          <Login setUserData={setUserData} />
        ) : (
          <Routes>
            <Route path="/" element={<MainComponent userData={userData} />} />
            <Route path="/filter" element={<FilterPage />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
