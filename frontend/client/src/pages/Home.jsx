import { Link } from "react-router-dom";
import { Heart, Box, TrendingUp, PenLine } from "lucide-react";
import useApi from "../lib/useApi";
import { formatMoney } from "../lib/format";
import { CampaignCard, PostCard } from "../components/Cards";
import { PageLoader } from "../components/ui";

const steps = [
  {
    icon: Heart,
    title: "Support Campaigns",
    text: "Browse meaningful campaigns and donate money to help them reach their goals.",
  },
  {
    icon: Box,
    title: "Donate Items",
    text: "List physical items you no longer need. People nearby can claim them.",
  },
  {
    icon: PenLine,
    title: "Share Stories",
    text: "Write blog posts and campaign updates to keep your supporters informed.",
  },
  {
    icon: TrendingUp,
    title: "Make Impact",
    text: "Watch your contributions create real change in people's lives.",
  },
];

export default function HomePage() {
  const { data: stats } = useApi("/stats");
  const { data: featured, loading } = useApi("/campaigns", { sort: "popular", status: "active", limit: 3 });
  const { data: blog } = useApi("/posts", { limit: 3 });

  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-500 to-blue-600 text-center text-white py-24 px-6">
        <span className="inline-block bg-blue-400/30 px-4 py-2 rounded-full mb-6 border border-white/30">
          Help others, make a difference
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Fund Dreams, Share Resources</h1>
        <p className="max-w-2xl mx-auto text-lg text-blue-100 mb-8">
          A community-powered platform where you can support campaigns with donations or list items to help others.
          Every contribution creates impact.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/campaigns"
            className="bg-orange-500 hover:bg-orange-600 transition-all px-6 py-3 rounded-lg text-white font-medium"
          >
            Browse Campaigns
          </Link>
          <Link
            to="/donate-items"
            className="bg-white/10 border border-white hover:bg-white/20 transition-all px-6 py-3 rounded-lg text-white font-medium"
          >
            Donate Items
          </Link>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="max-w-5xl mx-auto -mt-10 px-6">
          <div className="card grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 py-6">
            {[
              [formatMoney(stats.raised), "Raised"],
              [stats.donations, "Donations"],
              [stats.campaigns, "Campaigns"],
              [stats.users, "Members"],
            ].map(([value, label]) => (
              <div key={label} className="text-center px-4 py-2">
                <p className="text-2xl md:text-3xl font-bold text-blue-600">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section id="how" className="py-16 text-center px-6">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-gray-600 mb-10">Simple ways to make a difference in your community</p>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card hover:shadow-lg transition-all p-8">
              <div className="flex justify-center mb-4">
                <Icon className="text-blue-500" size={40} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 px-6 bg-white" id="browse">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Campaigns</h2>
            <Link to="/campaigns" className="text-blue-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
          {loading ? (
            <PageLoader />
          ) : featured?.campaigns.length ? (
            <div className="grid md:grid-cols-3 gap-8">
              {featured.campaigns.map((c) => (
                <CampaignCard key={c._id} campaign={c} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No campaigns yet.{" "}
              <Link to="/start-campaign" className="text-blue-600 hover:underline">
                Be the first to start one!
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Latest stories */}
      {blog?.posts.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Stories from the Community</h2>
              <Link to="/blog" className="text-blue-600 hover:underline font-medium">
                Read the blog →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {blog.posts.map((p) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to action */}
      <section className="bg-orange-500 text-white text-center py-16 px-6">
        <h2 className="text-3xl font-bold mb-3">Have a cause that needs support?</h2>
        <p className="text-orange-100 mb-8 max-w-xl mx-auto">
          Start a campaign in minutes and share it with people who care.
        </p>
        <Link to="/start-campaign" className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-lg hover:bg-orange-50 transition">
          Start a Campaign
        </Link>
      </section>
    </div>
  );
}
