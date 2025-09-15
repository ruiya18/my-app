// Logout.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('user');
    navigate('/login');  // Redirect to login page after logging out
  }, [navigate]);

  return null;  // Empty render because the logic is handled in useEffect
};

export default Logout;
