import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Heart, Menu, X, LayoutDashboard, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui";

const links = [
  { to: "/campaigns", label: "Campaigns" },
  { to: "/items", label: "Items" },
  { to: "/blog", label: "Blog" },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `transition-colors ${isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"}`;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center py-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-2xl font-semibold text-blue-600">
          <Heart className="fill-blue-600 text-blue-600" size={24} />
          Unitree
        </Link>

        <div className="hidden md:flex gap-8">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/start-campaign" className="btn-accent">
            Start Campaign
          </Link>
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1 pr-3 cursor-pointer"
              >
                <Avatar user={user} size={32} />
                <span className="text-sm font-medium max-w-28 truncate">{user.username}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 card py-2 border border-gray-100">
                  <MenuLink to="/dashboard" icon={LayoutDashboard}>Dashboard</MenuLink>
                  <MenuLink to={`/users/${user._id}`} icon={User}>My profile</MenuLink>
                  {isAdmin && <MenuLink to="/admin" icon={Shield}>Admin panel</MenuLink>}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Log In</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 cursor-pointer" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/start-campaign" className="btn-accent">Start Campaign</Link>
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to={`/users/${user._id}`} className={linkClass}>My profile</NavLink>
              {isAdmin && <NavLink to="/admin" className={linkClass}>Admin panel</NavLink>}
              <button onClick={handleLogout} className="btn-danger">Log out</button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="btn-outline flex-1">Log In</Link>
              <Link to="/register" className="btn-primary flex-1">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function MenuLink({ to, icon: Icon, children }) {
  return (
    <Link to={to} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
      <Icon size={16} /> {children}
    </Link>
  );
}
