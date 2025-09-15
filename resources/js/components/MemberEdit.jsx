import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const MemberEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    role: "member",
    status: "active",
  });

  const [message, setMessage] = useState("");

  // Fetch existing member data
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(`/api/members/${id}`);
        const data = response.data;

        setForm({
          username: data.username || "",
          role: data.role || "member",
          status: data.status || "active",
        });
      } catch (err) {
        console.error("Error fetching member:", err);
        setMessage("Failed to load member data.");
      }
    };

    fetchMember();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form to update member
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/members/${id}`, form);
      setMessage("Member updated successfully.");
      setTimeout(() => navigate("/member-list"), 1000);
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const errors = err.response.data.errors;
        if (errors.username) {
          setMessage(errors.username[0]);
        } else {
          setMessage('Validation error. Please check the form.');
        }
      } else {
        setMessage('Failed to update member. Please try again.');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow max-w-lg mx-auto">
        <h2 className="text-lg font-semibold mb-4">Edit Member</h2>

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
              <option value="member">Teacher</option>
              <option value="student">Student</option>
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
                onClick={() => navigate(`/member-change-password/${id}`)}
            >
                Change Password
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              Update Member
            </button>
          </div>

          {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default MemberEdit;
