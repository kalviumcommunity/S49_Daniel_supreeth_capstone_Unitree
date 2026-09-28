import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import BrowseCampaigns from "./pages/BrowseCampaigns";
import CampaignDetails from "./pages/CampaignDetails";
import StartCampaign from "./pages/StartCampaign";
import DonateItems from "./pages/DonateItems";
import BrowseItems from "./pages/BrowseItems";
import ItemDetails from "./pages/ItemDetails";
import Blog from "./pages/Blog";
import PostDetails from "./pages/PostDetails";
import PostEditor from "./pages/PostEditor";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

const guard = (element, admin = false) => <ProtectedRoute admin={admin}>{element}</ProtectedRoute>;

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              <Route path="/campaigns" element={<BrowseCampaigns />} />
              <Route path="/campaigns/:id" element={<CampaignDetails />} />
              <Route path="/campaigns/:id/edit" element={guard(<StartCampaign />)} />
              <Route path="/start-campaign" element={guard(<StartCampaign />)} />

              <Route path="/items" element={<BrowseItems />} />
              <Route path="/items/:id" element={<ItemDetails />} />
              <Route path="/items/:id/edit" element={guard(<DonateItems />)} />
              <Route path="/donate-items" element={guard(<DonateItems />)} />

              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/new" element={guard(<PostEditor />)} />
              <Route path="/blog/:id" element={<PostDetails />} />
              <Route path="/blog/:id/edit" element={guard(<PostEditor />)} />

              <Route path="/dashboard" element={guard(<Dashboard />)} />
              <Route path="/users/:id" element={<Profile />} />
              <Route path="/admin" element={guard(<Admin />, true)} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
