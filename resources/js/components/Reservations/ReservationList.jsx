import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [filterText, setFilterText] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get("/api/reservations");
        setReservations(res.data);
      } catch (err) {
        console.error("Error fetching reservations", err);
      }
    };
    fetchReservations();
  }, []);

  const capitalizeWords = (str) =>
    str?.replace(/\b\w/g, (char) => char.toUpperCase()) ?? "";

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-orange-600 bg-orange-100 px-2 py-1 rounded-full text-sm";
      case "accepted":
        return "text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm";
      case "rejected":
        return "text-red-600 bg-red-100 px-2 py-1 rounded-full text-sm";
      default:
        return "text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-sm";
    }
  };

  // Filter reservations by username
  const filtered = reservations.filter((res) =>
    res.username?.toLowerCase().includes(filterText.toLowerCase())
  );

  // Group by outlet
  const groupedByOutlet = filtered.reduce((acc, res) => {
    if (!acc[res.outlet]) acc[res.outlet] = [];
    acc[res.outlet].push(res);
    return acc;
  }, {});
  
const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this reservation?");
  if (!confirmDelete) return;

  try {
    await axios.delete(`/api/reservations/${id}`);
    // Remove deleted reservation from state
    setReservations((prev) => prev.filter((res) => res.id !== id));
  } catch (error) {
    console.error("Error deleting reservation:", error);
    alert("Failed to delete reservation. Please try again.");
  }
};

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Reservation List</h2>
 <div className="grid grid-cols-1 gap-6">
        {/* <div className="bg-white p-6 rounded-lg shadow"></div> */}
          {/* Filter Input + Add Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <input
              type="text"
              placeholder="Search by username..."
              className="border border-gray-300 rounded px-4 py-2 w-full sm:w-64"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />

            <button
              className="bg-black text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => navigate("/reservation-add")} 
            >
              + Add Reservation
            </button>
          </div>


      {/* Reservation Groups */}
      {Object.keys(groupedByOutlet).length > 0 ? (
        Object.keys(groupedByOutlet).map((outlet) => (
          <div key={outlet} className="mb-8">
            <h3 className="text-md font-semibold mb-3">
              Outlet: {capitalizeWords(outlet)}
            </h3>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border-b px-4 py-2 text-left">ID</th>
                    <th className="border-b px-4 py-2 text-left">USERNAME</th>
                    <th className="border-b px-4 py-2 text-left">PRODUCT</th>
                    <th className="border-b px-4 py-2 text-left">QUANTITY</th>
                    <th className="border-b px-4 py-2 text-left">DATE</th>
                    <th className="border-b px-4 py-2 text-left">TIME</th>
                    <th className="border-b px-4 py-2 text-left">STATUS</th>
                    <th className="border-b px-4 py-2 text-left">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByOutlet[outlet].map((res) => (
                    <tr key={res.id}>
                      <td className="border-b px-4 py-2">{res.id}</td>
                      <td className="border-b px-4 py-2">{res.username}</td>
                      <td className="border-b px-4 py-2">{res.product_name}</td>
                      <td className="border-b px-4 py-2">{res.quantity}</td>
                      <td className="border-b px-4 py-2">{res.reserve_date}</td>
                      <td className="border-b px-4 py-2">{res.reserve_time}</td>
                      <td className="border-b px-4 py-2">
                        <span className={getStatusClasses(res.status)}>
                          {capitalizeWords(res.status)}
                        </span>
                      </td>
                      <td className="border-b px-4 py-2">
                        <div className="flex space-x-2">
                          {/* Edit Button */}
                          <button
                              disabled={
                                res.status === "accepted" &&
                                (res.booking_status === "checkout" || res.booking_status === "closed")
                              }
                              className={`${
                                res.status === "accepted" &&
                                (res.booking_status === "checkout" || res.booking_status === "closed")
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:text-black-800"
                              } text-black-600 border border-black-600 rounded-full p-2`}
                              onClick={() => navigate(`/reservation-edit/${res.id}`)}
                            >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-5 h-5" // Adjust size as needed
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                />
                              </svg>
                          </button>
                          {/* Delete Button */}
                            <button
                              className="text-black-600 hover:text-black-800 border border-black-600 hover:border-black-600 rounded-full p-2"
                              onClick={() => handleDelete(res.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center mt-6">No reservations available</p>
      )}
    </div>
    </div>
  );
};

export default ReservationList;
