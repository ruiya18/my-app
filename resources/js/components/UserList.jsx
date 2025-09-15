import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;
  const navigate = useNavigate();
  
  const capitalizeWords = (str) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

  const getStatusClasses = (status) => {
    return status.toLowerCase() === 'active'
      ? 'text-green-600 bg-green-100 px-2 py-1 rounded-full'
      : status.toLowerCase() === 'inactive'
      ? 'text-red-600 bg-red-100 px-2 py-1 rounded-full'
      : 'text-gray-600 bg-gray-100 px-2 py-1 rounded-full'; 
  };


  // Fetch users data from API
  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users", {
        headers: {
          Accept: "application/json",
        },
      });
      console.log("Fetched users:", response);

      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on input
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(filterText.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const handleDelete = async (userId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;
  try {
    await axios.delete(`/api/users/${userId}`);
    // Remove the deleted user from the list
    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
  } catch (error) {
    console.error("Failed to delete user:", error);
    alert("An error occurred while deleting the user.");
  }
};

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">User List</h2>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          {/* Filter + Add Button Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <input
              type="text"
              placeholder="Search users..."
              className="border border-gray-300 rounded px-4 py-2 w-full sm:w-64"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
            />

            <button
              className="bg-black text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => navigate("/user-add")}
            >
              + Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2 text-left">USERNAME</th>
                  <th className="border-b px-4 py-2 text-left">ROLE</th>
                  <th className="border-b px-4 py-2 text-left">STATUS</th>
                  <th className="border-b px-4 py-2 text-left">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="border-b px-4 py-2">{user.username}</td>
                      <td className="border-b px-4 py-2">{capitalizeWords(user.role)}</td>
                      <td className="border-b px-4 py-2">
                        <span className={getStatusClasses(user.status)}>
                          {capitalizeWords(user.status)}
                        </span>
                      </td>
                      <td className="border-b px-4 py-2">
                        <button
                          className="text-black-600 hover:text-black-800 mr-2 border border-black-600 hover:border-black-600 rounded-full p-2"
                          onClick={() => navigate(`/user-edit/${user.id}`)}
                        >
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-5 h-5" // Adjust size as needed
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                              />
                            </svg>
                        </button>
                           {/* delete button */}
                            <button
                              className="text-black-600 hover:text-black-800 border border-black-600 hover:border-black-600 rounded-full p-2"
                              onClick={() => handleDelete(user.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No users available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-1 rounded border ${
                      currentPage === pageNumber
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
