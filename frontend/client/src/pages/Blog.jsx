import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, PenLine, BookOpen, X } from "lucide-react";
import useApi from "../lib/useApi";
import { PostCard } from "../components/Cards";
import { Alert, EmptyState, PageLoader, Pagination } from "../components/ui";

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get("tag") || "";
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, loading, error } = useApi("/posts", { search, tag, page, limit: 9 });

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="page">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-700 mb-2">Community Blog</h1>
          <p className="text-gray-600">Stories, updates and thank-yous from people on Unitree.</p>
        </div>
        <Link to="/blog/new" className="btn-primary"><PenLine size={18} /> Write a post</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search posts..." className="input pl-10" />
        </div>
        {tag && (
          <button onClick={() => setSearchParams({})} className="btn-outline">
            #{tag} <X size={14} />
          </button>
        )}
      </div>

      <Alert>{error}</Alert>

      {loading ? (
        <PageLoader />
      ) : data?.posts.length ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.posts.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      ) : (
        !error && (
          <EmptyState
            icon={BookOpen}
            title="No posts yet"
            text="Share your story, a campaign update, or a thank-you to your donors."
            action={<Link to="/blog/new" className="btn-primary">Write the first post</Link>}
          />
        )
      )}
    </div>
  );
}
