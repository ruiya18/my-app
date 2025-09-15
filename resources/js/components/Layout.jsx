// components/Layout.jsx
import React from 'react';
import Sidebar from '../ui/Sidebar'; // Import Sidebar
import Header from '../ui/Header';  // Import Header
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />  {/* Render Sidebar */}

      <div className="flex flex-col flex-1">
        <Header /> {/* Render Header */}
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {/* Outlet will render the matched child route */}
          <Outlet />
        </main>

        {/* Footer (uncomment if needed) */}
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Layout;
