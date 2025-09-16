import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const MemberReservation = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveTime, setReserveTime] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const member = JSON.parse(localStorage.getItem("member")); // logged-in member

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/inventories/${productId}`);
        setProduct(res.data);
        setAvailableQuantity(res.data.instock); // 初始可用数量为库存
      } catch (err) {
        console.error("Error fetching product", err);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // 当预订日期变化时，获取可用数量
  useEffect(() => {
    const fetchAvailableQuantity = async () => {
      if (reserveDate && product) {
        setLoading(true);
        try {
          const response = await axios.get(`/api/reservations/available-quantities`, {
            params: { 
              date: reserveDate, 
              outlet: product.outlet,
              product_id: product.product_id // 只获取当前产品的可用数量
            }
          });
          
          const available = response.data[product.product_id] || product.instock;
          setAvailableQuantity(available);
          
          // 如果当前选择的数量超过可用数量，自动调整
          if (quantity > available) {
            setQuantity(Math.max(1, available));
          }
        } catch (err) {
          console.error("Error fetching available quantity", err);
          setAvailableQuantity(product.instock);
        } finally {
          setLoading(false);
        }
      } else if (product) {
        setAvailableQuantity(product.instock);
      }
    };
    
    fetchAvailableQuantity();
  }, [reserveDate, product, quantity]);

  const handleReserve = async () => {
    if (!member) {
      alert("You must be logged in as a member!");
      return;
    }
    if (!reserveDate || !reserveTime) {
      alert("Please select date and time!");
      return;
    }

    if (quantity > availableQuantity) {
      alert(`Only ${availableQuantity} items available for ${product.name} on ${reserveDate}`);
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
      alert("Reservation failed. Please try again.");
    }
  };

  const handleQuantityChange = (newQuantity) => {
    const maxQuantity = Math.min(product.instock, availableQuantity);
    setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
  };

  if (!product) {
    return (
      <div className="p-6 text-center">
        <p>Loading reservation data...</p>
      </div>
    );
  }

  const maxSelectable = Math.min(product.instock, availableQuantity);

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
        <p className="mb-2">
          <strong>Outlet:</strong> {product.outlet}
        </p>
        <p className="mb-4">
          <strong>Total Stock:</strong> {product.instock}
        </p>

        {/* Available Quantity Info */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="font-semibold text-blue-800">
            {loading ? (
              "Checking availability..."
            ) : reserveDate ? (
              `Available on ${reserveDate}: ${availableQuantity} items`
            ) : (
              "Please select a date to see availability"
            )}
          </p>
          {availableQuantity === 0 && reserveDate && (
            <p className="text-red-600 text-sm mt-1">
              No available items on this date
            </p>
          )}
        </div>

        {/* Date & Time Picker */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Reserve Date *</label>
          <input
            type="date"
            value={reserveDate}
            onChange={(e) => setReserveDate(e.target.value)}
            className="border p-2 rounded w-full"
            min={new Date().toISOString().split('T')[0]} // 不能选择过去的日期
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium">Reserve Time *</label>
          <input
            type="time"
            value={reserveTime}
            onChange={(e) => setReserveTime(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <label className="block mb-1 font-medium">Quantity *</label>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="px-3 py-1 bg-gray-300 rounded-l disabled:opacity-50"
              >
                -
              </button>
              <span className="px-4 py-1 bg-gray-100 min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxSelectable}
                className="px-3 py-1 bg-gray-300 rounded-r disabled:opacity-50"
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-600">
              Max: {maxSelectable}
            </span>
          </div>
        </div>

        <button
          onClick={handleReserve}
          disabled={loading || (reserveDate && availableQuantity === 0)}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Checking..." : "Reserve Now"}
        </button>
      </div>
    </div>
  );
};

export default MemberReservation;