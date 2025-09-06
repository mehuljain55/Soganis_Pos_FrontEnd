import React, { useState } from 'react';
import FilterEditStock from './FilterEditStock';
import AddItemStock from './AddItemStock';
import InventoryUpdate from './InventoryUpdate';

import './InventoryAdd.css'; // Import your CSS file for styling

const InventoryAdd = () => {
  const [view, setView] = useState('register'); 

  return (
    <div className="salary-container">
      <div className="menu-bar">
        <button className={view === 'Add New Item' ? 'active' : ''} onClick={() => setView('Add New Item')}>Add New Stock</button>
        <button className={view === 'Edit Item' ? 'active' : ''} onClick={() => setView('Edit Item')}>Edit Stock</button>
        <button className={view === 'Upload Excel' ? 'active' : ''} onClick={() => setView('Upload Excel')}>Mass Update (Excel)</button>
      
      </div>
      
      {view === 'Add New Item' && <AddItemStock />}
      {view === 'Edit Item' && <FilterEditStock />}
      {view === 'Upload Excel' && <InventoryUpdate />}
    </div>
  


);
};

export default InventoryAdd;