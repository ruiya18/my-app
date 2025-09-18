import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ReservationEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reserveDate, setReserveDate] = useState("");
  const [reserveTime, setReserveTime] = useState("");
  const [status, setStatus] = useState("pending");
  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(true); // For initial loading
  const [isUpdating, setIsUpdating] = useState(false); // For update operations

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`/api/reservations`);
        const found = res.data.find((r) => r.id == id);
        if (found) {
          setReservation(found);
          setQuantity(found.quantity);
          setReserveDate(found.reserve_date);
          setReserveTime(found.reserve_time);
          setStatus(found.status);
          setOriginalData(found);

          const availableRes = await axios.get(`/api/reservations/available-quantities`, {
            params: { 
              date: found.reserve_date, 
              outlet: found.outlet,
              excludeReservationId: found.id
            }
          });
          setAvailableQuantity(availableRes.data[found.product_id] || 0);
        }
      } catch (err) {
        console.error("Error fetching reservation", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservation();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (status === "pending" && quantity > availableQuantity + reservation.quantity) {
      alert(`Only ${availableQuantity + reservation.quantity} items available for this product on ${reserveDate}`);
      return;
    }

    try {
      setIsUpdating(true);
      
      if (status === "accepted") {
        await axios.post(`/api/reservations/${id}/accept`);
      } else if (status === "rejected") {
        await axios.post(`/api/reservations/${id}/reject`);
      } else {
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
      alert("Update failed. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white shadow rounded flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reservation details...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
        <p className="text-red-500">Reservation not found.</p>
        <button
          onClick={() => navigate("/reservation-list")}
          className="mt-4 bg-black hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Back to List
        </button>
      </div>
    );
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
            max={status === "pending" ? availableQuantity + reservation.quantity : quantity}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border px-3 py-2 w-full"
            disabled={status !== "pending" || isUpdating}
          />
          {status === "pending" && (
            <p className="text-sm text-gray-600 mt-1">
              Max available: {availableQuantity + reservation.quantity}
            </p>
          )}
        </div>

        <div className="mb-3">
          <label className="block">Reserve Date</label>
          <input
            type="date"
            value={reserveDate}
            onChange={(e) => setReserveDate(e.target.value)}
            className="border px-3 py-2 w-full"
            disabled={status !== "pending" || isUpdating}
          />
        </div>

        <div className="mb-3">
          <label className="block">Reserve Time</label>
          <input
            type="time"
            value={reserveTime}
            onChange={(e) => setReserveTime(e.target.value)}
            className="border px-3 py-2 w-full"
            disabled={status !== "pending" || isUpdating}
          />
        </div>

        <div className="mb-3">
          <label className="block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-3 py-2 w-full"
            disabled={isUpdating}
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {originalData.status == "pending" && (
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              "Update Reservation"
            )}
          </button>
        )}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => navigate("/reservation-list")}
            className="bg-black hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={isUpdating}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationEdit;