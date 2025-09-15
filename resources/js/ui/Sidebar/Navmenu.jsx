import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaCircle, FaRegCircle } from 'react-icons/fa';

const Navmenu = ({ menus, currentPath }) => {
  const [openMenu, setOpenMenu] = useState('');

  const toggleMenu = (label) => {
    setOpenMenu((prev) => (prev === label ? '' : label));
  };

  return (
    <ul className="mt-4 space-y-2 text-sm text-gray-700">
      {menus.map((menu) => {
        const hasChildren = Array.isArray(menu.children) && menu.children.length > 0;

        // Dropdown Menu
        if (hasChildren) {
          return (
            <li key={menu.label}>
              <button
                className="flex items-center justify-between w-[600px] font-medium hover:text-primary"
                onClick={() => toggleMenu(menu.label)}
              >
                <span className="flex items-center gap-2">
                  {/* Replace with an actual icon if desired */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  {menu.label}
                </span>
                <FaChevronDown
                  className={`transition-transform duration-200 ${
                    openMenu === menu.label ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown items */}
              {openMenu === menu.label && (
                <ul className="mt-2 pl-6 space-y-1 text-gray-600">
                  {menu.children.map((item) => {
                    const isActive = currentPath === item.to;
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className={`flex items-center gap-2 py-1 hover:text-primary ${
                            isActive ? 'font-semibold text-primary' : ''
                          }`}
                        >
                          {isActive ? (
                            <FaCircle className="text-primary" size={8} />
                          ) : (
                            <FaRegCircle className="text-gray-400" size={8} />
                          )}
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        }

        // Direct Link Menu
        return (
          <li key={menu.label}>
            <Link
              to={menu.to}
              className={`flex items-center gap-2 py-2 hover:text-primary ${
                currentPath === menu.to ? 'font-semibold text-primary' : ''
              }`}
            >
              {currentPath === menu.to ? (
                <FaCircle className="text-primary" size={8} />
              ) : (
                <FaRegCircle className="text-gray-400" size={8} />
              )}
              {menu.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default Navmenu;
