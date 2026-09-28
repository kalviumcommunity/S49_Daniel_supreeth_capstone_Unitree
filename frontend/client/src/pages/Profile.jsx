import { Link, useParams } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import useApi from "../lib/useApi";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatMoney } from "../lib/format";
import { CampaignCard, ItemCard, PostCard } from "../components/Cards";
import { Alert, Avatar, PageLoader } from "../components/ui";

export default function Profile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const { data, loading, error } = useApi(`/users/${id}`);

  if (loading) return <PageLoader />;
  if (error || !data) return <div className="page max-w-xl"><Alert>{error || "User not found"}</Alert></div>;

  const { user, campaigns, posts, items, donations } = data;

  return (
    <div className="page">
      <div className="card p-8 mb-10 flex flex-col md:flex-row items-center gap-6">
        <Avatar user={user} size={96} />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-1">{user.username}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 mb-3">
            {user.location && <span className="flex items-center gap-1"><MapPin size={14} /> {user.location}</span>}
            <span className="flex items-center gap-1"><Calendar size={14} /> Joined {formatDate(user.createdAt)}</span>
          </div>
          {user.bio && <p className="text-gray-700 max-w-2xl">{user.bio}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <Stat value={campaigns.length} label="Campaigns" />
          <Stat value={formatMoney(donations.total)} label="Donated" />
          <Stat value={items.length} label="Items shared" />
          <Stat value={posts.length} label="Posts" />
        </div>
      </div>
      {me?._id === user._id && (
        <p className="text-sm text-gray-500 -mt-6 mb-8 text-center md:text-right">
          This is your public profile. <Link to="/dashboard?tab=settings" className="text-blue-600 hover:underline">Edit profile</Link>
        </p>
      )}

      <Section title="Campaigns" empty="No campaigns yet." show={campaigns.length}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => <CampaignCard key={c._id} campaign={c} />)}
        </div>
      </Section>

      <Section title="Posts" empty="No posts yet." show={posts.length}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <PostCard key={p._id} post={{ ...p, excerpt: p.content.slice(0, 220), likeCount: p.likes.length, author: user }} />
          ))}
        </div>
      </Section>

      <Section title="Items shared" empty="No items shared yet." show={items.length}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((i) => <ItemCard key={i._id} item={i} />)}
        </div>
      </Section>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="bg-blue-50 rounded-xl px-4 py-3 min-w-28">
      <p className="text-xl font-bold text-blue-700">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Section({ title, empty, show, children }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {show ? children : <p className="text-gray-500">{empty}</p>}
    </section>
  );
}
