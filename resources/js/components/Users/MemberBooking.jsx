import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const MemberBooking = () => {
  const { productId } = useParams(); // from /booking/:productId
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentBooking, setCurrentBooking] = useState(null);
  const navigate = useNavigate();

  // get member from localStorage (saved at login)
  const member = JSON.parse(localStorage.getItem("member"));

  // ✅ Load product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/inventories/${productId}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product", err);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  // ✅ Load booking from localStorage on page load
  useEffect(() => {
    const saved = localStorage.getItem("currentBooking");
    if (saved) {
      const booking = JSON.parse(saved);
      if (booking.status === "checkout" && booking.product_id === productId) {
        setCurrentBooking(booking);
      } else {
        localStorage.removeItem("currentBooking");
      }
    }
  }, [productId]);

  // ✅ Handle checkout
  const handleCheckout = async () => {
    if (!member) {
      alert("You must be logged in as a member!");
      return;
    }

    try {
      const res = await axios.post("/api/bookings/checkout", {
        member_id: member.id,
        username: member.username,
        role: member.role,
        product_id: product.product_id,
        product_name: product.name,
        product_image: product.image,
        quantity,
      });

      const booking = res.data.booking;
      setCurrentBooking(booking);
      localStorage.setItem("currentBooking", JSON.stringify(booking)); // ✅ Save

      alert("Checked out successfully!");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message);
        if (err.response.data.booking) {
          // Optionally restore active booking
          setCurrentBooking(err.response.data.booking);
          localStorage.setItem("currentBooking", JSON.stringify(err.response.data.booking));
        }
      } else {
        console.error("Check-out failed", err);
        alert("Checkout failed!");
      }
    }
  };

  // ✅ Handle check-in
  const handleCheckin = async () => {
    if (!member) {
      alert("You must be logged in as a member!");
      navigate("/");
      return;
    }

    if (!currentBooking) {
      alert("No active checkout found! Please checkout first.");
      return;
    }

    try {
      const res = await axios.put(`/api/bookings/${currentBooking.id}/checkin`);
      setCurrentBooking(null); // Clear booking state
      localStorage.removeItem("currentBooking"); // ✅ Clean up

      alert("Checked in successfully!");
    } catch (err) {
      console.error("Check-in failed", err);
      alert("Check-in failed!");
    }
  };

  // ✅ If product not yet loaded
  if (!product) {
    return (
      <div className="p-6 text-center">
        <p>Loading booking data...</p>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-50">
      {/* 🔹 Menu Bar */}
      <nav className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <h1
          onClick={() => navigate("/")}
          className="text-lg font-semibold cursor-pointer"
        >
          Sports Inventory
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate(`/history`)}
            className="hover:underline"
          >
            History
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("member");
              navigate("/");
            }}
            className="hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">Book Product</h2>

      {/* Product Image */}
      {product.image ? (
        <div className="h-40 flex items-center justify-center rounded mb-4 overflow-hidden">
          <img
            src={product.image.startsWith("http") ? product.image : `/storage/${product.image}`}
            alt={product.name}
            className="h-full object-contain"
          />
        </div>
      ) : (
        <div className="h-40 bg-gray-200 flex items-center justify-center rounded mb-4">
          <span className="text-gray-500">[No Image]</span>
        </div>
      )}

      <p className="mb-2">
        <strong>Name:</strong> {product.name}
      </p>
      <p className="mb-4">
        <strong>Available:</strong> {product.instock}
      </p>

      {/* Quantity Selector */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-1 bg-gray-300 rounded-l"
        >
          -
        </button>
        <span className="px-4">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(product.instock, quantity + 1))}
          className="px-3 py-1 bg-gray-300 rounded-r"
        >
          +
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleCheckout}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Check-Out
        </button>
        <button
          onClick={handleCheckin}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Check-In
        </button>
      </div>
    </div>
    </div>
  );
};

export default MemberBooking;
