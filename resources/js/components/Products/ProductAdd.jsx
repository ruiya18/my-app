import React, { useRef, useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";

const ProductAdd = ({ onProductAdded }) => {
  const [productId, setProductId] = useState("");
  const [form, setForm] = useState({
    name: "",
    quantity: 1,
    status: "active",
    outlet: "QM ROOM",
  });
  const [image, setImage] = useState(null); 
  const [message, setMessage] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const qrRef = useRef(null);
  const navigate = useNavigate();

  const generateId = () => {
  const newId = Math.floor(1000 + Math.random() * 9000).toString();
  setProductId(newId);
  // ✅ Encode full route with productId
  const url = `${window.location.origin}/home/${newId}`;
  setQrUrl(url);
};


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const getSvgString = () => {
    const svgElement = qrRef.current?.querySelector("svg");
    return svgElement ? svgElement.outerHTML : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      setMessage("Please generate a QR code first.");
      return;
    }

    const svgString = getSvgString();
    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("name", form.name);
      formData.append("quantity", form.quantity);
      formData.append("status", form.status);
      formData.append("outlet", form.outlet);
      formData.append("qrcode", svgString || "");
      if (image) {
        formData.append("image", image); // ✅ add image
      }

      await axios.post("/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Product added successfully.");
      setForm({ name: "", quantity: 1, status: "active", outlet: "QM ROOM" });
      setProductId("");
      setQrUrl("");
      setImage(null);
      if (onProductAdded) onProductAdded();

      navigate("/product-list");
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const errors = err.response.data.errors;
        if (errors.name) {
          setMessage(errors.name[0]);
        } else {
          setMessage('Validation error. Please check the form.');
        }
      } else {
        setMessage('Failed to add product. Please try again.');
      }
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Add Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm mb-1">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            min="1"
            required
            className="w-full border rounded p-2"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Outlet */}
        <div>
          <label className="block text-sm mb-1">Outlet</label>
          <select
            name="outlet"
            value={form.outlet}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="QM ROOM">QM ROOM</option>
            <option value="UP STORE">UP STORE</option>
            <option value="DOWN STORE">DOWN STORE</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm mb-1">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border rounded p-2"
          />
          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="mt-2 h-24 object-cover rounded"
            />
          )}
        </div>

        {/* QR Code */}
        <div>
          <button
            type="button"
            onClick={generateId}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Generate QR code
          </button>
          {productId && (
            <div className="mt-2" ref={qrRef}>
              <p className="font-mono">ID: {productId}</p>
              {qrUrl && <QRCode value={qrUrl} size={128} />}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
        {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
      </form>
    </div>
  );
};

export default ProductAdd;


