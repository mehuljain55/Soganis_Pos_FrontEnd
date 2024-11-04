import React, { useState } from 'react';
import { API_BASE_URL } from '../Config.js';
import './AddStore.css'; // Assuming you're adding some styles for the modal

const AddStore = () => {
    const [storeId, setStoreId] = useState('');
    const [storeName, setStoreName] = useState('');
    const [address, setAddress] = useState('');
    const [validationMessage, setValidationMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false); // For controlling the success modal

    // Validate storeId before adding store
    const validateStoreId = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/store/validate?storeId=${storeId}`);
            const status = await response.text();
            return status;
        } catch (error) {
            console.error("Error validating store ID:", error);
            setErrorMessage("Failed to validate store ID. Please try again.");
            return null;
        }
    };

    // Add store after validation
    const addStore = async () => {
        try {
            const store = { storeId, storeName, address };
            const response = await fetch(`${API_BASE_URL}/store/createStore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(store),
            });

            if (response.ok) {
                const status = await response.text();
                setSuccessMessage(`Store added successfully! Status: ${status}`);
                setErrorMessage('');
                setShowSuccessPopup(true); // Show success pop-up
                clearForm(); // Clear form after successful submission
            } else {
                const status = await response.text();
                setErrorMessage(`Failed to add store. Status: ${status}`);
                setSuccessMessage('');
            }
        } catch (error) {
            console.error("Error adding store:", error);
            setErrorMessage("Failed to add store. Please try again.");
        }
    };

    // Clear form fields after successful submission
    const clearForm = () => {
        setStoreId('');
        setStoreName('');
        setAddress('');
        setValidationMessage('');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // First, validate the storeId
        const validationStatus = await validateStoreId();

        if (validationStatus === 'New') {
            setValidationMessage("Store ID is new. Adding the store...");
            await addStore();
        } else if (validationStatus === 'Exists') {
            setValidationMessage("Store ID already exists. Please choose a different Store ID.");
        } else {
            setValidationMessage("Validation failed. Please try again.");
        }
    };

    return (
        <div className="add-store-component">
            <h2>Add Store</h2>
            <form onSubmit={handleSubmit}>
                <div className="add-store-form-group">
                    <label htmlFor="storeId">Store ID:</label>
                    <input
                        type="text"
                        id="storeId"
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        required
                    />
                </div>
                <div className="add-store-form-group">
                    <label htmlFor="storeName">Store Name:</label>
                    <input
                        type="text"
                        id="storeName"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        required
                    />
                </div>
                <div className="add-store-form-group">
                    <label htmlFor="address">Address:</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>
                <button className="add-store-button" type="submit">Add Store</button>
            </form>
            
            {/* Display validation, success, or error messages */}
            {validationMessage && <p className="add-store-message">{validationMessage}</p>}
            {successMessage && <p className="add-store-success-message">{successMessage}</p>}
            {errorMessage && <p className="add-store-error-message">{errorMessage}</p>}

            {/* Success Popup Modal */}
            {showSuccessPopup && (
                <div className="add-store-popup">
                    <div className="add-store-popup-content">
                        <span className="add-store-success-icon">✔️</span>
                        <p>Store added successfully!</p>
                        <button className="add-store-close-button" onClick={() => setShowSuccessPopup(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddStore;
