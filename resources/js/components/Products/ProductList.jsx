import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";

const ITEMS_PER_PAGE = 10;

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [pages, setPages] = useState({}); // track current page per outlet
    const [selectedQR, setSelectedQR] = useState(null); // popup QR
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;

    const fetchProducts = async () => {
        try {
            const res = await axios.get("/api/products");
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching products", err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const capitalizeWords = (str) =>
        str.replace(/\b\w/g, (char) => char.toUpperCase());

    const getStatusClasses = (status) => {
        return status.toLowerCase() === "active"
            ? "text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm"
            : status.toLowerCase() === "inactive"
            ? "text-red-600 bg-red-100 px-2 py-1 rounded-full text-sm"
            : "text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-sm";
    };

    const handlePrint = async (product) => {
        const copies = parseInt(
            prompt("Enter number of QR codes to print:", "1"),
            10,
        );
        if (isNaN(copies) || copies < 1) return;

        try {
            // Generate QR code as Data URL
            const qrDataUrl = await QRCode.toDataURL(
                product.product_id.toString(),
                { width: 150 },
            );

            // Repeat based on quantity
            const qrHTML = Array.from({ length: copies })
                .map(
                    () => `
        <div style="display:inline-block; margin:10px; text-align:center">
          <img src="${qrDataUrl}" width="150" height="150"/>
          <p style="font-size:12px; margin-top:4px">${product.name}</p>
        </div>`,
                )
                .join("");

            const printWindow = window.open(
                "",
                "_blank",
                "width=600,height=600",
            );
            printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Codes</title>
          </head>
          <body>
            <h3>QR Codes for ${product.name}</h3>
            ${qrHTML}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = () => window.close();
              }
            </script>
          </body>
        </html>
      `);
            printWindow.document.close();
        } catch (err) {
            console.error("Failed to generate QR code", err);
        }
    };

    // Filter products
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(filterText.toLowerCase()),
    );

    // Group by outlet
    const grouped = filteredProducts.reduce((acc, product) => {
        if (!acc[product.outlet]) acc[product.outlet] = [];
        acc[product.outlet].push(product);
        return acc;
    }, {});

    // Delete product
    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?"))
            return;

        try {
            await axios.delete(`/api/products/${productId}`);
            setProducts(products.filter((p) => p.product_id !== productId));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete product.");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Product List</h2>
            <div className="grid grid-cols-1 gap-6">
                {/* Filter + Add Button */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="border border-gray-300 rounded px-4 py-2 w-full sm:w-64"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />

                    {role === "administrator" && (
                        <button
                            className="bg-black text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            onClick={() => navigate("/product-add")}
                        >
                            + Add Product
                        </button>
                    )}
                </div>

                {/* Loop through each outlet */}
                {Object.keys(grouped).length > 0 ? (
                    Object.keys(grouped).map((outlet) => {
                        const page = pages[outlet] || 1;
                        const startIndex = (page - 1) * ITEMS_PER_PAGE;
                        const endIndex = startIndex + ITEMS_PER_PAGE;
                        const totalPages = Math.ceil(
                            grouped[outlet].length / ITEMS_PER_PAGE,
                        );
                        const pageProducts = grouped[outlet].slice(
                            startIndex,
                            endIndex,
                        );

                        return (
                            <div key={outlet} className="mb-8">
                                <h3 className="text-md font-semibold mb-3">
                                    Outlet: {capitalizeWords(outlet)}
                                </h3>

                                <div className="overflow-x-auto bg-white rounded-lg shadow">
                                    <table className="min-w-full table-auto border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="border-b px-4 py-2">
                                                    PRODUCT ID
                                                </th>
                                                <th className="border-b px-4 py-2">
                                                    NAME
                                                </th>
                                                <th className="border-b px-4 py-2">
                                                    QUANTITY
                                                </th>
                                                <th className="border-b px-4 py-2">
                                                    QR CODE
                                                </th>
                                                <th className="border-b px-4 py-2">
                                                    STATUS
                                                </th>
                                                <th className="border-b px-4 py-2">
                                                    ACTIONS
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pageProducts.map((product) => (
                                                <tr key={product.product_id}>
                                                    <td className="border-b px-4 py-2 text-center">
                                                        {product.product_id}
                                                    </td>
                                                    <td className="border-b px-4 py-2 text-center">
                                                        {product.name}
                                                    </td>
                                                    <td className="border-b px-4 py-2 text-center">
                                                        {product.quantity}
                                                    </td>
                                                    <td className="border-b px-4 py-2 flex justify-center">
                                                        <div
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                setSelectedQR({
                                                                    value: `${window.location.origin}/home/${product.product_id}`,
                                                                    name: product.name,
                                                                })
                                                            }
                                                        >
                                                            <QRCodeSVG
                                                                value={`${window.location.origin}/home/${product.product_id}`}
                                                                size={48}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="border-b px-4 py-2 text-center">
                                                        <span
                                                            className={getStatusClasses(
                                                                product.status,
                                                            )}
                                                        >
                                                            {capitalizeWords(
                                                                product.status,
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="border-b px-4 py-2 ">
                                                        <div className="flex space-x-2 justify-center">
                                                            {/* Edit Button */}
                                                            <button
                                                                className="text-black-600 hover:text-black-800 border border-black-600 hover:border-black-600 rounded-full p-2"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/product-edit/${product.product_id}`,
                                                                    )
                                                                }
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

                                                            {/* Print Button */}
                                                            <button
                                                                className="text-black-600 hover:text-black-800 border border-black-600 hover:border-black-600 rounded-full p-2"
                                                                onClick={() =>
                                                                    handlePrint(
                                                                        product,
                                                                    )
                                                                }
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
                                                                        d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
                                                                    />
                                                                </svg>
                                                            </button>

                                                            {/* Delete Button */}
                                                            <button
                                                                className="text-black-600 hover:text-black-800 border border-black-600 hover:border-black-600 rounded-full p-2"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        product.product_id,
                                                                    )
                                                                }
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

                                {/* Pagination - Updated to match UserList style */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-4 space-x-2">
                                        {[...Array(totalPages)].map(
                                            (_, index) => {
                                                const pageNumber = index + 1;
                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() =>
                                                            setPages({
                                                                ...pages,
                                                                [outlet]:
                                                                    pageNumber,
                                                            })
                                                        }
                                                        className={`px-3 py-1 rounded border ${
                                                            page === pageNumber
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
                        );
                    })
                ) : (
                    <p className="text-center mt-6">No products available</p>
                )}
            </div>

            {/* QR Popup Modal */}
            {selectedQR && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
                    onClick={() => setSelectedQR(null)}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-lg relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-black"
                            onClick={() => setSelectedQR(null)}
                        >
                            ✖
                        </button>
                        <h3 className="text-lg font-semibold mb-4">
                            {selectedQR.name}
                        </h3>
                        <QRCodeSVG value={selectedQR.value} size={250} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
