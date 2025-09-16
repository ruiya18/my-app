import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Homepage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const member = localStorage.getItem("member");

        if (!member) {
            navigate(`/?redirect=/home/${productId}`);
            return;
        }

        const fetchProduct = async () => {
            try {
                const res = await axios.get(`/api/inventories/${productId}`);
                setProduct(res.data);
            } catch (err) {
                console.error("Error fetching product", err);
            }
        };

        if (productId) fetchProduct();
    }, [productId, navigate]);

    if (!product) {
        return (
            <div className="p-6 text-center text-lg">
                <p>Loading product data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-base sm:text-lg">
            {/* 🔹 Navigation Bar */}
            <nav className="bg-blue-600 text-white px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                <h1
                    onClick={() => navigate("/")}
                    className="text-2xl font-bold cursor-pointer text-center sm:text-left"
                >
                    Sports Inventory
                </h1>
                <div className="flex gap-4 text-lg">
                    <button
                        onClick={() => navigate(`/history`)}
                        className="hover:underline"
                    >
                        History
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem("member");
                            navigate("/");
                        }}
                        className="hover:underline"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* 🔹 Product Details (Centered on Mobile) */}
            <div className="flex justify-center px-4 py-6">
                <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-4xl font-semibold mb-6 text-center">
                        Product Overview
                    </h2>

                    <div className="border p-4 rounded-md mb-6 text-lg text-center sm:text-left text-3xl">
                        <p>
                            <strong>Product ID:</strong> {product.product_id}
                        </p>
                        <p>
                            <strong>Name:</strong> {product.name}
                        </p>
                        <p>
                            <strong>Outlet:</strong> {product.outlet}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() =>
                                navigate(
                                    `/member-booking/${product.product_id}`,
                                )
                            }
                            className="bg-blue-600 text-white px-4 py-3 rounded w-full sm:w-1/2 text-lg font-medium"
                        >
                            Booking
                        </button>
                        <button
                            onClick={() =>
                                navigate(`/reservation/${product.product_id}`)
                            }
                            className="bg-green-600 text-white px-4 py-3 rounded w-full sm:w-1/2 text-lg font-medium"
                        >
                            Reservation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;
