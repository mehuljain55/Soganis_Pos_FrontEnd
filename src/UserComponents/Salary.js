import React, { useState } from 'react';
import SalaryRegister from './SalaryRegister';
import SalaryGenerator from './SalaryGenerator';
import './Salary.css'; // Import your CSS file for styling

const Salary = () => {
  const [view, setView] = useState('register'); 

  return (
    <div className="salary-container">
      <h1>Salary Management</h1>
      <div className="menu-bar">
        <button className={view === 'register' ? 'active' : ''} onClick={() => setView('register')}>Salary Register</button>
        <button className={view === 'generator' ? 'active' : ''} onClick={() => setView('generator')}>Salary Generator</button>
      </div>
      
      {view === 'register' && <SalaryRegister />}
      {view === 'generator' && <SalaryGenerator />}
    </div>
  


);
};

export default Salary;