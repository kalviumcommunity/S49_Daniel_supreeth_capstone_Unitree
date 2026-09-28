import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Megaphone } from "lucide-react";
import useApi from "../lib/useApi";
import { CampaignCard } from "../components/Cards";
import { Alert, EmptyState, PageLoader, Pagination } from "../components/ui";

export default function BrowseCampaigns() {
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", category: "All", sort: "newest", status: "active", page: 1 });
  const { data: categories } = useApi("/campaigns/categories");
  const { data, loading, error } = useApi("/campaigns", { ...filters, limit: 9 });

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput, page: 1 })), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="page">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-700 mb-3">Browse Campaigns</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Explore campaigns and contribute to make a difference. Every small donation adds up to create real
            impact.
          </p>
        </div>

        <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search campaigns..."
              className="input pl-10"
            />
          </div>
          <select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)} className="input md:w-44">
            <option value="newest">Newest</option>
            <option value="popular">Most donations</option>
            <option value="funded">Most funded</option>
            <option value="ending">Ending soon</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className="input md:w-40">
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {["All", ...(categories || [])].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter("category", cat)}
              className={`px-4 py-1.5 rounded-full text-sm transition cursor-pointer ${
                filters.category === cat ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-blue-50 shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Alert>{error}</Alert>

        {loading ? (
          <PageLoader />
        ) : data?.campaigns.length ? (
          <>
            <p className="text-sm text-gray-500 mb-4">{data.total} campaign{data.total === 1 ? "" : "s"} found</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.campaigns.map((c) => (
                <CampaignCard key={c._id} campaign={c} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
          </>
        ) : (
          !error && (
            <EmptyState
              icon={Megaphone}
              title="No campaigns found"
              text="Try a different search or category, or start your own."
              action={<Link to="/start-campaign" className="btn-accent">Start a Campaign</Link>}
            />
          )
        )}
      </div>
    </div>
  );
}
