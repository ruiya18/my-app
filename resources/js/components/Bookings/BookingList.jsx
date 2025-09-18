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

            {/* <button
              className="bg-black text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => navigate('/booking-add')}
            >
              + Add Booking
            </button> */}
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
