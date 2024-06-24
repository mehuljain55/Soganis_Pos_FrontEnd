// src/UserComponents/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import './login.css'; 


const Login = ({ setUserData }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8080/login', {
        userId: userId,
        password: password
      });
      console.log('Login Successful:', response.data);
      setUserData(response.data); // Assuming setUserData is a prop function to set user data in MainComponent
    } catch (error) {
      console.error('Login Error:', error);
      setError('Incorrect credentials. Please try again.');
    }
  };

  return (
    <><div className="Nav">Shop</div><div className=" container">
      <div className="align-self-center row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center">Login</h2>
              {error && <p className="text-danger text-center">{error}</p>}
              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); } }>
                <div className="mb-3">
                  <label htmlFor="userId" className="form-label">User ID:</label>
                  <input type="text" className="form-control" id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password:</label>
                  <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary">Login</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div></>
  );
};

export default Login;
