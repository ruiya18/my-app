import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ReservationAdd = ({ onSuccess }) => {
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [outlet, setOutlet] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveTime, setReserveTime] = useState("");

  const navigate = useNavigate();

  // Fetch members + products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, productsRes] = await Promise.all([
          axios.get("/api/members"),
          axios.get("/api/inventories"),
        ]);
        setMembers(membersRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, []);

  // Filter products when outlet changes
  useEffect(() => {
    if (outlet) {
      setFilteredProducts(products.filter((p) => p.outlet === outlet));
      setSelectedProduct(null); 
    }
  }, [outlet, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMember) {
      alert("Please select a member!");
      return;
    }

    if (!selectedProduct) {
      alert("Please select a product!");
      return;
    }

    try {
      await axios.post("/api/reservations", {
        member_id: selectedMember.id,
        username: selectedMember.username,
        product_id: selectedProduct.product_id,
        product_name: selectedProduct.name,
        outlet,
        quantity,
        reserve_date: reserveDate,
        reserve_time: reserveTime,
      });

      alert("Reservation added successfully!");
      if (onSuccess) onSuccess();
      navigate("/reservation-list");
    } catch (err) {
      console.error("Add reservation failed", err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-lg font-semibold mb-4">Add Reservation</h2>
      <form onSubmit={handleSubmit}>
        {/* Select Member */}
        <div className="mb-3">
          <label className="block">Member</label>
          <select
            className="border px-3 py-2 w-full"
            value={selectedMember?.id || ""}
            onChange={(e) =>
              setSelectedMember(members.find((m) => m.id == e.target.value))
            }
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
            value={outlet}
            onChange={(e) => setOutlet(e.target.value)}
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
          >
            <option value="">-- Select Product --</option>
            {filteredProducts.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.name} (Qty: {p.instock})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="mb-3">
          <label className="block">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border px-3 py-2 w-full"
          />
        </div>

        {/* Reserve Date */}
        <div className="mb-3">
          <label className="block">Reserve Date</label>
          <input
            type="date"
            value={reserveDate}
            onChange={(e) => setReserveDate(e.target.value)}
            className="border px-3 py-2 w-full"
            required
          />
        </div>

        {/* Reserve Time */}
        <div className="mb-3">
          <label className="block">Reserve Time</label>
          <input
            type="time"
            value={reserveTime}
            onChange={(e) => setReserveTime(e.target.value)}
            className="border px-3 py-2 w-full"
            required
          />
        </div>

            <div className="flex justify-end">
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Submit
        </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationAdd;
