import { useState } from 'react';
import axios from 'axios';
import './login.css';
import { USER_LOGIN_URL } from '../Api/ApiConstants.js';
import logo from '../Icon/Logo.png';

const Login = ({ setUserData }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ✅ Handle Login Request
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission

    try {
      const formData = new URLSearchParams();
      formData.append("userId", userId);
      formData.append("password", password);

      const response = await axios.post(USER_LOGIN_URL, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status === 'success') {
        const user = response.data.payload.user;
        const token = response.data.payload.token;

        // ✅ Save user and token
        setUserData(user);
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);

        console.log("Login Successful:", user);
      } else {
        setError(response.data.payload.message || "Unable to login");
      }
    } catch (error) {
      if (error.response) {
        console.error('Login Error:', error.response.data);
        setError(error.response.data.message || 'Incorrect credentials. Please try again.');
      } else {
        console.error('Network Error:', error);
        setError('Something went wrong. Please try again later.');
      }
    }
  };

  return (
    <div className='loginContainer'>
      {/* Header */}
      <header className="site-header">
        <img src={logo} alt="Company Logo" className="logo" />
      </header>

      {/* Login Form */}
      <div className="login-background">
        <div className="login-container">
          <h2>Login</h2>
          
          <form onSubmit={handleLogin}>
            <label htmlFor="user-id">User ID:</label>
            <input
              type="text"
              id="user-id"
              name="user-id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />

            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>

          <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
          {error && <p className="error">{error}</p>} {/* Show error message if exists */}
       
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <p><b>Contact Us:</b> 0731 495 7094</p>
        <p><b>Email:</b> info@company.com</p>
        <p><b>Address:</b> UG 17, Hotel Crown Place, Opposite Jain Samvsharan Mandir<br />
           18, Road, Trade Centre, South Tukoganj<br />
           Indore, Madhya Pradesh 452001<br />
        </p>
      </footer>
    </div>
  );
};

export default Login;
