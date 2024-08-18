import React from 'react';
import './SlideBar.css';

const Sidebar = ({ handleMenuItemClick }) => {
  return (
    <nav className="navbar">
      <button onClick={() => handleMenuItemClick('New Bill')}>
        New Bill
      </button>
      <button onClick={() => handleMenuItemClick('Salary Register')}>
        Salary Register
      </button>
      <button onClick={() => handleMenuItemClick('Cash Collection')}>
        Cash Collection
      </button>
      
      <button onClick={() => handleMenuItemClick('View Stock')}>
       View Stock
      </button>

      
      <button onClick={() => handleMenuItemClick('Today\'s Sale')}>
        Today's Sale
      </button>


    </nav>
  );
};

export default Sidebar;