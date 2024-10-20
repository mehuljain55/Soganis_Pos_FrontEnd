import React, { useState } from 'react';
import './StoreComponent.css';
import AddStore from './AddStore';
import AddUser from './AddUser';
import ManageUser from './ManageUser';
import { API_BASE_URL } from "../Config.js";

const StoreComponent = ({ user }) => {
    const [activeComponent, setActiveComponent] = useState('AddStore');

    const renderComponent = () => {
        switch (activeComponent) {
            case 'AddStore':
                return <AddStore />;
            case 'AddUser':
                return <AddUser />;
            case 'ManageUser':
                return <ManageUser />;
            default:
                return <AddStore />;
        }
    };

    return (
        <div className="store-container">
            <div className="sidebar">
                <ul>
                    <li
                        className={activeComponent === 'AddStore' ? 'active' : ''}
                        onClick={() => setActiveComponent('AddStore')}
                    >
                        Add Store
                    </li>
                    <li
                        className={activeComponent === 'AddUser' ? 'active' : ''}
                        onClick={() => setActiveComponent('AddUser')}
                    >
                        Add User
                    </li>
                    <li
                        className={activeComponent === 'ManageUser' ? 'active' : ''}
                        onClick={() => setActiveComponent('ManageUser')}
                    >
                        Manage User
                    </li>
                </ul>
            </div>
            <div className="content">
                <h2>Welcome</h2>
                {renderComponent()}
            </div>
        </div>
    );
};

export default StoreComponent;
