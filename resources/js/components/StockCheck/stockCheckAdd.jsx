// resources/js/components/StockCheckAdd.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StockCheckAdd = () => {
  const [date, setDate] = useState("");
  const [outlet, setOutlet] = useState("");
  const [products, setProducts] = useState([]);
  const [stockData, setStockData] = useState({});
  const navigate = useNavigate();

  // Fetch products by outlet
  const fetchProducts = async (selectedOutlet) => {
    try {
      const res = await axios.get(`/api/products?outlet=${selectedOutlet}`);
      if (Array.isArray(res.data)) {
        setProducts(res.data);

        // Initialize stockData
        const initialData = {};
        res.data.forEach((p) => {
          initialData[p.product_id] = {
            instock: 0,
            damage: 0,
            missing: 0,
          };
        });
        setStockData(initialData);
      }
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleInputChange = (productId, field, value) => {
    setStockData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation: instock + damage + missing must equal product.quantity
    for (let p of products) {
      const entry = stockData[p.product_id];
      const total = (entry?.instock || 0) + (entry?.damage || 0) + (entry?.missing || 0);

      if (total !== p.quantity) {
        alert(
          `Quantity mismatch for product "${p.name}" (ID: ${p.product_id}).\n` +
          `Expected total: ${p.quantity}, but got: ${total}`
        );
        return; // stop saving
      }
    }

    try {
      const payload = {
        date,
        outlet,
        items: stockData,
      };
      await axios.post("/api/stockchecks", payload);
      alert("Stock check saved successfully!");
      navigate("/stockcheck-list");
    } catch (err) {
      console.error("Error saving stock check", err);
      alert("Failed to save stock check.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Inventory Stock Check</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date + Outlet */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">Outlet</label>
            <select
              value={outlet}
              onChange={(e) => {
                setOutlet(e.target.value);
                if (e.target.value) fetchProducts(e.target.value);
              }}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select Outlet --</option>
              <option value="QM ROOM">QM ROOM</option>
              <option value="UP STORE">UP STORE</option>
              <option value="DOWN STORE">DOWN STORE</option>
            </select>
          </div>
        </div>

        {/* Product Table */}
        {products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2 text-left">Product ID</th>
                  <th className="border-b px-4 py-2 text-left">Name</th>
                  <th className="border-b px-4 py-2 text-center">Original Qty</th>
                  <th className="border-b px-4 py-2 text-center">In Stock</th>
                  <th className="border-b px-4 py-2 text-center">Damage</th>
                  <th className="border-b px-4 py-2 text-center">Missing</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id}>
                    <td className="border-b px-4 py-2">{product.product_id}</td>
                    <td className="border-b px-4 py-2">{product.name}</td>
                    <td className="border-b px-4 py-2 text-center">{product.quantity}</td>
                    <td className="border-b px-4 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={stockData[product.product_id]?.instock || 0}
                        onChange={(e) =>
                          handleInputChange(product.product_id, "instock", e.target.value)
                        }
                        className="w-20 border px-2 py-1 rounded text-center"
                      />
                    </td>
                    <td className="border-b px-4 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={stockData[product.product_id]?.damage || 0}
                        onChange={(e) =>
                          handleInputChange(product.product_id, "damage", e.target.value)
                        }
                        className="w-20 border px-2 py-1 rounded text-center"
                      />
                    </td>
                    <td className="border-b px-4 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={stockData[product.product_id]?.missing || 0}
                        onChange={(e) =>
                          handleInputChange(product.product_id, "missing", e.target.value)
                        }
                        className="w-20 border px-2 py-1 rounded text-center"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Save Stock Check
        </button>
      </form>
    </div>
  );
};

export default StockCheckAdd;
