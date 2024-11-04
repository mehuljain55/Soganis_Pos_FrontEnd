import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import { API_BASE_URL } from '../Config.js';
import logo from '../Icon/Logo.png';

const Login = ({ setUserData }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      console.log(API_BASE_URL);
      const response = await axios.post(`${API_BASE_URL}/user/login`, {
        userId: userId,
        password: password,
      });
      console.log('Login Successful:', response.data);
      setUserData(response.data);
    } catch (error) {
      console.error('Login Error:', error);
      setError('Incorrect credentials. Please try again.');
    }
  };

  return (
    <div className='loginContainer'>
      <header className="site-header">
        <img src={logo} alt="Company Logo" className="logo" />
      </header>

      <div className="login-background">
        <div className="login-container">
          <h2>Login</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <label htmlFor="user-id">User ID:</label>
            <input
              type="text"
              id="user-id"
              name="user-id"
              onChange={(e) => setUserId(e.target.value)}
              value={userId}
              required
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />

            <button type="submit">Login</button>
          </form>
          {error && <p className="error">{error}</p>}
          <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
        </div>
      </div>

      <footer className="site-footer">
        <p><b>Contact Us:</b> 0731 495 7094</p>
        <p><b>Email:</b> info@company.com</p>
        <p><b>Address:</b> UG 17, Hotel Crown Place, Opposite Jain Samvsharan Mandir<br />18, Road, Trade Centre, South Tukoganj<br />Indore, Madhya Pradesh 452001<br /></p>
      </footer>
    </div>
  );
};

export default Login;