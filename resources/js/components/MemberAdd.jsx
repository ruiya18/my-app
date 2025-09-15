// resources/js/components/MemberAdd.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MemberAdd = ({ onMemberAdded }) => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    role: 'student',
    status: 'active'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await axios.post('/api/members', form);
  //     onMemberAdded(); // Refresh list
  //     setForm({ username: '', role: 'student', status: 'active' });
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('/api/members', form);
      setMessage('Member added successfully');
      setForm({ username: '', password: '', role: 'student', status: 'active' });

      if (onMemberAdded) onMemberAdded(); // Optional callback

      // Optional: navigate to member list
      // navigate('/member-list');
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const errors = err.response.data.errors;
        if (errors.username) {
          setMessage(errors.username[0]);
        } else {
          setMessage('Validation error. Please check the form.');
        }
      } else {
        setMessage('Failed to add member. Please try again.');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Add Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              className="w-full border rounded p-2"
              value={form.username}
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
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              className="w-full border rounded p-2"
              value={form.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              className="w-full border rounded p-2"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
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

export default MemberAdd;
