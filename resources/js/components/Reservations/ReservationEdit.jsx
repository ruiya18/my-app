import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ReservationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveTime, setReserveTime] = useState("");
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await axios.get(`/api/reservations`);
        const found = res.data.find((r) => r.id == id);
        if (found) {
          setReservation(found);
          setQuantity(found.quantity);
          setReserveDate(found.reserve_date);
          setReserveTime(found.reserve_time);
          setStatus(found.status);
        }
      } catch (err) {
        console.error("Error fetching reservation", err);
      }
    };
    fetchReservation();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (status === "accepted") {
        // 🔹 If status is accepted → call special accept endpoint
        await axios.post(`/api/reservations/${id}/accept`);
      } else {
        // 🔹 Otherwise just update normally
        await axios.put(`/api/reservations/${id}`, {
          quantity,
          reserve_date: reserveDate,
          reserve_time: reserveTime,
          status,
        });
      }

      alert("Reservation updated!");
      navigate("/reservation-list");
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  if (!reservation) {
    return <p className="p-6">Loading reservation...</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-lg font-semibold mb-4">Edit Reservation</h2>
      <form onSubmit={handleUpdate}>
        <p>
          <strong>User:</strong> {reservation.username}
        </p>
        <p>
          <strong>Product:</strong> {reservation.product_name} (
          {reservation.outlet})
        </p>

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

        <div className="mb-3">
          <label className="block">Reserve Date</label>
          <input
            type="date"
            value={reserveDate}
            onChange={(e) => setReserveDate(e.target.value)}
            className="border px-3 py-2 w-full"
          />
        </div>

        <div className="mb-3">
          <label className="block">Reserve Time</label>
          <input
            type="time"
            value={reserveTime}
            onChange={(e) => setReserveTime(e.target.value)}
            className="border px-3 py-2 w-full"
          />
        </div>

        <div className="mb-3">
          <label className="block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-3 py-2 w-full"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Update Reservation
        </button>
      </form>
    </div>
  );
};

export default ReservationEdit;
