// src/pages/CampaignDetails.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";

export default function CampaignDetails() {
  const { id } = useParams();

  const campaign = {
    id,
    title: "Help Build a Community Garden",
    description:
      "Join us in creating a shared green space where everyone can grow together!",
    goal: 5000,
    raised: 3200,
    image:
      "https://images.unsplash.com/photo-1596386461350-02b5c1a0a9c8?auto=format&fit=crop&w=800&q=80",
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center py-12 px-6">
      <div className="max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-3">
            {campaign.title}
          </h1>
          <p className="text-gray-600 mb-6">{campaign.description}</p>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
            ></div>
          </div>
          <p className="text-gray-700 mb-6">
            <strong>${campaign.raised}</strong> raised of ${campaign.goal}
          </p>

          <form className="space-y-4">
            <input
              type="number"
              placeholder="Enter donation amount"
              className="w-full border border-gray-300 rounded-lg p-3"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              Donate
            </button>
          </form>

          <Link
            to="/campaigns"
            className="block text-center text-blue-600 hover:underline mt-6"
          >
            ← Back to Campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}
