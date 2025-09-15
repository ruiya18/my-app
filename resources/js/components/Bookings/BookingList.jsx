import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [filterText, setFilterText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/bookings").then((res) => {
      setBookings(res.data);
    });
  }, []);

  const filteredBookings = bookings.filter((b) =>
    b.username?.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleDelete = async (bookingId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
  if (!confirmDelete) return;

  try {
    await axios.delete(`/api/bookings/${bookingId}`);
    // Remove the deleted booking from the list
    setBookings((prevBookings) => prevBookings.filter((b) => b.id !== bookingId));
  } catch (error) {
    console.error("Failed to delete booking:", error);
    alert("An error occurred while deleting the booking.");
  }
};

const formatTime = (timeString) => {
   if (!timeString) return "";
  const date = new Date(timeString);

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHour = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return (
    <>
      {`${day}-${month}-${year}`}
      <br />
      {`${formattedHour}:${formattedMinutes} ${ampm}`}
    </>
  );
};

  const capitalizeWords = (str) =>
    str?.replace(/\b\w/g, (char) => char.toUpperCase()) ?? "";


  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs";
      case "checkin":
        return "text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs";
      case "checkout":
        return "text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs";
      default:
        return "text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Booking List</h2>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          {/* Search filter */}
             <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <input
              type="text"
              placeholder="Search members..."
              className="border border-gray-300 rounded px-4 py-2 w-full sm:w-64"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1);
              }}
            />

            <button
              className="bg-black text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => navigate('/booking-add')}
            >
              + Add Booking
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2 text-left">USERNAME</th>
                  <th className="border-b px-4 py-2 text-left">
                    RESERVATION ID
                  </th>
                  <th className="border-b px-4 py-2 text-left">PRODUCT ID</th>
                  <th className="border-b px-4 py-2 text-left">PRODUCT NAME</th>
                  <th className="border-b px-4 py-2 text-left">QTY</th>
                  <th className="border-b px-4 py-2 text-left">CHECK-OUT</th>
                  <th className="border-b px-4 py-2 text-left">CHECK-IN</th>
                  <th className="border-b px-4 py-2 text-left">STATUS</th>
                  <th className="border-b px-4 py-2 text-left">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="border-b px-4 py-2">{b.username}</td>
                      <td className="border-b px-4 py-2">
                        {b.reservation_id ?? "-"}
                      </td>
                      <td className="border-b px-4 py-2">{b.product_id}</td>
                      <td className="border-b px-4 py-2">{b.product_name}</td>
                      <td className="border-b px-4 py-2">{b.quantity}</td>
                      <td className="border-b px-4 py-2">{b.checkout_at ? formatTime(b.checkout_at) : "-"} </td>
                      <td className="border-b px-4 py-2">{b.checkin_at ? formatTime(b.checkin_at) : "-"}</td>
                      <td className="border-b px-4 py-2"><span className={getStatusClasses(b.status)}>{capitalizeWords(b.status)}
                        </span>
                      </td>
                      <td className="border-b px-4 py-2">
                       <div className="flex space-x-2">
                          {/* Edit Button */}
                          <button
                            className="text-black-600 hover:text-black-800 border border-black-600 hover:border-black-600 rounded-full p-2"
                            onClick={() => navigate(`/booking-edit/${b.id}`)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-5 h-5"
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
                            onClick={() => handleDelete(b.id)}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingList;
