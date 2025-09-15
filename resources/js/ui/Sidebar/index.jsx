import React, { useState, useRef, useEffect } from 'react';
import SidebarLogo from './SidebarLogo';
import Navmenu from './Navmenu';
import SimpleBar from 'simplebar-react';
import { useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const scrollableNodeRef = useRef(null);
  const [scroll, setScroll] = useState(false);

  // Get user role from localStorage
  const userData = JSON.parse(localStorage.getItem('user'));
  const userRole = userData?.role || '';

  // Define role-based permissions
  const rolePermissions = {
    administrator: [
      'Dashboard', 'Product', 'Inventory', 'Stock Check', 'Booking', 'Reservation', 'User', 'Member'
    ],
    'quarter master': [
      'Product', 'Inventory', 'Stock Check', 'Booking', 'Reservation'
    ]
  };

  const fullMenu = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Product', to: '/product-list' },
    { label: 'Inventory', to: '/inventory' },
    { label: 'Stock Check', to: '/stockcheck-add' },
    { label: 'Booking', to: '/booking-list' },
    { label: 'Reservation', to: '/reservation-list' },
    { label: 'Member', to: '/member-list' },
    { label: 'User', to: '/user-list' }
  ];

  // Filter menus based on role
  const allowedLabels = rolePermissions[userRole] || [];
  const menu = fullMenu.filter(item => allowedLabels.includes(item.label));

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = scrollableNodeRef.current?.scrollTop || 0;
      setScroll(scrollTop > 10);
    };

    const node = scrollableNodeRef.current;
    if (node) node.addEventListener('scroll', handleScroll);
    return () => {
      if (node) node.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <aside className="w-[300px] h-full bg-white border-r border-gray-200 relative">
      <SidebarLogo />
      <div
        className={`h-[60px] absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
          scroll ? 'opacity-100' : 'opacity-0'
        }`}
      ></div>

      <SimpleBar
        className="sidebar-menu px-4 h-[calc(100%-80px)]"
        scrollableNodeProps={{ ref: scrollableNodeRef }}
      >
        <div className="pt-6 text-sm text-gray-400 font-semibold">MENU</div>
        <Navmenu menus={menu} currentPath={currentPath} />
      </SimpleBar>
    </aside>
  );
};

export default Sidebar;
