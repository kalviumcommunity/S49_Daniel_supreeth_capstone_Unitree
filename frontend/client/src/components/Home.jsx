import React from "react";
import { Link } from "react-router-dom"; // add this at the top of your file
import { Heart, Box, TrendingUp } from "lucide-react";

const campaigns = [
  {
    id: 1,
    title: "Help Build a Community Garden",
    category: "Community",
    description: "We're creating a space where neighbors can grow fresh produce together.",
    raised: 3250,
    goal: 5000,
    supporters: 42,
    image:
      "https://images.unsplash.com/photo-1596386461350-02b5c1a0a9c8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Medical Fund for Local Family",
    category: "Medical",
    description: "Supporting a family facing unexpected medical expenses.",
    raised: 8500,
    goal: 15000,
    supporters: 97,
    image:
      "https://images.unsplash.com/photo-1588776814546-ec7d8e26b38d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Animal Shelter Renovation",
    category: "Animals",
    description: "Upgrading facilities to provide better care for rescue animals.",
    raised: 12400,
    goal: 20000,
    supporters: 156,
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
  },
];

export default function HomePage() {
  return (
    <div className="font-sans text-gray-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-4 px-8 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 text-2xl font-semibold text-blue-600">
          <Heart className="fill-blue-600 text-blue-600" size={24} />
          Unitree
        </div>
        <div className="flex gap-8 text-gray-600">
          <a href="#browse" className="hover:text-blue-600 transition-colors">
            Browse
          </a>
          <a href="#how" className="hover:text-blue-600 transition-colors">
            How It Works
          </a>
        </div>
        <div className="flex gap-4">
<Link
  to="/register"
  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
>
  Sign Up
</Link>

          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all">
            Start Campaign
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-500 to-blue-600 text-center text-white py-24 px-6">
        <button className="bg-blue-400/30 px-4 py-2 rounded-full mb-6 border border-white/30 hover:bg-blue-500 transition-all">
          Help others, make a difference
        </button>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Fund Dreams, Share Resources
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-blue-100 mb-8">
          A community-powered platform where you can support campaigns with
          donations or list items to help others. Every contribution creates
          impact.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-orange-500 hover:bg-orange-600 transition-all px-6 py-3 rounded-lg text-white font-medium">
            Browse Campaigns
          </button>
          <button className="bg-white/10 border border-white hover:bg-white/20 transition-all px-6 py-3 rounded-lg text-white font-medium">
            Donate Items
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-16 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-gray-600 mb-10">
          Three simple ways to make a difference in your community
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-12">
          {[
            {
              icon: <Heart className="text-blue-500" size={40} />,
              title: "Support Campaigns",
              text: "Browse meaningful campaigns and donate money to help them reach their goals.",
            },
            {
              icon: <Box className="text-blue-500" size={40} />,
              title: "Donate Items",
              text: "List physical items you want to donate. Others can claim them by covering costs.",
            },
            {
              icon: <TrendingUp className="text-blue-500" size={40} />,
              title: "Make Impact",
              text: "Watch your contributions create real change in people's lives.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-8 w-80 mx-auto"
            >
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 px-6 bg-white" id="browse">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Campaigns</h2>
          <button className="text-blue-600 hover:underline font-medium">
            View All →
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                />
                <span className="absolute top-3 right-3 bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow">
                  {c.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-1">{c.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{c.description}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(c.raised / c.goal) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    <strong>${c.raised.toLocaleString()}</strong> raised of $
                    {c.goal.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={14} className="text-orange-500" /> {c.supporters}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-10 text-gray-600 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-xl mb-3">
              <Heart className="fill-blue-600 text-blue-600" size={22} />
              Unitree
            </div>
            <p className="text-sm">
              Building a community of generosity, one contribution at a time.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Platform</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="#browse" className="hover:text-blue-600">Browse</a></li>
              <li><a href="#how" className="hover:text-blue-600">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Support</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-600">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Legal</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-8">
          © 2025 Unitree. Made with care for our community.
        </div>
      </footer>
    </div>
  );
}
