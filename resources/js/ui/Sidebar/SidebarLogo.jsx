import React from 'react';
import { Link } from 'react-router-dom';

const SidebarLogo = ({ menuHover }) => {
  return (
    <div className="h-[80px] flex items-center px-4 border-b border-gray-200">
      <Link to="/" className="flex items-center gap-3">
        {/* Logo Icon  */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          SS
        </div>

        {/* System Name */}
        {!menuHover && (
          <span className="text-lg font-semibold text-gray-800 whitespace-nowrap">
            Sports System
          </span>
        )}
      </Link>
    </div>
  );
};

export default SidebarLogo;
