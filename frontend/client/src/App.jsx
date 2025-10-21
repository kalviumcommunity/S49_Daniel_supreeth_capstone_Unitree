import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import BrowseCampaigns from "./pages/BrowseCampaigns";
import CampaignDetails from "./pages/CampaignDetails";
import DonateItems from "./pages/DonateItems";
import StartCampaign from "./pages/StartCampaign";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/campaigns" element={<BrowseCampaigns />} />
        <Route path="/campaigns/:id" element={<CampaignDetails />} />
        <Route path="/donate-items" element={<DonateItems />} />
        <Route path="/start-campaign" element={<StartCampaign />} />
      </Routes>
    </Router>
  );
}
