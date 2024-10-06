// src/UserComponents/Logout/LogoutPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Reusable LogoutButton component
const LogoutButton = ({ onClick }) => {
  return (
    <button className="logout-button" onClick={onClick}>
      Logout
    </button>
  );
};

// Main LogoutPage component that handles the logic and uses LogoutButton
const LogoutPage = ({ setUserData }) => {
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('userData'); // Remove user data from local storage
    setUserData(null); // Reset the user data state in the App component
    navigate('/'); // Redirect to the login page
  };

  return (
    <div className="logout-container">
      {/* Use the reusable LogoutButton and pass handleLogout as the onClick prop */}
      <LogoutButton onClick={handleLogout} />
    </div>
  );
};

export default LogoutPage;
