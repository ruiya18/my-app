// resources/js/components/StockCheckList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const StockCheckList = () => {
  const [stockChecks, setStockChecks] = useState([]);

  const fetchStockChecks = async () => {
    try {
      const res = await axios.get("/api/stockchecks");
      setStockChecks(res.data);
    } catch (err) {
      console.error("Error fetching stock checks", err);
    }
  };

  useEffect(() => {
    fetchStockChecks();
  }, []);

  // Group stock checks by outlet
  const groupedByOutlet = stockChecks.reduce((acc, check) => {
    if (!acc[check.outlet]) acc[check.outlet] = [];
    acc[check.outlet].push(check);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-6">Stock Check Records</h2>

      {Object.keys(groupedByOutlet).length === 0 ? (
        <p>No stock check records available.</p>
      ) : (
        Object.entries(groupedByOutlet).map(([outlet, checks]) => (
          <div key={outlet} className="mb-10">
            <h3 className="text-lg font-bold mb-4">{outlet}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border-b px-4 py-2 text-left">Date</th>
                    <th className="border-b px-4 py-2 text-left">Product</th>
                    <th className="border-b px-4 py-2 text-center">In Stock</th>
                    <th className="border-b px-4 py-2 text-center">Damage</th>
                    <th className="border-b px-4 py-2 text-center">Missing</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((check) =>
                    check.items.map((item, i) => (
                      <tr key={`${check.id}-${i}`}>
                        <td className="border-b px-4 py-2">{check.date}</td>
                        <td className="border-b px-4 py-2">{item.name}</td>
                        <td className="border-b px-4 py-2 text-center">{item.instock}</td>
                        <td className="border-b px-4 py-2 text-center">{item.damage}</td>
                        <td className="border-b px-4 py-2 text-center">{item.missing}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StockCheckList;
