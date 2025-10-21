import React from "react";
import { Link } from "react-router-dom";

export default function StartCampaign() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-6 text-center">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">Start a Campaign</h1>

      <form className="max-w-md mx-auto bg-white shadow-md rounded-2xl p-6">
        <input
          type="text"
          placeholder="Campaign Title"
          className="w-full mb-4 border rounded-lg px-4 py-2"
        />
        <textarea
          placeholder="Description"
          rows="3"
          className="w-full mb-4 border rounded-lg px-4 py-2"
        ></textarea>
        <input
          type="number"
          placeholder="Goal Amount ($)"
          className="w-full mb-4 border rounded-lg px-4 py-2"
        />
        <input
          type="file"
          className="w-full mb-6 text-sm text-gray-600 border rounded-lg p-2"
        />
        <button className="w-full bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 transition">
          Create Campaign
        </button>
      </form>

      <Link to="/" className="block mt-8 text-blue-600 hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
