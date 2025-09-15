import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    role: "administrator",
    status: "active",
  });

  const [message, setMessage] = useState("");

  // Fetch existing user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${id}`);
              console.log("Fetched usersedit:", response);

        setForm({
          username: response.data.username,
          role: response.data.role,
          status: response.data.status,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        setMessage("Failed to load user data.");
      }
    };

    fetchUser();
  }, [id]);

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${id}`, form);
      setMessage("User updated successfully.");
      navigate("/user-list"); // Redirect after success
    } catch (err) {
      console.error("Error updating user:", err);
      setMessage("Failed to update user.");
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow max-w-lg mx-auto">
        <h2 className="text-lg font-semibold mb-4">Edit User</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="administrator">Administrator</option>
              <option value="quarter master">Quarter Master</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end">
             <button
                type="button"
                className="text-blue-600 hover:underline ml-4 mr-4"
                onClick={() => navigate(`/user-change-password/${id}`)}
            >
                Change Password
            </button>

            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              Update User
            </button>
          </div>

          {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default UserEdit;
