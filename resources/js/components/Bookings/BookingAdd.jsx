import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BookingAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    member_id: "",
    username: "",
    outlet: "",
    product_id: "",
    product_name: "",
    quantity: 1,
    status: "pending",
  });

  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch members & products
  useEffect(() => {
    axios.get("/api/members").then((res) => setMembers(res.data));
    axios.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  // Filter products based on outlet
  useEffect(() => {
    if (formData.outlet) {
      setFilteredProducts(products.filter((p) => p.outlet === formData.outlet));
    } else {
      setFilteredProducts([]);
    }
  }, [formData.outlet, products]);

  const handleMemberChange = (e) => {
    const selected = members.find((m) => m.id == e.target.value);
    setFormData((prev) => ({
      ...prev,
      member_id: selected?.id || "",
      username: selected?.username || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/bookings", {
        ...formData,
        product_id: selectedProduct?.product_id || "",
        product_name: selectedProduct?.name || "",
      });
      navigate("/booking-list");
    } catch (err) {
      console.error("Error creating booking", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Add Booking</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow max-w-lg"
      >
        {/* Select Member */}
        <div className="mb-3">
          <label className="block">Member</label>
          <select
            className="border px-3 py-2 w-full"
            value={formData.member_id}
            onChange={handleMemberChange}
            required
          >
            <option value="">-- Select Member --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.username}
              </option>
            ))}
          </select>
        </div>

        {/* Select Outlet */}
        <div className="mb-3">
          <label className="block">Outlet</label>
          <select
            className="border px-3 py-2 w-full"
            value={formData.outlet}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, outlet: e.target.value }))
            }
            required
          >
            <option value="">-- Select Outlet --</option>
            <option value="QM ROOM">QM ROOM</option>
            <option value="UP STORE">UP STORE</option>
            <option value="DOWN STORE">DOWN STORE</option>
          </select>
        </div>

        {/* Select Product */}
        <div className="mb-3">
          <label className="block">Product</label>
          <select
            className="border px-3 py-2 w-full"
            value={selectedProduct?.product_id || ""}
            onChange={(e) =>
              setSelectedProduct(
                filteredProducts.find((p) => p.product_id == e.target.value)
              )
            }
            required
            disabled={!formData.outlet}
          >
            <option value="">-- Select Product --</option>
            {filteredProducts.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="mb-3">
          <label className="block">Quantity</label>
          <input
            type="number"
            className="border px-3 py-2 w-full"
            value={formData.quantity}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, quantity: e.target.value }))
            }
            min="1"
            required
          />
        </div>

        {/* Status */}
        <div className="mb-3">
          <label className="block">Status</label>
          <select
            className="border px-3 py-2 w-full"
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="pending">Pending</option>
            <option value="checkin">Check-In</option>
            <option value="checkout">Check-Out</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="flex gap-4 justify-end">
          
          <button
            type="button"
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => navigate("/booking-list")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingAdd;
