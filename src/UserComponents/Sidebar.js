import React from 'react';

const Sidebar = ({ handleMenuItemClick }) => {
  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '250px', // Adjust width as needed
    backgroundColor: '#f8f9fa', // Light background color
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const sidebarHeaderStyle = {
    paddingBottom: '20px',
    borderBottom: '1px solid #ddd'
  };

  const menuItemStyle = {
    width: '100%',
    textAlign: 'left',
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    color: '#333'
  };

  const menuItemHoverStyle = {
    backgroundColor: '#e9ecef'
  };

  return (
    <nav style={sidebarStyle}>
      <div style={sidebarHeaderStyle}>
        <h3>Menu</h3>
      </div>
      <ul className="list-unstyled">
        <li>
          <button style={menuItemStyle} onClick={() => handleMenuItemClick('New Bill')}>New Bill</button>
        </li>
        <li>
          <button style={menuItemStyle} onClick={() => handleMenuItemClick('Salary Register')}>Salary Register</button>
        </li>
        <li>
          <button style={menuItemStyle} onClick={() => handleMenuItemClick('Cash Collection')}>Cash Collection</button>
        </li>
        <li>
          <button style={menuItemStyle} onClick={() => handleMenuItemClick('Today\'s Sale')}>Today's Sale</button>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
