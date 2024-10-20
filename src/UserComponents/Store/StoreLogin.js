import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StoreLogin.css'; // Optional CSS for styling
import { API_BASE_URL } from "../Config.js";

const StoreLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setError(''); // Clear any previous error messages

        const userCredentials = {
            userId: username, // Assuming userId is the correct field for the API
            password: password
        };

        console.log("Attempting to log in with:", userCredentials); // Debug log

        try {
            const response = await fetch(`${API_BASE_URL}/store/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userCredentials),
            });

            // Check if the response is OK (status code 200-299)
            if (response.ok) {
                const userData = await response.json(); // Parse the JSON response
                console.log("User data received:", userData); // Debug log
                navigate('/store/dashboard', { state: { user: userData } }); // Navigate to the store component
            } else {
                // Handle non-200 responses
                const errorMessage = await response.text(); // Get error message from response
                setError(`Invalid credentials: ${errorMessage}`); // Update error state
            }
        } catch (error) {
            console.error('Network error:', error); // Log network errors
            setError('An error occurred. Please try again later.'); // Set a user-friendly error message
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Login</h2>
                {error && <p className="error">{error}</p>} {/* Show error message if present */}
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // Update username state
                        required // Ensure this field is filled out
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Update password state
                        required // Ensure this field is filled out
                    />
                </div>
                <button type="submit">Login</button> {/* Submit button */}
            </form>
        </div>
    );
};

export default StoreLogin;
