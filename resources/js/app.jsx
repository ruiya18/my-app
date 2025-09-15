// App.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route,Navigate } from 'react-router-dom';

import Login from './components/Login';
import Logout from './components/Logout';
import Dashboard from './components/Dashboard';

import UserAdd from './components/UserAdd';
import UserList from './components/UserList';
import UserEdit from './components/UserEdit';
import UserChangePassword from './components/UserChangePassword';

import MemberAdd from './components/MemberAdd';
import MemberList from './components/MemberList';
import MemberEdit from './components/MemberEdit';
import MemberChangePassword from './components/MemberChangePassword';

import ProductAdd from './components/Products/ProductAdd';
import ProductList from './components/Products/ProductList';
import ProductEdit from './components/Products/ProductEdit';

import StockCheckAdd from './components/StockCheck/stockCheckAdd';
import StockCheckList from './components/StockCheck/stockCheckList';
import Inventory from './components/StockCheck/Inventory';
// import StockCheckEdit from './components/StockCheck/stockCheckEdit';

import BookingList from './components/Bookings/BookingList';
import BookingAdd from './components/Bookings/BookingAdd';
import BookingEdit from './components/Bookings/BookingEdit';

import ReservationList from './components/Reservations/ReservationList';
import ReservationAdd from './components/Reservations/ReservationAdd';
import ReservationEdit from './components/Reservations/ReservationEdit';

import Homepage from './components/Users/HomePage';
import MemberBooking from './components/Users/MemberBooking';
import MemberReservation from './components/Users/MemberReservation';
import History from './components/Users/History';

import Layout from './components/Layout'; 
import '../css/app.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/user-add" element={<UserAdd />} />
          <Route path="/user-list" element={<UserList />} />
          <Route path="/user-edit/:id" element={<UserEdit />} />
          <Route path="/user-change-password/:id" element={<UserChangePassword />} />
          
          <Route path="/member-add" element={<MemberAdd />} />
          <Route path="/member-list" element={<MemberList />} />
          <Route path="/member-edit/:id" element={<MemberEdit />} />
          <Route path="/member-change-password/:id" element={<MemberChangePassword />} />

          <Route path="/product-add" element={<ProductAdd />} />
          <Route path="/product-list" element={<ProductList />} />
          <Route path="/product-edit/:productId" element={<ProductEdit />} />

          <Route path ="/stockcheck-add" element={<StockCheckAdd />} />
          <Route path ="/stockcheck-list" element={<StockCheckList />} />
          <Route path ="/inventory" element={<Inventory />} />
          {/* <Route path ="/stockcheck-edit/:id" element={<StockCheckEdit />} /> */} 
          
          <Route path="/booking-add" element={<BookingAdd />} />
          <Route path="/booking-list" element={<BookingList />} />
          <Route path="/booking-edit/:id" element={<BookingEdit />} />

          <Route path="/reservation-add" element={<ReservationAdd />} />
          <Route path="/reservation-list" element={<ReservationList />} />
          <Route path="/reservation-edit/:id" element={<ReservationEdit />} />

          <Route path="/logout" element={<Logout />} />
          {/* Add other authenticated routes here */}
        </Route>

        {/* mobile page */}
        <Route path="/home/:productId" element={<Homepage />} />
        <Route path="/member-booking/:productId" element={<MemberBooking />} />
        <Route path="/reservation/:productId" element={<MemberReservation />} />
        <Route path="/history" element={<History />} />

      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
