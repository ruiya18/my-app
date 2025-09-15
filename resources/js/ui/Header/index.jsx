// Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const Header = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);  // State for the dropdown anchor

  // Check if user is logged in and set the username
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.username) {
      setUsername(user.username);
    } else {
      navigate('/login');  // Redirect to login if no user is logged in
    }
  }, [navigate]);

  // Open the dropdown menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close the dropdown menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center bg-[#0a0d1f] p-4 text-white">
      <div className="text-xl font-semibold">Sports System</div>

      {/* Right side with username and logout button */}
      <div className="flex items-center space-x-4 relative">
        {/* Username, click to open dropdown */}
        <span
          onClick={handleClick}
          className="text-white text-lg cursor-pointer hover:text-gray-300 transition duration-200 ease-in-out"
        >
          {username}
        </span>

        {/* Material-UI Menu (Dropdown) */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            style: {
              width: '160px', // Control the width of the dropdown
            },
          }}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>My account</MenuItem>
          <MenuItem onClick={handleLogout}>
            <FaSignOutAlt className="inline mr-2" size={18} />
            Logout
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
};

export default Header;
