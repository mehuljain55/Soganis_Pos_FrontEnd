import React, { useState } from 'react';
import FilterEditStock from './FilterEditStock';
import AddItemStock from './AddItemStock';
import './InventoryAdd.css'; // Import your CSS file for styling

const InventoryAdd = () => {
  const [view, setView] = useState('register'); 

  return (
    <div className="salary-container">
      <div className="menu-bar">
        <button className={view === 'Add New Item' ? 'active' : ''} onClick={() => setView('Add New Item')}>Add New Stock</button>
        <button className={view === 'Edit Item' ? 'active' : ''} onClick={() => setView('Edit Item')}>Edit Stock</button>
      </div>
      
      {view === 'Add New Item' && <AddItemStock />}
      {view === 'Edit Item' && <FilterEditStock />}
    </div>
  


);
};

export default InventoryAdd;