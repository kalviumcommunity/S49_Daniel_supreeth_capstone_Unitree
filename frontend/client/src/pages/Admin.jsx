import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Megaphone, PenLine, Package, Heart, Download, Search } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import useApi from "../lib/useApi";
import { useAuth } from "../context/AuthContext";
import { formatMoney, formatDate, formatDateTime } from "../lib/format";
import { Alert, Avatar, PageLoader } from "../components/ui";

// Builds a CSV file in the browser and downloads it
function downloadCsv(filename, rows) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Admin() {
  const [tab, setTab] = useState("overview");
  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="flex gap-2 mb-6">
        {["overview", "users", "donations"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm capitalize cursor-pointer ${tab === t ? "bg-blue-600 text-white" : "bg-white shadow-sm text-gray-600 hover:bg-blue-50"}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === "overview" && <Overview />}
      {tab === "users" && <UsersTable />}
      {tab === "donations" && <DonationsTable />}
    </div>
  );
}

function Overview() {
  const { data, loading, error } = useApi("/admin/overview");
  if (loading) return <PageLoader />;
  if (error) return <Alert>{error}</Alert>;

  const last30 = data.daily.reduce((s, d) => s + d.amount, 0);
  const cards = [
    { icon: Heart, label: "Total raised", value: formatMoney(data.raised), sub: `${data.donations} donations` },
    { icon: Heart, label: "Last 30 days", value: formatMoney(last30), sub: `${data.daily.reduce((s, d) => s + d.count, 0)} donations` },
    { icon: Users, label: "Users", value: data.counts.users },
    { icon: Megaphone, label: "Campaigns", value: data.counts.campaigns },
    { icon: PenLine, label: "Posts", value: data.counts.posts },
    { icon: Package, label: "Items", value: data.counts.items },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="card p-5">
            <Icon size={20} className="text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Recent donations</h2>
          <ul className="divide-y divide-gray-100 text-sm">
            {data.recentDonations.map((d) => (
              <li key={d._id} className="py-3 flex justify-between gap-3">
                <span>
                  <strong>{d.donor?.username || "Deleted user"}</strong>
                  {d.anonymous && <span className="text-xs text-gray-400"> (anonymous)</span>} →{" "}
                  {d.campaign ? <Link to={`/campaigns/${d.campaign._id}`} className="text-blue-600 hover:underline">{d.campaign.title}</Link> : "Deleted campaign"}
                </span>
                <span className="font-semibold whitespace-nowrap">{formatMoney(d.amount)}</span>
              </li>
            ))}
            {!data.recentDonations.length && <li className="py-3 text-gray-500">No donations yet.</li>}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Newest members</h2>
          <ul className="divide-y divide-gray-100 text-sm">
            {data.recentUsers.map((u) => (
              <li key={u._id} className="py-3 flex items-center gap-3">
                <Avatar user={u} size={32} />
                <div className="flex-1">
                  <Link to={`/users/${u._id}`} className="font-medium hover:text-blue-600">{u.username}</Link>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <span className="text-xs text-gray-400">{formatDate(u.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function UsersTable() {
  const { user: me } = useAuth();
  const { data, setData, loading, error } = useApi("/admin/users");
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (data || []).filter((u) => u.username.toLowerCase().includes(q) || u.email.includes(q));
  }, [data, search]);

  if (loading) return <PageLoader />;
  if (error) return <Alert>{error}</Alert>;

  const update = async (id, changes) => {
    setActionError("");
    try {
      const res = await api.patch(`/admin/users/${id}`, changes);
      setData(data.map((u) => (u._id === id ? { ...u, ...res.data } : u)));
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const exportCsv = () =>
    downloadCsv("unitree-users.csv", [
      ["Username", "Email", "Role", "Phone", "Location", "Joined", "Last login", "Logins", "Campaigns", "Donations", "Donated", "Items", "Posts", "Blocked"],
      ...data.map((u) => [
        u.username, u.email, u.role, u.phone, u.location, u.createdAt, u.lastLogin, u.loginCount,
        u.stats.campaigns, u.stats.donations, u.stats.donated, u.stats.items, u.stats.posts, u.isBlocked,
      ]),
    ]);

  return (
    <div className="card overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row gap-3 justify-between border-b border-gray-100">
        <div className="relative sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input pl-9 text-sm" />
        </div>
        <button onClick={exportCsv} className="btn-outline text-sm"><Download size={16} /> Export CSV ({data.length})</button>
      </div>
      {actionError && <div className="p-4"><Alert>{actionError}</Alert></div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="p-3">User</th><th className="p-3">Joined</th><th className="p-3">Last login</th>
              <th className="p-3">Campaigns</th><th className="p-3">Donated</th><th className="p-3">Items</th><th className="p-3">Posts</th>
              <th className="p-3">Role</th><th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id} className="border-t border-gray-100">
                <td className="p-3">
                  <Link to={`/users/${u._id}`} className="flex items-center gap-2 hover:text-blue-600">
                    <Avatar user={u} size={28} />
                    <span><span className="font-medium">{u.username}</span><br /><span className="text-xs text-gray-500">{u.email}</span></span>
                  </Link>
                </td>
                <td className="p-3 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                <td className="p-3 whitespace-nowrap">{u.lastLogin ? formatDateTime(u.lastLogin) : "-"}</td>
                <td className="p-3">{u.stats.campaigns}</td>
                <td className="p-3 whitespace-nowrap">{formatMoney(u.stats.donated)} <span className="text-xs text-gray-400">({u.stats.donations})</span></td>
                <td className="p-3">{u.stats.items}</td>
                <td className="p-3">{u.stats.posts}</td>
                <td className="p-3">
                  <select value={u.role} disabled={u._id === me._id} onChange={(e) => update(u._id, { role: e.target.value })} className="border rounded px-2 py-1 text-xs">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-3">
                  <button disabled={u._id === me._id} onClick={() => update(u._id, { isBlocked: !u.isBlocked })}
                    className={`text-xs px-2 py-1 rounded cursor-pointer disabled:opacity-40 ${u.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {u.isBlocked ? "Blocked" : "Active"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DonationsTable() {
  const { data, loading, error } = useApi("/admin/donations");
  if (loading) return <PageLoader />;
  if (error) return <Alert>{error}</Alert>;

  const exportCsv = () =>
    downloadCsv("unitree-donations.csv", [
      ["Date", "Reference", "Donor", "Donor email", "Campaign", "Amount", "Method", "Anonymous", "Message"],
      ...data.map((d) => [d.createdAt, d.reference, d.donor?.username, d.donor?.email, d.campaign?.title, d.amount, d.paymentMethod, d.anonymous, d.message]),
    ]);

  return (
    <div className="card overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-gray-100">
        <p className="text-sm text-gray-600">{data.length} donations</p>
        <button onClick={exportCsv} className="btn-outline text-sm"><Download size={16} /> Export CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr><th className="p-3">Date</th><th className="p-3">Reference</th><th className="p-3">Donor</th><th className="p-3">Campaign</th><th className="p-3">Amount</th><th className="p-3">Method</th></tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d._id} className="border-t border-gray-100">
                <td className="p-3 whitespace-nowrap">{formatDateTime(d.createdAt)}</td>
                <td className="p-3 font-mono text-xs">{d.reference}</td>
                <td className="p-3">{d.donor?.username || "-"} {d.anonymous && <span className="text-xs text-gray-400">(anon)</span>}<br /><span className="text-xs text-gray-500">{d.donor?.email}</span></td>
                <td className="p-3">{d.campaign?.title || "Deleted"}</td>
                <td className="p-3 font-semibold">{formatMoney(d.amount)}</td>
                <td className="p-3 capitalize">{d.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
