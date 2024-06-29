// src/App.js

import React, { useState } from 'react';
import Login from './UserComponents/Login';
import MainComponent from './UserComponents/MainComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Optionally, import CSS for styling


function App() {
  const [userData, setUserData] = useState(null);

  return (
    <div className="App">
      {!userData ? (
        <Login setUserData={setUserData} />
      ) : (
        <MainComponent userData={userData} />
      )}
    </div>
  );
}

export default App;
