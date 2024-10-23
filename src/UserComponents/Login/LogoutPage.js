// src/UserComponents/Logout/LogoutPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Reusable LogoutButton component
export const LogoutButton = ({ onClick }) => {
  return (
    <button 
    className="logout-button" 
    onClick={onClick} 
    style={{ 
      color: 'white',          // Text color white
      backgroundColor: 'red',  // Background color red
      border: 'none',          // No border
      padding: '10px 20px',    // Padding for spacing
      cursor: 'pointer',       // Pointer cursor on hover
      fontWeight: 'bold'       // Bold text
    }}
  >
    Logout
  </button>
  );
};

// Exported logout function
export const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userData'); // Remove user data from local storage
    sessionStorage.removeItem('userData'); // Remove user data from session storage
    window.location.reload(); // Reload the page to reflect changes
  };

  return handleLogout;
};

