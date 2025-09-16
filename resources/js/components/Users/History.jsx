import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const History = () => {
    const [bookings, setBookings] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [bookingPage, setBookingPage] = useState(1);
    const [reservationPage, setReservationPage] = useState(1);
    const itemsPerPage = 5;

    const navigate = useNavigate();
    const member = JSON.parse(localStorage.getItem("member"));

    useEffect(() => {
        if (!member) {
            navigate("/");
            return;
        }

        const fetchData = async () => {
            try {
                const bookingsRes = await axios.get(
                    `/api/my-bookings?member_id=${member.id}`,
                );
                setBookings(bookingsRes.data);

                const reservationsRes = await axios.get(
                    `/api/my-reservations?member_id=${member.id}`,
                );
                setReservations(reservationsRes.data);
            } catch (err) {
                console.error("Error fetching data", err);
            }
        };

        fetchData();
    }, [navigate, member?.id]);

    const handleCheckout = async (booking) => {
        try {
            await axios.post("/api/bookings/checkout", {
                member_id: booking.member_id,
                username: booking.username,
                product_id: booking.product_id,
                product_name: booking.product_name,
                quantity: booking.quantity,
                reservation_id: booking.reservation_id,
            });

            alert("Checked out successfully!");

            // Refresh
            const bookingsRes = await axios.get(
                `/api/my-bookings?member_id=${member.id}`,
            );
            setBookings(bookingsRes.data);

            const reservationsRes = await axios.get(
                `/api/my-reservations?member_id=${member.id}`,
            );
            setReservations(reservationsRes.data);

        } catch (err) {
            alert("Checkout failed");
            console.error(err);
        }
    };

    const handleCheckin = async (bookingId) => {
        try {
            await axios.put(`/api/bookings/${bookingId}/checkin`);
            alert("Checked in successfully!");

            // Refresh
            const bookingsRes = await axios.get(
                `/api/my-bookings?member_id=${member.id}`,
            );
            setBookings(bookingsRes.data);
        } catch (err) {
            alert("Check-in failed");
            console.error(err);
        }
    };

    // ✅ Pagination
    const paginatedBookings = bookings.slice(
        (bookingPage - 1) * itemsPerPage,
        bookingPage * itemsPerPage,
    );
    const paginatedReservations = reservations.slice(
        (reservationPage - 1) * itemsPerPage,
        reservationPage * itemsPerPage,
    );

    const totalBookingPages = Math.ceil(bookings.length / itemsPerPage);
    const totalReservationPages = Math.ceil(reservations.length / itemsPerPage);

    const statusColor = (status) => {
        switch (status) {
            case "accepted":
                return "bg-green-100 text-green-700 px-2 py-1 rounded-full";
            case "checkout":
                return "bg-blue-100 text-blue-700 px-2 py-1 rounded-full";
            case "closed":
                return "bg-gray-200 text-gray-700 px-2 py-1 rounded-full";
            case "pending":
                return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full";
            case "rejected":
                return "bg-red-100 text-red-700 px-2 py-1 rounded-full";
            default:
                return "bg-gray-100 text-gray-700 px-2 py-1 rounded-full";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 🔹 Top Nav */}
            <nav className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
                <h1
                    onClick={() => navigate("/")}
                    className="text-lg font-semibold cursor-pointer"
                >
                    Sports Inventory
                </h1>
            </nav>

            <div className="p-6 max-w-5xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6">History</h2>

                {/* 🔹 Bookings Section */}
                <h3 className="text-xl font-semibold mb-4">Booking History</h3>
                {bookings.length === 0 ? (
                    <p>No bookings found.</p>
                ) : (
                    <div>
                        <div className="space-y-6 mb-6">
                            {paginatedBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="flex bg-white shadow-md rounded-lg overflow-hidden border"
                                >
                                    {/* Image */}
                                    <div className="w-1/3 bg-gray-100 flex items-center justify-center p-4">
                                        {booking.product_image ? (
                                            <img
                                                src={
                                                    booking.product_image.startsWith(
                                                        "http",
                                                    )
                                                        ? booking.product_image
                                                        : `/storage/${booking.product_image}`
                                                }
                                                alt={booking.product_name}
                                                className="h-40 object-contain"
                                            />
                                        ) : (
                                            <span className="text-gray-400">
                                                No Image
                                            </span>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="w-2/3 p-4 space-y-2">
                                        <h3 className="text-xl font-bold">
                                            {booking.product_name}
                                        </h3>
                                        <p>
                                            <strong>Product ID:</strong>{" "}
                                            {booking.product_id}
                                        </p>
                                        <p>
                                            <strong>Quantity:</strong>{" "}
                                            {booking.quantity}
                                        </p>
                                        <p>
                                            <strong>Status:</strong>{" "}
                                            <span
                                                className={`capitalize px-2 py-1 rounded text-sm font-semibold ${statusColor(
                                                    booking.status,
                                                )}`}
                                            >
                                                {booking.status}
                                            </span>
                                        </p>
                                        {booking.reservation_id && (
                                            <>
                                                <p>
                                                    <strong>
                                                        Reserve Date:
                                                    </strong>{" "}
                                                    {booking.reserve_date
                                                        ? booking.reserve_date
                                                        : "-"}
                                                </p>
                                                <p>
                                                    <strong>
                                                        Reserve Time:
                                                    </strong>{" "}
                                                    {booking.reserve_time
                                                        ? booking.reserve_time
                                                        : "-"}
                                                </p>
                                            </>
                                        )}

                                        <p>
                                            <strong>Checkout At:</strong>{" "}
                                            {booking.checkout_at
                                                ? new Date(
                                                      booking.checkout_at,
                                                  ).toLocaleString()
                                                : "-"}
                                        </p>
                                        <p>
                                            <strong>Checkin At:</strong>{" "}
                                            {booking.checkin_at
                                                ? new Date(
                                                      booking.checkin_at,
                                                  ).toLocaleString()
                                                : "-"}
                                        </p>
                                        {booking.reservation_id && (
                                            <p className="text-sm text-blue-600 font-semibold">
                                                Reservation-based Booking
                                            </p>
                                        )}

                                        {/* Buttons */}
                                        {booking.reservation_id && (
                                            <div className="flex space-x-3 mt-4">
                                                {booking.status ===
                                                    "accepted" && (
                                                    <button
                                                        onClick={() =>
                                                            handleCheckout(
                                                                booking,
                                                            )
                                                        }
                                                        className="bg-green-600 text-white px-4 py-2 rounded"
                                                    >
                                                        Check-Out
                                                    </button>
                                                )}
                                                {booking.status ===
                                                    "checkout" && (
                                                    <button
                                                        onClick={() =>
                                                            handleCheckin(
                                                                booking.id,
                                                            )
                                                        }
                                                        className="bg-blue-600 text-white px-4 py-2 rounded"
                                                    >
                                                        Check-In
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center space-x-2">
                            <button
                                disabled={bookingPage === 1}
                                onClick={() => setBookingPage((p) => p - 1)}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span>
                                Page {bookingPage} of {totalBookingPages}
                            </span>
                            <button
                                disabled={bookingPage === totalBookingPages}
                                onClick={() => setBookingPage((p) => p + 1)}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* 🔹 Reservations Section */}
                <h3 className="text-xl font-semibold mt-10 mb-4">
                    Reservations
                </h3>
                {reservations.length === 0 ? (
                    <p>No reservations found.</p>
                ) : (
                    <div>
                        <div className="space-y-6 mb-6">
                            {paginatedReservations.map((res) => (
                                <div
                                    key={res.id}
                                    className="flex bg-white shadow-md rounded-lg overflow-hidden border"
                                >
                                    {/* Image */}
                                    <div className="w-1/3 bg-gray-100 flex items-center justify-center p-4">
                                        {res.product_image ? (
                                            <img
                                                src={
                                                    res.product_image.startsWith(
                                                        "http",
                                                    )
                                                        ? res.product_image
                                                        : `/storage/${res.product_image}`
                                                }
                                            />
                                        ) : (
                                            <span className="text-gray-400">
                                                No Image
                                            </span>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="w-2/3 p-4 space-y-2">
                                        <h3 className="text-xl font-bold">
                                            {res.product_name}
                                        </h3>
                                        <p>
                                            <strong>Product ID:</strong>{" "}
                                            {res.product_id}
                                        </p>
                                        <p>
                                            <strong>Quantity:</strong>{" "}
                                            {res.quantity}
                                        </p>
                                        <p>
                                            <strong>Status:</strong>{" "}
                                            <span
                                                className={`capitalize px-2 py-1 rounded text-sm font-semibold ${statusColor(
                                                    res.status,
                                                )}`}
                                            >
                                                {res.status}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Reserve Date:</strong>{" "}
                                            {res.reserve_date}
                                        </p>
                                        <p>
                                            <strong>Reserve Time:</strong>{" "}
                                            {res.reserve_time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center space-x-2">
                            <button
                                disabled={reservationPage === 1}
                                onClick={() => setReservationPage((p) => p - 1)}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span>
                                Page {reservationPage} of{" "}
                                {totalReservationPages}
                            </span>
                            <button
                                disabled={
                                    reservationPage === totalReservationPages
                                }
                                onClick={() => setReservationPage((p) => p + 1)}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
