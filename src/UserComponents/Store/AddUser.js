import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../Config.js';

const AddUser = () => {
    const [userId, setUserId] = useState('');
    const [sname, setSname] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User'); // Default role is "User"
    const [monthlySalary, setMonthlySalary] = useState('');
    const [storeId, setStoreId] = useState('');
    const [stores, setStores] = useState([]);
    const [validationMessage, setValidationMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch all available stores on component mount
    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/store/getAllStores`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const storeData = await response.json();
                    setStores(storeData);
                } else {
                    console.error('Failed to fetch stores');
                    setErrorMessage('Failed to fetch stores. Please try again.');
                }
            } catch (error) {
                console.error("Error fetching stores:", error);
                setErrorMessage("Failed to fetch stores. Please try again.");
            }
        };

        fetchStores();
    }, []);

    // Validate userId before creating user
    const validateUserId = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/store/validate/userId?userId=${userId}`);
            const status = await response.text();
            return status;
        } catch (error) {
            console.error("Error validating user ID:", error);
            setErrorMessage("Failed to validate user ID. Please try again.");
            return null;
        }
    };

    // Create user after validation
    const createUser = async () => {
        try {
            const user = { userId, sname, mobile_no: mobileNo, password, role, monthly_salary: monthlySalary, storeId };
            const response = await fetch(`${API_BASE_URL}/store/createUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            if (response.ok) {
                const status = await response.text();
                setSuccessMessage(`User created successfully! Status: ${status}`);
                setErrorMessage('');
                clearForm();
            } else {
                const status = await response.text();
                setErrorMessage(`Failed to create user. Status: ${status}`);
                setSuccessMessage('');
            }
        } catch (error) {
            console.error("Error creating user:", error);
            setErrorMessage("Failed to create user. Please try again.");
        }
    };

    // Clear form fields after successful submission
    const clearForm = () => {
        setUserId('');
        setSname('');
        setMobileNo('');
        setPassword('');
        setRole('User');
        setMonthlySalary('');
        setStoreId('');
        setValidationMessage('');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // First, validate the userId
        const validationStatus = await validateUserId();

        if (validationStatus === 'New') {
            setValidationMessage("User ID is new. Creating the user...");
            await createUser();
        } else if (validationStatus === 'Exists') {
            setValidationMessage("User ID already exists. Please choose a different User ID.");
        } else {
            setValidationMessage("Validation failed. Please try again.");
        }
    };

    return (
        <div className="create-user-component">
            <h2>Create User</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="userId">User ID:</label>
                    <input
                        type="text"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="sname">Full Name:</label>
                    <input
                        type="text"
                        id="sname"
                        value={sname}
                        onChange={(e) => setSname(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="mobileNo">Mobile Number:</label>
                    <input
                        type="text"
                        id="mobileNo"
                        value={mobileNo}
                        onChange={(e) => setMobileNo(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Role:</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
                        <option value="User">User</option>
                        <option value="Owner">Owner</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="monthlySalary">Monthly Salary:</label>
                    <input
                        type="number"
                        id="monthlySalary"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="storeId">Store:</label>
                    <select
                        id="storeId"
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        required
                    >
                        <option value="">Select Store</option>
                        {stores.map(store => (
                            <option key={store.storeId} value={store.storeId}>
                                {store.storeName} - {store.address}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit">Create User</button>
            </form>

            {/* Display validation, success, or error messages */}
            {validationMessage && <p className="message">{validationMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default AddUser;
