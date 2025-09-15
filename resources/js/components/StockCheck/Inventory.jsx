// resources/js/components/Inventory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Inventory = () => {
  const [inventories, setInventories] = useState([]);

  const fetchInventories = async () => {
    try {
      const res = await axios.get("/api/inventories");
      setInventories(res.data);
    } catch (err) {
      console.error("Error fetching inventory", err);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  const getStatusClasses = (status) => {
    return status.toLowerCase() === "active"
      ? "text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm"
      : "text-red-600 bg-red-100 px-2 py-1 rounded-full text-sm";
  };

  // ✅ Group inventories by outlet
  const groupedByOutlet = inventories.reduce((groups, item) => {
    if (!groups[item.outlet]) groups[item.outlet] = [];
    groups[item.outlet].push(item);
    return groups;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Inventory</h2>
 <div className="grid grid-cols-1 gap-6">
      {Object.keys(groupedByOutlet).length > 0 ? (
        Object.keys(groupedByOutlet).map((outlet) => (
          <div key={outlet} className="mb-8">
            <h3 className="text-lg font-bold mb-2">{outlet}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border-b px-4 py-2 text-left">Product ID</th>
                    <th className="border-b px-4 py-2 text-left">Name</th>
                    <th className="border-b px-4 py-2 text-center">In Stock</th>
                    <th className="border-b px-4 py-2 text-center">Damage</th>
                    <th className="border-b px-4 py-2 text-center">Missing</th>
                    <th className="border-b px-4 py-2 text-center text-blue-600">Reserved</th>
                    <th className="border-b px-4 py-2 text-center text-blue-600">Rented</th>
                    {/* <th className="border-b px-4 py-2 text-center">Status</th> */}
                  </tr>
                </thead>
                <tbody>
                  {groupedByOutlet[outlet].map((item) => (
                    <tr key={item.id}>
                      <td className="border-b px-4 py-2">{item.product_id}</td>
                      <td className="border-b px-4 py-2">{item.name}</td>
                      <td className="border-b px-4 py-2 text-center">{item.instock}</td>
                      <td className="border-b px-4 py-2 text-center">{item.damage}</td>
                      <td className="border-b px-4 py-2 text-center">{item.missing}</td>
                      <td className="border-b px-4 py-2 text-center text-blue-600 ">[{item.reserved}]</td>
                      <td className="border-b px-4 py-2 text-center text-blue-600 ">{item.rented}</td>

                      {/* <td className="border-b px-4 py-2 text-center">
                        <span className={getStatusClasses(item.status)}>
                          {item.status}
                        </span>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p>No inventory records available</p>
      )}
    </div>
    </div>
  );
};

export default Inventory;
