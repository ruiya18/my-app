import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StockCheckList = () => {
    const [stockChecks, setStockChecks] = useState([]);
    const [date, setDate] = useState("");
    const [outlet, setOutlet] = useState("");
    const [currentPages, setCurrentPages] = useState({}); // Object to track current page for each outlet
    const [filterText, setFilterText] = useState("");
    const itemsPerPage = 10;
    const navigate = useNavigate();

    const fetchStockChecks = async () => {
        if (!date) {
            alert("Please select a date");
            return;
        }

        try {
            const params = { date };
            if (outlet) params.outlet = outlet;

            const res = await axios.get("/api/stockchecks", { params });
            setStockChecks(res.data);

            // Initialize current pages for each outlet
            const outlets = [...new Set(res.data.map((item) => item.outlet))];
            const initialPages = {};
            outlets.forEach((outlet) => {
                initialPages[outlet] = 1;
            });
            setCurrentPages(initialPages);
        } catch (err) {
            console.error("Error fetching stock checks", err);
        }
    };

    const groupedByOutlet = stockChecks.reduce((acc, check) => {
        if (!acc[check.outlet]) acc[check.outlet] = [];
        acc[check.outlet].push(check);
        return acc;
    }, {});

    // Handle page change for a specific outlet
    const handlePageChange = (outlet, pageNumber) => {
        setCurrentPages((prev) => ({
            ...prev,
            [outlet]: pageNumber,
        }));
    };

    return (
        <div className="p-6 max-w-6xl mx-auto bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-6">Stock Check Records</h2>

            <div className="flex flex-col sm:flex-row justify-end items-center mb-6 gap-4">
                <button
                    className="bg-black text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    onClick={() => navigate("/stockcheck-add")}
                >
                    + Stock Check
                </button>
            </div>

            {/* 🔎 Filter Form */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <label className="block text-sm font-medium">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        required
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium">Outlet</label>
                    <select
                        value={outlet}
                        onChange={(e) => setOutlet(e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                    >
                        <option value="">All Outlets</option>
                        <option value="QM ROOM">QM ROOM</option>
                        <option value="UP STORE">UP STORE</option>
                        <option value="DOWN STORE">DOWN STORE</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        onClick={fetchStockChecks}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* 📝 Stock Check Table */}
            {Object.keys(groupedByOutlet).length === 0 ? (
                <p>No stock check records available. Please search above.</p>
            ) : (
                Object.entries(groupedByOutlet).map(([outlet, checks]) => {
                    // Flatten all items from all checks for this outlet
                    const allItems = checks.flatMap((check) =>
                        check.items.map((item) => ({
                            ...item,
                            date: check.date,
                            checkId: check.id,
                        })),
                    );

                    const currentPage = currentPages[outlet] || 1;

                    // Pagination logic for this outlet
                    const totalPages = Math.ceil(
                        allItems.length / itemsPerPage,
                    );
                    const indexOfLastItem = currentPage * itemsPerPage;
                    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                    const currentItems = allItems.slice(
                        indexOfFirstItem,
                        indexOfLastItem,
                    );

                    return (
                        <div key={outlet} className="mb-10">
                            <h3 className="text-lg font-bold mb-4">{outlet}</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border-b px-4 py-2 text-left">
                                                Date
                                            </th>
                                            <th className="border-b px-4 py-2 text-left">
                                                Product
                                            </th>
                                            <th className="border-b px-4 py-2 text-center">
                                                In Stock
                                            </th>
                                            <th className="border-b px-4 py-2 text-center">
                                                Damage
                                            </th>
                                            <th className="border-b px-4 py-2 text-center">
                                                Missing
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((item, i) => (
                                            <tr key={`${item.checkId}-${i}`}>
                                                <td className="border-b px-4 py-2">
                                                    {item.date}
                                                </td>
                                                <td className="border-b px-4 py-2">
                                                    {item.name}
                                                </td>
                                                <td className="border-b px-4 py-2 text-center">
                                                    {item.instock}
                                                </td>
                                                <td className="border-b px-4 py-2 text-center">
                                                    {item.damage}
                                                </td>
                                                <td className="border-b px-4 py-2 text-center">
                                                    {item.missing}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination for this outlet */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-4 pb-4 space-x-2">
                                        {[...Array(totalPages)].map(
                                            (_, index) => {
                                                const pageNumber = index + 1;
                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() =>
                                                            handlePageChange(
                                                                outlet,
                                                                pageNumber,
                                                            )
                                                        }
                                                        className={`px-3 py-1 rounded border ${
                                                            currentPage ===
                                                            pageNumber
                                                                ? "bg-black text-white"
                                                                : "bg-white text-black"
                                                        }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default StockCheckList;
