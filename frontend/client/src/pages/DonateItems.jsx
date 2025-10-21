import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function DonateItems() {
  const [images, setImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Item donation submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-6 text-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Donate Items</h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white shadow-md rounded-2xl p-6"
      >
        <input
          type="text"
          placeholder="Item Name"
          className="w-full mb-4 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <textarea
          placeholder="Item Description"
          rows="3"
          className="w-full mb-4 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        ></textarea>

        <input
          type="number"
          placeholder="Quantity"
          className="w-full mb-4 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <div className="mb-6 text-left">
          <label className="block text-gray-700 font-medium mb-2">
            Upload Photos
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-sm text-gray-600 border rounded-lg p-2 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
        </div>

        {/* Image Preview Section */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Uploaded item ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 transition"
        >
          Donate Item
        </button>
      </form>

      <Link to="/" className="block mt-8 text-blue-600 hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
