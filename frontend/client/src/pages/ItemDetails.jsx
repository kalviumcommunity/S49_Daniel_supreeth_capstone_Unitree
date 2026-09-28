import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { MapPin, Package, Pencil, Trash2, Mail, Phone, HandHeart } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import useApi from "../lib/useApi";
import { useAuth } from "../context/AuthContext";
import { formatDate, timeAgo } from "../lib/format";
import { Alert, Avatar, PageLoader, Spinner, StatusBadge } from "../components/ui";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: item, loading, error, reload } = useApi(`/items/${id}`);
  const [active, setActive] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  if (loading && !item) return <PageLoader />;
  if (error || !item) {
    return (
      <div className="page max-w-xl text-center">
        <Alert>{error || "Item not found"}</Alert>
        <Link to="/items" className="btn-primary mt-6">Back to Items</Link>
      </div>
    );
  }

  const isDonor = user && (user._id === item.donor?._id || user.role === "admin");
  const isClaimer = user && item.claimedBy?._id === user._id;

  const run = async (fn) => {
    setBusy(true);
    setNotice({ type: "", text: "" });
    try {
      const res = await fn();
      setNotice({ type: "success", text: res.data.message });
      await reload();
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove this item listing?")) return;
    try {
      await api.delete(`/items/${id}`);
      navigate("/dashboard");
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    }
  };

  const images = item.images || [];

  return (
    <div className="page">
      <Link to="/items" className="text-blue-600 hover:underline text-sm">← Back to Items</Link>

      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div>
          <div className="card overflow-hidden">
            {images.length ? (
              <img src={images[active]} alt={item.name} className="w-full h-80 md:h-96 object-cover" />
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-orange-50 to-blue-100 flex items-center justify-center">
                <Package size={64} className="text-blue-300" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActive(i)} className={`rounded-lg overflow-hidden border-2 cursor-pointer ${i === active ? "border-blue-500" : "border-transparent"}`}>
                  <img src={src} alt={`${item.name} ${i + 1}`} className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={item.status} />
              <span className="text-xs text-gray-500">Listed {timeAgo(item.createdAt)}</span>
            </div>
            <h1 className="text-3xl font-bold text-blue-800 mb-3">{item.name}</h1>
            <div className="grid grid-cols-3 gap-3 text-sm mb-4">
              <Info label="Category" value={item.category} />
              <Info label="Condition" value={item.condition} />
              <Info label="Quantity" value={item.quantity} />
            </div>
            {item.location && (
              <p className="flex items-center gap-1 text-sm text-gray-600 mb-4"><MapPin size={14} /> {item.location}</p>
            )}
            <p className="prose-text">{item.description}</p>
          </div>

          {item.donor && (
            <div className="card p-6">
              <p className="text-sm text-gray-500 mb-2">Donated by</p>
              <Link to={`/users/${item.donor._id}`} className="flex items-center gap-3 hover:text-blue-600">
                <Avatar user={item.donor} size={40} />
                <span className="font-semibold">{item.donor.username}</span>
              </Link>
              {(item.donor.email || item.donor.phone) && !isDonor && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg text-sm space-y-1">
                  <p className="font-medium text-green-800 mb-1">Contact the donor to arrange pickup:</p>
                  {item.donor.email && <p className="flex items-center gap-2"><Mail size={14} /> <a href={`mailto:${item.donor.email}`} className="text-blue-600 hover:underline">{item.donor.email}</a></p>}
                  {item.donor.phone && <p className="flex items-center gap-2"><Phone size={14} /> {item.donor.phone}</p>}
                </div>
              )}
            </div>
          )}

          {notice.text && <Alert type={notice.type}>{notice.text}</Alert>}

          {/* Actions for the donor */}
          {isDonor && (
            <div className="card p-6 space-y-4">
              {item.status === "claimed" && item.claimedBy && (
                <div className="p-4 bg-amber-50 rounded-lg text-sm">
                  <p className="font-medium text-amber-800 mb-2">
                    Claimed by {item.claimedBy.username} on {formatDate(item.claimedAt)}
                  </p>
                  {item.claimMessage && <p className="italic text-gray-700 mb-2">&ldquo;{item.claimMessage}&rdquo;</p>}
                  <p className="flex items-center gap-2"><Mail size={14} /> <a href={`mailto:${item.claimedBy.email}`} className="text-blue-600 hover:underline">{item.claimedBy.email}</a></p>
                  {item.claimedBy.phone && <p className="flex items-center gap-2"><Phone size={14} /> {item.claimedBy.phone}</p>}
                  <div className="flex gap-2 mt-3">
                    <button disabled={busy} onClick={() => run(() => api.post(`/items/${id}/complete`))} className="btn-primary text-sm">
                      Mark as handed over
                    </button>
                    <button disabled={busy} onClick={() => run(() => api.post(`/items/${id}/release`))} className="btn-outline text-sm">
                      Cancel claim
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Link to={`/items/${id}/edit`} className="btn-outline text-sm"><Pencil size={14} /> Edit</Link>
                <button onClick={handleDelete} className="btn-danger text-sm"><Trash2 size={14} /> Remove</button>
              </div>
            </div>
          )}

          {/* Actions for everyone else */}
          {!isDonor && item.status === "available" && (
            <div className="card p-6">
              {user ? (
                <form onSubmit={(e) => { e.preventDefault(); run(() => api.post(`/items/${id}/claim`, { message })); }} className="space-y-3">
                  <textarea rows="2" maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} className="input" placeholder="Tell the donor why you need it and when you can pick it up (optional)" />
                  <button disabled={busy} className="btn-accent w-full py-2.5">
                    {busy ? <Spinner size={18} /> : <HandHeart size={18} />} Claim this item
                  </button>
                </form>
              ) : (
                <button onClick={() => navigate("/login", { state: { from: location.pathname } })} className="btn-accent w-full py-2.5">
                  Log in to claim
                </button>
              )}
            </div>
          )}

          {isClaimer && item.status === "claimed" && (
            <button disabled={busy} onClick={() => run(() => api.post(`/items/${id}/release`))} className="btn-outline w-full">
              I no longer need this item
            </button>
          )}
          {!isDonor && !isClaimer && item.status !== "available" && (
            <p className="text-center text-gray-500 text-sm">This item is no longer available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
