import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../Config';
import './ManageUser.css'; // Custom CSS for ManageUser component

const ManageUser = () => {
    const [users, setUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch all users when component loads
    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/store/getAllUser`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                setErrorMessage("No users found.");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setErrorMessage("Failed to fetch users.");
        }
    };

    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/deleteUser/${userId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setUsers(users.filter(user => user.userId !== userId));
            } else {
                setErrorMessage("Failed to delete user.");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setErrorMessage("Failed to delete user.");
        }
    };

    const handleModifyUser = (userId) => {
        // Navigate to modify user component/page
        window.location.href = `/modifyUser/${userId}`; // Adjust the path as per your routing structure
    };

    return (
        <div className="manage-user-wrapper">
            <h2 className="manage-user-heading">Manage Users</h2>

            {errorMessage && <p className="manage-user-error-message">{errorMessage}</p>}

            <table className="manage-user-table">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Mobile No</th>
                        <th>Role</th>
                        <th>Monthly Salary</th>
                        <th>Payable Balance</th>
                        <th>Store ID</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.userId}>
                                <td>{user.userId}</td>
                                <td>{user.sname}</td>
                                <td>{user.mobile_no}</td>
                                <td>{user.role}</td>
                                <td>{user.monthly_salary}</td>
                                <td>{user.payable_balance}</td>
                                <td>{user.storeId}</td>
                                <td>
                                    <button
                                        className="manage-user-modify-btn"
                                        onClick={() => handleModifyUser(user.userId)}
                                    >
                                        Modify
                                    </button>
                                    <button
                                        className="manage-user-delete-btn"
                                        onClick={() => deleteUser(user.userId)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="manage-user-no-data">No users available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUser;
