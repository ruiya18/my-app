import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ProductEdit = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_id: "",
    name: "",
    quantity: 0,
    status: "active",
    outlet: "",
    image: null, 
  });

  const [previewImage, setPreviewImage] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${productId}`);
        setFormData({
          product_id: res.data.product_id,
          name: res.data.name,
          quantity: res.data.quantity,
          status: res.data.status,
          outlet: res.data.outlet,
          image: null, 
        });
        if (res.data.image) {
          setPreviewImage(`/storage/${res.data.image}`); 
        }
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 422) {
            const errors = err.response.data.errors;
            if (errors.name) {
                setMessage(errors.name[0]);
            } else {
                setMessage("Validation error. Please check the form.");
            }
        } else {
            setMessage("Failed to edit product. Please try again.");
        }
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("quantity", formData.quantity);
      form.append("status", formData.status);
      form.append("outlet", formData.outlet);
      if (formData.image) {
        form.append("image", formData.image);
      }

      await axios.post(`/api/products/${productId}?_method=PUT`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product updated successfully!");
      navigate("/product-list");
    } catch (err) {
      console.error("Error updating product", err);
      alert("Failed to update product.");
    }
  };

  if (loading) return <div className="p-6">Loading product...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Edit Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product ID */}
        <div>
          <label className="block text-sm font-medium">Product ID</label>
          <input
            type="text"
            name="product_id"
            value={formData.product_id}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Outlet */}
        <div>
          <label className="block text-sm font-medium">Outlet</label>
          <select
            name="outlet"
            value={formData.outlet}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="QM ROOM">QM ROOM</option>
            <option value="UP STORE">UP STORE</option>
            <option value="DOWN STORE">DOWN STORE</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border px-3 py-2 rounded"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="mt-2 h-32 object-cover rounded"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default ProductEdit;
