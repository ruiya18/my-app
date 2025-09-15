import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function BookingEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

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

  // Fetch members & products
  useEffect(() => {
    axios.get("/api/members").then((res) => setMembers(res.data));
    axios.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  // Fetch booking by ID after products are loaded
// Fetch booking by ID after products are loaded
useEffect(() => {
  if (products.length === 0) return; // wait until products are loaded

  axios.get(`/api/bookings/${id}`).then((res) => {
    const data = res.data;

    // find product from DB
    const selected = products.find((p) => p.product_id == data.product_id);

    setFormData({
      member_id: data.member_id,
      username: data.username,
      outlet: selected?.outlet || data.outlet || "",
      product_id: data.product_id,
      product_name: selected?.name || data.product_name,
      quantity: data.quantity,
      status: data.status,
    });

    // filter products by outlet of the selected product
    const outletProducts = products.filter(
      (p) => p.outlet === (selected?.outlet || data.outlet)
    );
    setFilteredProducts(outletProducts);
  });
}, [id, products]);

// When product changes
const handleProductChange = (e) => {
  const selected = products.find((p) => p.product_id == e.target.value);

  setFormData((prev) => ({
    ...prev,
    product_id: selected?.product_id || "",
    product_name: selected?.name || "",
    outlet: selected?.outlet || "", // auto-fill outlet from product
  }));

  // update filtered products
  const outletProducts = products.filter((p) => p.outlet === selected?.outlet);
  setFilteredProducts(outletProducts);
};

// When outlet changes manually
const handleOutletChange = (e) => {
  const outlet = e.target.value;
  setFormData((prev) => ({
    ...prev,
    outlet,
  }));

  // show only products for this outlet
  const outletProducts = products.filter((p) => p.outlet === outlet);
  setFilteredProducts(outletProducts);
};


  // Member change
  const handleMemberChange = (e) => {
    const selected = members.find((m) => m.id == e.target.value);
    setFormData((prev) => ({
      ...prev,
      member_id: selected?.id || "",
      username: selected?.username || "",
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/bookings/${id}`, formData);
      navigate("/booking-list");
    } catch (err) {
      console.error("Error updating booking", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Edit Booking</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow max-w-lg"
      >
        {/* Member */}
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

        {/* Outlet */}
        <div className="mb-3">
          <label className="block">Outlet</label>
          <select
            className="border px-3 py-2 w-full"
            value={formData.outlet}
            onChange={handleOutletChange}
            required
          >
            <option value="">-- Select Outlet --</option>
            {[...new Set(products.map((p) => p.outlet))].map((outlet) => (
              <option key={outlet} value={outlet}>
                {outlet}
              </option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div className="mb-3">
          <label className="block">Product</label>
          <select
            className="border px-3 py-2 w-full"
            value={formData.product_id || ""}
            onChange={handleProductChange}
            required
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

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Update
          </button>
          <button
            type="button"
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={() => navigate("/booking-list")}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}

export default BookingEdit;
