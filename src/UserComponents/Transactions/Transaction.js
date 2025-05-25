import React, { useState } from 'react';
import DailyTransactionForm from './DailyTransactionForm';
import TransactionView from './TransactionView';
import './Transaction.css';

const Transaction = () => {
  const [activeView, setActiveView] = useState('add');

  return (
    <div className="transaction-container">
      <div className="trasaction-btn">
        <button
          className={activeView === 'add' ? 'active-button' : 'inactive-button'}
          onClick={() => setActiveView('add')}
        >
          Add Transaction
        </button>
        <button
          className={activeView === 'view' ? 'active-button' : 'inactive-button'}
          onClick={() => setActiveView('view')}
        >
          View Transactions
        </button>
      </div>

      <div className="view-container">
        {activeView === 'add' ? <DailyTransactionForm /> : <TransactionView />}
      </div>
    </div>
  );
};

export default Transaction;
