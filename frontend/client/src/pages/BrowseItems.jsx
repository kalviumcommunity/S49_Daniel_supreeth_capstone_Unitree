import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Package } from "lucide-react";
import useApi from "../lib/useApi";
import { ItemCard } from "../components/Cards";
import { Alert, EmptyState, PageLoader, Pagination } from "../components/ui";

export default function BrowseItems() {
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", category: "All", status: "available", page: 1 });
  const { data: categories } = useApi("/items/categories");
  const { data, loading, error } = useApi("/items", { ...filters, limit: 12 });

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput, page: 1 })), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="page">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-700 mb-2">Donated Items</h1>
            <p className="text-gray-600">Free items shared by the community. Claim what you need.</p>
          </div>
          <Link to="/donate-items" className="btn-accent">Donate an item</Link>
        </div>

        <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search items or locations..." className="input pl-10" />
          </div>
          <select value={filters.category} onChange={(e) => setFilter("category", e.target.value)} className="input md:w-44">
            {["All", ...(categories || [])].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className="input md:w-40">
            <option value="available">Available</option>
            <option value="claimed">Claimed</option>
            <option value="donated">Donated</option>
            <option value="all">All</option>
          </select>
        </div>

        <Alert>{error}</Alert>

        {loading ? (
          <PageLoader />
        ) : data?.items.length ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
          </>
        ) : (
          !error && (
            <EmptyState
              icon={Package}
              title="No items found"
              text="Nothing matches right now. Have something to give away?"
              action={<Link to="/donate-items" className="btn-accent">Donate an item</Link>}
            />
          )
        )}
      </div>
    </div>
  );
}
