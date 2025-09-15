// ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const member = localStorage.getItem("member"); // check member login
  const location = useLocation();

  if (!member) {
    // not logged in → redirect to login and remember where they wanted to go
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
