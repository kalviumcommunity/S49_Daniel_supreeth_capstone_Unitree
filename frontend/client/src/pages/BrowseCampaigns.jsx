import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const campaigns = [
  {
    id: 1,
    title: "Help Build a Community Garden",
    category: "Community",
    description:
      "We're creating a shared green space for everyone to grow fresh produce together.",
    raised: 3250,
    goal: 5000,
    supporters: 42,
    image:
      "https://i.ytimg.com/vi/MBIYebUgVVI/maxresdefault.jpg",
  },
  {
    id: 2,
    title: "Medical Fund for Local Family",
    category: "Medical",
    description:
      "Helping a family cover urgent medical expenses for their loved one.",
    raised: 8500,
    goal: 15000,
    supporters: 97,
    image:
      "",
  },
  {
    id: 3,
    title: "Animal Shelter Renovation",
    category: "Animals",
    description:
      "Renovating an old animal shelter to provide better living conditions.",
    raised: 12400,
    goal: 20000,
    supporters: 156,
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
  },
];

export default function BrowseCampaigns() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-6 font-sans">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-700 mb-3">
          Browse Campaigns
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Explore ongoing campaigns and contribute to make a difference. Every
          small donation adds up to create real impact.
        </p>
      </div>

      {/* Campaign Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
          >
            <div className="relative">
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-56 object-cover transition-transform duration-500 hover:scale-105"
              />
              <span className="absolute top-3 right-3 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full shadow">
                {c.category}
              </span>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-lg text-blue-800 mb-2">
                {c.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{c.description}</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(c.raised / c.goal) * 100}%` }}
                ></div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-600 mb-5">
                <span>
                  <strong>${c.raised.toLocaleString()}</strong> raised of $
                  {c.goal.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={14} className="text-blue-500" /> {c.supporters}
                </span>
              </div>

              {/* Donate Button */}
              <Link
                to={`/campaigns/${c.id}`}
                className="block text-center bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-all"
              >
                Donate Now
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="text-center mt-16">
        <Link
          to="/"
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
