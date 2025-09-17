import React, { useState } from 'react'; 
import axios from 'axios';
import { useNavigate,useLocation } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "/dashboard";


const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  try {
    const res = await axios.post("/api/login", { username, password });

    if (res.status === 200) {
      if (res.data.member) {
        localStorage.setItem("member", JSON.stringify(res.data.member));
        navigate(redirect, { replace: true });
      } else if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      }
    }
  } catch (err) {
    if (err.response) {
      if (err.response.status === 401) {
        setError("Invalid password. Please try again.");
      } else if (err.response.status === 404) {
        setError("Account not found. Please ask the administrator to create an account for you.");
      } else {
        setError("Server error. Please try again later.");
      }
    } else {
      setError("Network error. Please check your connection.");
    }
  }
};

//   const handleLogin = async (e) => {
//   e.preventDefault();
//   setError('');

//   try {
//     const response = await axios.post('/api/login', { username, password });
    
//     if (response.status === 200) {
//       if (response.data.user) {
//         localStorage.setItem("user", JSON.stringify(response.data.user));
//         navigate("/dashboard");
//       } else if (response.data.member) {
//         localStorage.setItem("member", JSON.stringify(response.data.member));
//         navigate("/home");
//       }
//     }


//   } catch (err) {
//     if (err.response && err.response.status === 401) {
//       setError('Invalid credentials');
//     } else {
//       setError('Server error, please try again later');
//     }
//     console.error('Login error:', err);
//   }
  
// };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative bg-[url('./assets/bg.jpg')] bg-cover bg-center text-gray-900 font-sans">
      
      {/* Logo and Title */}
      <div className="absolute top-14 text-center w-full text-white">
        {/* <img src="./assets/logo.png" alt="Logo" className="mx-auto h-15 mb-2" /> */}
        <h2 className="text-6xl font-bold">Sports System</h2>
      </div>

      {/* Login Card */}
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-sm text-gray-600 mt-1">Log in to your account to start using</p>
        </div>

        {/* Show error if any */}
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} autoComplete="off">
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          {/* If you want the "Keep Me Signed In" checkbox, you can add it here */}
          {/* <div className="flex items-center mb-4">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember" className="text-sm">Keep Me Signed In</label>
          </div> */}
          <button
            type="submit"
            className="w-full bg-[#0a0d1f] hover:bg-[#1d2138] text-white font-semibold py-2 rounded transition"
          >
            Login
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-white text-xs text-center w-full">
        COPYRIGHT © 2025 Sports Inventory Management System. All Rights Reserved.
      </footer>
    </div>
  );
}

export default Login;
