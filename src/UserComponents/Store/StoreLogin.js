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
        e.preventDefault();
        setError('');

        const userCredentials = {
            userId: username,
            password: password
        };

        try {
            const response = await fetch(`${API_BASE_URL}/store/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userCredentials),
            });

            if (response.ok) {
                const userData = await response.json();
                
                // Store user data in session storage with the key "storeData"
                sessionStorage.setItem('storeData', JSON.stringify(userData));
                
                // Navigate to the dashboard after successful login
                navigate('/store/dashboard');
            } else {
                const errorMessage = await response.text();
                setError(`Invalid credentials: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            setError('An error occurred. Please try again later.');
        }
    };

    return (
        <div className='main-page'>
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Login</h2>
                {error && <p className="error">{error}</p>}
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
        </div>
    );
};

export default StoreLogin;
