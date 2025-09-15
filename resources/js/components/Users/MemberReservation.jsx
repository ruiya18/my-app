import React, { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import axios from "axios";

const MemberReservation = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveTime, setReserveTime] = useState("");
  const navigate = useNavigate();
  const member = JSON.parse(localStorage.getItem("member")); // logged-in member

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

  const handleReserve = async () => {
    if (!member) {
      alert("You must be logged in as a member!");
      return;
    }
    if (!reserveDate || !reserveTime) {
      alert("Please select date and time!");
      return;
    }

    try {
      await axios.post("/api/reservations", {
        member_id: member.id,
        username: member.username,
        product_id: product.product_id,
        product_name: product.name,
        outlet: product.outlet,
        quantity,
        reserve_date: reserveDate,
        reserve_time: reserveTime,
        status: "pending",
      });
      alert("Reservation submitted successfully!");
      navigate("/history");
    } catch (err) {
      console.error("Reservation failed", err);
    }
  };

  if (!product) {
    return (
      <div className="p-6 text-center">
        <p>Loading reservation data...</p>
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
      <h2 className="text-xl font-semibold mb-4">Reserve Product</h2>

      {/* Product Image Placeholder */}
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

      {/* Date & Time Picker */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Reserve Date</label>
        <input
          type="date"
          value={reserveDate}
          onChange={(e) => setReserveDate(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Reserve Time</label>
        <input
          type="time"
          value={reserveTime}
          onChange={(e) => setReserveTime(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        onClick={handleReserve}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Reserve
      </button>
    </div>
    </div>
  );
};

export default MemberReservation;
