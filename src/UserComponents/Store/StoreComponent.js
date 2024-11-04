import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StoreComponent.css';
import AddStore from './AddStore';
import AddUser from './AddUser';
import ManageUser from './ManageUser';

const StoreComponent = () => {
    const [activeComponent, setActiveComponent] = useState('AddStore');
    const navigate = useNavigate();

    const user = JSON.parse(sessionStorage.getItem('storeData'));

    useEffect(() => {
        if (!user) {
            navigate('/store/login');
        }
    }, [user, navigate]);

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
            <div className="store-sidebar">
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
            <div className="store-content">
                <h2>Welcome</h2>
                {renderComponent()}
            </div>
        </div>
    );
};

export default StoreComponent;
