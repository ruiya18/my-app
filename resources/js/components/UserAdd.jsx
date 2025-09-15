import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// import Sidebar from '../ui/Sidebar'; // Assuming you have a Sidebar component

const UserAdd = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'administrator',
    status: 'active',
    

  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("Form data to be submitted:", form);

  try {
    const response = await axios.post('/api/register', form);
    console.log("Server response:", response);

    setMessage('User added successfully');
    
    // Redirect to user list after successful submission
    navigate('/user-list');
  } catch (err) {
    console.error("Error creating user:", err);
    setMessage('Error creating user');
  }
};


  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Add User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              className="w-full border rounded p-2"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              className="w-full border rounded p-2"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              className="w-full border rounded p-2"
              onChange={handleChange}
              value={form.role}
            >
              <option value="administrator">Administrator</option>
              <option value="quarter master">Quarter Master</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              className="w-full border rounded p-2"
              onChange={handleChange}
              value={form.status}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-grey-200"
          >
            Submit
          </button>
        </div>
          {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default UserAdd;
