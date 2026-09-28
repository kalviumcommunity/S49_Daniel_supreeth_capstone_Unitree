import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-10 text-gray-600 px-6 mt-auto">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xl mb-3">
            <Heart className="fill-blue-600 text-blue-600" size={22} />
            Unitree
          </div>
          <p className="text-sm">Building a community of generosity, one contribution at a time.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Give</h4>
          <ul className="space-y-1 text-sm">
            <li><Link to="/campaigns" className="hover:text-blue-600">Browse campaigns</Link></li>
            <li><Link to="/items" className="hover:text-blue-600">Browse items</Link></li>
            <li><Link to="/donate-items" className="hover:text-blue-600">Donate an item</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Raise</h4>
          <ul className="space-y-1 text-sm">
            <li><Link to="/start-campaign" className="hover:text-blue-600">Start a campaign</Link></li>
            <li><Link to="/blog/new" className="hover:text-blue-600">Share your story</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Community</h4>
          <ul className="space-y-1 text-sm">
            <li><Link to="/blog" className="hover:text-blue-600">Blog</Link></li>
            <li><Link to="/#how" className="hover:text-blue-600">How it works</Link></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-sm text-gray-500 mt-8">
        © {new Date().getFullYear()} Unitree. Made with care for our community.
      </div>
    </footer>
  );
}
