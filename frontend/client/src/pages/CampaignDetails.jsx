import { useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, MapPin, Calendar, Pencil, Trash2, PenLine, Lock, Unlock, CheckCircle2 } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import useApi from "../lib/useApi";
import { useAuth } from "../context/AuthContext";
import { formatMoney, formatDate, timeAgo, percent, daysLeft, currencySymbol } from "../lib/format";
import { Alert, Avatar, PageLoader, ProgressBar, Spinner, StatusBadge } from "../components/ui";

const PRESETS = [10, 25, 50, 100, 250];

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data, setData, loading, error } = useApi(`/campaigns/${id}`);
  const [actionError, setActionError] = useState("");

  if (loading) return <PageLoader />;
  if (error || !data) {
    return (
      <div className="page max-w-xl text-center">
        <Alert>{error || "Campaign not found"}</Alert>
        <Link to="/campaigns" className="btn-primary mt-6">Back to Campaigns</Link>
      </div>
    );
  }

  const { campaign, donations, updates } = data;
  const isOwner = user && (user._id === campaign.creator?._id || user.role === "admin");
  const left = daysLeft(campaign.deadline);

  const setStatus = async (status) => {
    setActionError("");
    try {
      const res = await api.put(`/campaigns/${id}`, { status });
      setData({ ...data, campaign: { ...campaign, status: res.data.status } });
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this campaign permanently?")) return;
    try {
      await api.delete(`/campaigns/${id}`);
      navigate("/dashboard");
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const onDonated = (donation, updatedCampaign) => {
    setData({
      ...data,
      campaign: { ...campaign, raised: updatedCampaign.raised, donationCount: updatedCampaign.donationCount },
      donations: [{ ...donation, donor: donation.anonymous ? null : user }, ...donations],
    });
  };

  return (
    <div className="page">
      <Link to="/campaigns" className="text-blue-600 hover:underline text-sm">← Back to Campaigns</Link>

      <div className="grid lg:grid-cols-3 gap-8 mt-4">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            {campaign.image && <img src={campaign.image} alt={campaign.title} className="w-full h-72 md:h-96 object-cover" />}
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{campaign.category}</span>
                <StatusBadge status={campaign.status} />
              </div>
              <h1 className="text-3xl font-bold text-blue-800 mb-3">{campaign.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{campaign.summary}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                {campaign.creator && (
                  <Link to={`/users/${campaign.creator._id}`} className="flex items-center gap-2 hover:text-blue-600">
                    <Avatar user={campaign.creator} size={24} /> {campaign.creator.username}
                  </Link>
                )}
                {campaign.location && (
                  <span className="flex items-center gap-1"><MapPin size={14} /> {campaign.location}</span>
                )}
                <span className="flex items-center gap-1"><Calendar size={14} /> Started {formatDate(campaign.createdAt)}</span>
              </div>

              {isOwner && (
                <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-xl">
                  <Link to={`/campaigns/${id}/edit`} className="btn-outline text-sm"><Pencil size={14} /> Edit</Link>
                  <Link to={`/blog/new?campaign=${id}`} className="btn-outline text-sm"><PenLine size={14} /> Post update</Link>
                  {campaign.status === "active" ? (
                    <>
                      <button onClick={() => setStatus("completed")} className="btn-outline text-sm"><CheckCircle2 size={14} /> Mark completed</button>
                      <button onClick={() => setStatus("closed")} className="btn-outline text-sm"><Lock size={14} /> Close</button>
                    </>
                  ) : (
                    <button onClick={() => setStatus("active")} className="btn-outline text-sm"><Unlock size={14} /> Reopen</button>
                  )}
                  <button onClick={handleDelete} className="btn-danger text-sm"><Trash2 size={14} /> Delete</button>
                </div>
              )}
              <Alert>{actionError}</Alert>

              <h2 className="text-xl font-semibold mb-3">Our story</h2>
              <p className="prose-text">{campaign.story}</p>
            </div>
          </div>

          {/* Updates */}
          <div className="card p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-4">Updates ({updates.length})</h2>
            {updates.length === 0 ? (
              <p className="text-gray-500 text-sm">No updates yet.</p>
            ) : (
              <div className="space-y-4">
                {updates.map((u) => (
                  <Link key={u._id} to={`/blog/${u._id}`} className="block p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition">
                    <p className="font-semibold">{u.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{u.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{timeAgo(u.createdAt)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 lg:sticky lg:top-24">
            <p className="text-3xl font-bold text-blue-700">{formatMoney(campaign.raised)}</p>
            <p className="text-gray-500 text-sm mb-3">raised of {formatMoney(campaign.goal)} goal</p>
            <ProgressBar raised={campaign.raised} goal={campaign.goal} className="h-3 mb-3" />
            <div className="flex justify-between text-sm text-gray-600 mb-6">
              <span>{percent(campaign.raised, campaign.goal)}% funded</span>
              <span>{campaign.donationCount} donation{campaign.donationCount === 1 ? "" : "s"}</span>
            </div>
            {left !== null && (
              <p className="text-sm text-gray-600 mb-4">
                {left > 0 ? <><strong>{left}</strong> days left</> : "This campaign has ended"}
              </p>
            )}

            {campaign.status !== "active" || (left !== null && left <= 0) ? (
              <p className="text-center text-gray-500 bg-gray-50 rounded-lg py-3 text-sm">
                This campaign is not accepting donations.
              </p>
            ) : user ? (
              <DonateForm campaignId={id} onDonated={onDonated} />
            ) : (
              <button
                onClick={() => navigate("/login", { state: { from: location.pathname } })}
                className="btn-primary w-full py-3"
              >
                <Heart size={18} /> Log in to donate
              </button>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-4">Recent donations</h3>
            {donations.length === 0 ? (
              <p className="text-sm text-gray-500">Be the first to donate!</p>
            ) : (
              <ul className="space-y-4">
                {donations.map((d) => (
                  <li key={d._id} className="flex gap-3">
                    <Avatar user={d.donor || { username: "?" }} size={32} />
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">{d.donor?.username || "Anonymous"}</span>{" "}
                        donated <strong>{formatMoney(d.amount)}</strong>
                      </p>
                      {d.message && <p className="text-gray-600 italic">&ldquo;{d.message}&rdquo;</p>}
                      <p className="text-xs text-gray-400">{timeAgo(d.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DonateForm({ campaignId, onDonated }) {
  const [form, setForm] = useState({ amount: "", message: "", anonymous: false, paymentMethod: "card" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post(`/campaigns/${campaignId}/donate`, { ...form, amount: Number(form.amount) });
      setReceipt(res.data.donation);
      onDonated(res.data.donation, res.data.campaign);
      setForm({ amount: "", message: "", anonymous: false, paymentMethod: "card" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <div className="text-center bg-green-50 border border-green-200 rounded-xl p-5">
        <CheckCircle2 className="mx-auto text-green-600 mb-2" size={36} />
        <p className="font-semibold text-green-800">Thank you for your donation!</p>
        <p className="text-sm text-green-700 mt-1">
          {formatMoney(receipt.amount)} · Ref <span className="font-mono">{receipt.reference}</span>
        </p>
        <button onClick={() => setReceipt(null)} className="text-sm text-blue-600 hover:underline mt-3 cursor-pointer">
          Donate again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setForm({ ...form, amount: String(p) })}
            className={`py-2 rounded-lg text-sm border transition cursor-pointer ${
              Number(form.amount) === p ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:border-blue-400"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{currencySymbol}</span>
        <input
          type="number"
          min="1"
          step="1"
          required
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="Enter donation amount"
          className="input pl-8"
        />
      </div>
      <textarea
        rows="2"
        maxLength={300}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        placeholder="Leave a message of support (optional)"
        className="input"
      />
      <select
        value={form.paymentMethod}
        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
        className="input"
      >
        <option value="card">Credit / Debit card</option>
        <option value="upi">UPI</option>
        <option value="netbanking">Net banking</option>
      </select>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={form.anonymous}
          onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
        />
        Donate anonymously
      </label>
      <Alert>{error}</Alert>
      <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
        {submitting ? <Spinner size={18} /> : <Heart size={18} />} Donate
        {form.amount ? ` ${formatMoney(form.amount)}` : ""}
      </button>
      <p className="text-xs text-gray-400 text-center">
        Demo mode: payments are simulated and no real money is charged.
      </p>
    </form>
  );
}
