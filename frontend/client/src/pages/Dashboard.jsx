import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Megaphone, Heart, Package, PenLine, Settings, Inbox, HandHeart, Plus } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import useApi from "../lib/useApi";
import { useAuth } from "../context/AuthContext";
import { formatMoney, formatDate } from "../lib/format";
import { CampaignCard, ItemCard, PostCard } from "../components/Cards";
import ImagePicker from "../components/ImagePicker";
import { Alert, Avatar, EmptyState, PageLoader, Spinner, StatusBadge } from "../components/ui";

const TABS = [
  { key: "campaigns", label: "My campaigns", icon: Megaphone },
  { key: "donations", label: "My donations", icon: Heart },
  { key: "received", label: "Received", icon: Inbox },
  { key: "items", label: "My items", icon: Package },
  { key: "claims", label: "Claimed items", icon: HandHeart },
  { key: "posts", label: "My posts", icon: PenLine },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") : "campaigns";

  return (
    <div className="page">
      <div className="card p-6 mb-8 flex flex-col sm:flex-row items-center gap-5">
        <Avatar user={user} size={72} />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold">Welcome, {user.username}!</h1>
          <p className="text-gray-500 text-sm">
            {user.email} · Member since {formatDate(user.createdAt)}
            {user.role === "admin" && <span className="ml-2 text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/start-campaign" className="btn-accent text-sm"><Plus size={16} /> Campaign</Link>
          <Link to="/donate-items" className="btn-outline text-sm"><Plus size={16} /> Item</Link>
          <Link to="/blog/new" className="btn-outline text-sm"><Plus size={16} /> Post</Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSearchParams({ tab: key })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition cursor-pointer ${
              tab === key ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-blue-50 shadow-sm"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === "campaigns" && <MyCampaigns userId={user._id} />}
      {tab === "donations" && <MyDonations />}
      {tab === "received" && <Received />}
      {tab === "items" && <MyItems userId={user._id} />}
      {tab === "claims" && <MyClaims />}
      {tab === "posts" && <MyPosts userId={user._id} />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}

function MyCampaigns({ userId }) {
  const { data, loading, error } = useApi("/campaigns", { creator: userId, status: "all", limit: 50 });
  if (loading) return <PageLoader />;
  if (error) return <Alert>{error}</Alert>;
  if (!data.campaigns.length) {
    return (
      <EmptyState icon={Megaphone} title="No campaigns yet" text="Start a campaign to raise funds for a cause you care about."
        action={<Link to="/start-campaign" className="btn-accent">Start a Campaign</Link>} />
    );
  }
  const raised = data.campaigns.reduce((sum, c) => sum + c.raised, 0);
  return (
    <>
      <p className="text-gray-600 mb-4">
        {data.total} campaign{data.total === 1 ? "" : "s"} · <strong>{formatMoney(raised)}</strong> raised in total
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.campaigns.map((c) => <CampaignCard key={c._id} campaign={c} />)}
      </div>
    </>
  );
}

function MyDonations() {
  const { data, loading, error } = useApi("/donations/mine");
  if (loading) return <PageLoader />;
  if (error) return <Alert>{error}</Alert>;
  if (!data.length) {
    return (
      <EmptyState icon={Heart} title="No donations yet" text="Find a campaign that speaks to you."
        action={<Link to="/campaigns" className="btn-primary">Browse Campaigns</Link>} />
    );
  }
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        You have donated <strong>{formatMoney(total)}</strong> across {data.length} donation{data.length === 1 ? "" : "s"}. Thank you!
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="p-4">Campaign</th><th className="p-4">Amount</th><th className="p-4">Date</th>
              <th className="p-4">Reference</th><th className="p-4">Visibility</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d._id} className="border-t border-gray-100">
                <td className="p-4">
                  {d.campaign ? <Link to={`/campaigns/${d.campaign._id}`} className="text-blue-600 hover:underline">{d.campaign.title}</Link> : <span className="text-gray-400">Deleted campaign</span>}
                </td>
                <td className="p-4 font-semibold">{formatMoney(d.amount)}</td>
                <td className="p-4">{formatDate(d.createdAt)}</td>
                <td className="p-4 font-mono text-xs">{d.reference}</td>
                <td className="p-4">{d.anonymous ? "Anonymous" : "Public"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Received() {
  const { data, loading, error } = useApi("/donations/received");
  if (loading) return <PageLoader />;
  if (error) return <Alert>{error}</Alert>;
  if (!data.length) {
    return <EmptyState icon={Inbox} title="No donations received yet" text="Share your campaigns to get your first donation." />;
  }
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr><th className="p-4">Donor</th><th className="p-4">Campaign</th><th className="p-4">Amount</th><th className="p-4">Message</th><th className="p-4">Date</th></tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d._id} className="border-t border-gray-100">
              <td className="p-4">{d.donor ? <>{d.donor.username}<br /><span className="text-xs text-gray-500">{d.donor.email}</span></> : "Anonymous"}</td>
              <td className="p-4">{d.campaign?.title}</td>
              <td className="p-4 font-semibold">{formatMoney(d.amount)}</td>
              <td className="p-4 text-gray-600 italic">{d.message}</td>
              <td className="p-4">{formatDate(d.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MyItems({ userId }) {
  const { data, loading, error } = useApi("/items", { donor: userId, status: "all", limit: 50 });
  if (loading) return <PageLoader />;
  if (error) return <Alert>{error}</Alert>;
  if (!data.items.length) {
    return (
      <EmptyState icon={Package} title="No items listed" text="Give away things you no longer need."
        action={<Link to="/donate-items" className="btn-accent">Donate an item</Link>} />
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.items.map((i) => <ItemCard key={i._id} item={i} />)}
    </div>
  );
}

function MyClaims() {
  const { data, loading, error } = useApi("/items/claimed/me");
  if (loading) return <PageLoader />;
  if (error) return <Alert>{error}</Alert>;
  if (!data.length) {
    return (
      <EmptyState icon={HandHeart} title="You haven't claimed any items" text="Browse free items shared by the community."
        action={<Link to="/items" className="btn-primary">Browse Items</Link>} />
    );
  }
  return (
    <div className="card divide-y divide-gray-100">
      {data.map((i) => (
        <Link key={i._id} to={`/items/${i._id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50">
          <div>
            <p className="font-medium">{i.name}</p>
            <p className="text-sm text-gray-500">From {i.donor?.username} · {i.donor?.email} · claimed {formatDate(i.claimedAt)}</p>
          </div>
          <StatusBadge status={i.status} />
        </Link>
      ))}
    </div>
  );
}

function MyPosts({ userId }) {
  const { data, loading, error } = useApi("/posts", { author: userId, limit: 50 });
  if (loading) return <PageLoader />;
  if (error) return <Alert>{error}</Alert>;
  if (!data.posts.length) {
    return (
      <EmptyState icon={PenLine} title="No posts yet" text="Share your story with the community."
        action={<Link to="/blog/new" className="btn-primary">Write a post</Link>} />
    );
  }
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.posts.map((p) => <PostCard key={p._id} post={p} />)}
    </div>
  );
}

function SettingsTab() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: user.username,
    email: user.email,
    bio: user.bio || "",
    location: user.location || "",
    phone: user.phone || "",
    avatar: user.avatar || "",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [status, setStatus] = useState({ profile: null, password: null });
  const [saving, setSaving] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving("profile");
    try {
      const res = await api.put("/users/me", profile);
      setUser(res.data.user);
      setStatus((s) => ({ ...s, profile: { type: "success", text: "Profile saved" } }));
    } catch (err) {
      setStatus((s) => ({ ...s, profile: { type: "error", text: getErrorMessage(err) } }));
    } finally {
      setSaving("");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      setStatus((s) => ({ ...s, password: { type: "error", text: "New passwords do not match" } }));
      return;
    }
    setSaving("password");
    try {
      await api.put("/users/me/password", passwords);
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      setStatus((s) => ({ ...s, password: { type: "success", text: "Password changed" } }));
    } catch (err) {
      setStatus((s) => ({ ...s, password: { type: "error", text: getErrorMessage(err) } }));
    } finally {
      setSaving("");
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete your account permanently? Your posts and items will be removed.")) return;
    try {
      await api.delete("/users/me");
      logout();
      navigate("/");
    } catch (err) {
      setStatus((s) => ({ ...s, password: { type: "error", text: getErrorMessage(err) } }));
    }
  };

  const change = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={saveProfile} className="card p-6 space-y-4 lg:col-span-2">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label" htmlFor="username">Username</label><input id="username" name="username" value={profile.username} onChange={change} required className="input" /></div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" name="email" value={profile.email} onChange={change} required className="input" /></div>
          <div><label className="label" htmlFor="location">Location</label><input id="location" name="location" value={profile.location} onChange={change} maxLength={100} className="input" /></div>
          <div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" value={profile.phone} onChange={change} maxLength={20} className="input" placeholder="Shared only with item claimers" /></div>
        </div>
        <div><label className="label" htmlFor="bio">Bio</label><textarea id="bio" name="bio" rows="3" value={profile.bio} onChange={change} maxLength={500} className="input" /></div>
        <ImagePicker label="Profile photo" value={profile.avatar} onChange={(avatar) => setProfile({ ...profile, avatar })} />
        {status.profile && <Alert type={status.profile.type}>{status.profile.text}</Alert>}
        <button disabled={saving === "profile"} className="btn-primary">{saving === "profile" && <Spinner size={16} />} Save profile</button>
      </form>

      <form onSubmit={savePassword} className="card p-6 space-y-4 h-fit">
        <h2 className="text-lg font-semibold">Change password</h2>
        {[
          ["currentPassword", "Current password", "current-password"],
          ["newPassword", "New password", "new-password"],
          ["confirm", "Confirm new password", "new-password"],
        ].map(([name, label, ac]) => (
          <div key={name}>
            <label className="label" htmlFor={name}>{label}</label>
            <input id={name} type="password" name={name} autoComplete={ac} minLength={name === "currentPassword" ? undefined : 6} value={passwords[name]}
              onChange={(e) => setPasswords({ ...passwords, [name]: e.target.value })} required className="input" />
          </div>
        ))}
        {status.password && <Alert type={status.password.type}>{status.password.text}</Alert>}
        <button disabled={saving === "password"} className="btn-outline w-full">{saving === "password" && <Spinner size={16} />} Update password</button>
      </form>

      <div className="card p-6 space-y-3 lg:col-span-3 border border-red-100">
        <h2 className="text-lg font-semibold text-red-600">Delete account</h2>
        <p className="text-sm text-gray-600">
          Removes your profile, posts and listed items. Donation records are kept, and campaigns that received donations are closed.
        </p>
        <button type="button" onClick={deleteAccount} className="btn-danger">Delete my account</button>
      </div>
    </div>
  );
}
