// src/UserComponents/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import { API_BASE_URL } from './Config.js';
// import logo from "../Icon/soganinx.png";

const Login = ({ setUserData }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      console.log(API_BASE_URL);
      const response = await axios.post(`${API_BASE_URL}/login`, {
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
    <>
      
      <header className="bg-light py-3">
        <div className="container text-center">
          <h2>Soganis NX</h2>
          <p>
             UG 17, Hotel Crown Place, Opposite Jain Samvsharan Mandir , 18, Road, Trade Centre, South Tukoganj, Indore, Madhya Pradesh 452001<br/>
            Phone: 0731 495 7094
          </p>
        </div>
      </header>     
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-center mb-4">Login</h2>
                {error && <p className="text-danger text-center">{error}</p>}
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                  <div className="mb-3">
                    <label htmlFor="userId" className="form-label">User ID</label>
                    <input
                      type="text"
                      className="form-control"
                      id="userId"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter your user ID"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-block">Login</button>
                  </div>
                </form>
                <div className="text-center mt-3">
                  <a href="#" className="text-decoration-none">Forgot password?</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
