import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ReservationAdd = ({ onSuccess }) => {
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [outlet, setOutlet] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [availableQuantities, setAvailableQuantities] = useState({});

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

  // 当预订日期变化时，获取可用数量
  useEffect(() => {
    const fetchAvailableQuantities = async () => {
      if (reserveDate && outlet) {
        try {
          const response = await axios.get(`/api/reservations/available-quantities`, {
            params: { date: reserveDate, outlet }
          });
          setAvailableQuantities(response.data);
        } catch (err) {
          console.error("Error fetching available quantities", err);
        }
      }
    };
    
    fetchAvailableQuantities();
  }, [reserveDate, outlet]);

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

    // 检查可用数量
    const availableQty = availableQuantities[selectedProduct.product_id] || selectedProduct.instock;
    if (quantity > availableQty) {
      alert(`Only ${availableQty} items available for ${selectedProduct.name} on ${reserveDate}`);
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

  // 获取产品的可用数量
  const getAvailableQuantity = (product) => {
    if (!reserveDate) return product.instock;
    return availableQuantities[product.product_id] || product.instock;
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

        {/* Reserve Date - 移到前面 */}
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
            disabled={!reserveDate}
          >
            <option value="">-- Select Product --</option>
            {filteredProducts.map((p) => {
              const availableQty = getAvailableQuantity(p);
              return (
                <option key={p.product_id} value={p.product_id} disabled={availableQty <= 0}>
                  {p.name} (Available: {availableQty}, In Stock: {p.instock})
                </option>
              );
            })}
          </select>
          {!reserveDate && (
            <p className="text-sm text-red-600 mt-1">Please select a date first</p>
          )}
        </div>

        {/* Quantity */}
        <div className="mb-3">
          <label className="block">Quantity</label>
          <input
            type="number"
            min="1"
            max={selectedProduct ? getAvailableQuantity(selectedProduct) : 1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border px-3 py-2 w-full"
          />
          {selectedProduct && (
            <p className="text-sm text-gray-600 mt-1">
              Max available: {getAvailableQuantity(selectedProduct)}
            </p>
          )}
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