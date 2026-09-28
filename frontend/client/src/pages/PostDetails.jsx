import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Heart, MessageCircle, Eye, Pencil, Trash2, Send } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import useApi from "../lib/useApi";
import { useAuth } from "../context/AuthContext";
import { formatDate, timeAgo } from "../lib/format";
import { Alert, Avatar, PageLoader, Spinner } from "../components/ui";

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: post, setData: setPost, loading, error } = useApi(`/posts/${id}`);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  if (loading) return <PageLoader />;
  if (error || !post) {
    return (
      <div className="page max-w-xl text-center">
        <Alert>{error || "Post not found"}</Alert>
        <Link to="/blog" className="btn-primary mt-6">Back to Blog</Link>
      </div>
    );
  }

  const isAuthor = user && (user._id === post.author?._id || user.role === "admin");
  const liked = user && post.likes.includes(user._id);
  const requireLogin = () => navigate("/login", { state: { from: location.pathname } });

  const toggleLike = async () => {
    if (!user) return requireLogin();
    try {
      const res = await api.post(`/posts/${id}/like`);
      setPost({
        ...post,
        likes: res.data.liked ? [...post.likes, user._id] : post.likes.filter((l) => l !== user._id),
      });
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setBusy(true);
    setActionError("");
    try {
      const res = await api.post(`/posts/${id}/comments`, { text: comment });
      setPost({ ...post, comments: res.data });
      setComment("");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await api.delete(`/posts/${id}/comments/${commentId}`);
      setPost({ ...post, comments: res.data });
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const deletePost = async () => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate("/blog");
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div className="page max-w-3xl">
      <Link to="/blog" className="text-blue-600 hover:underline text-sm">← Back to Blog</Link>

      <article className="card overflow-hidden mt-4">
        {post.coverImage && <img src={post.coverImage} alt={post.title} className="w-full h-72 md:h-96 object-cover" />}
        <div className="p-6 md:p-10">
          {post.campaign && (
            <Link to={`/campaigns/${post.campaign._id}`} className="inline-block text-sm font-semibold text-orange-600 hover:underline mb-2">
              Update for: {post.campaign.title}
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {post.author && (
              <Link to={`/users/${post.author._id}`} className="flex items-center gap-3 hover:text-blue-600">
                <Avatar user={post.author} size={40} />
                <div>
                  <p className="font-medium">{post.author.username}</p>
                  <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
                </div>
              </Link>
            )}
            {isAuthor && (
              <div className="flex gap-2">
                <Link to={`/blog/${id}/edit`} className="btn-outline text-sm"><Pencil size={14} /> Edit</Link>
                <button onClick={deletePost} className="btn-danger text-sm"><Trash2 size={14} /> Delete</button>
              </div>
            )}
          </div>

          <div className="prose-text text-lg">{post.content}</div>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {post.tags.map((t) => (
                <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100">
                  #{t}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-100 text-gray-600">
            <button onClick={toggleLike} className={`flex items-center gap-2 cursor-pointer transition ${liked ? "text-red-500" : "hover:text-red-500"}`}>
              <Heart size={20} className={liked ? "fill-red-500" : ""} /> {post.likes.length}
            </button>
            <span className="flex items-center gap-2"><MessageCircle size={20} /> {post.comments.length}</span>
            <span className="flex items-center gap-2"><Eye size={20} /> {post.views}</span>
          </div>
        </div>
      </article>

      <section className="card p-6 md:p-8 mt-6">
        <h2 className="text-xl font-semibold mb-4">Comments ({post.comments.length})</h2>
        <Alert>{actionError}</Alert>

        {user ? (
          <form onSubmit={addComment} className="flex gap-3 my-4">
            <Avatar user={user} size={36} />
            <input value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} placeholder="Write a comment..." className="input" />
            <button disabled={busy || !comment.trim()} className="btn-primary" aria-label="Post comment">
              {busy ? <Spinner size={16} /> : <Send size={16} />}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-600 my-4">
            <button onClick={requireLogin} className="text-blue-600 hover:underline cursor-pointer">Log in</button> to join the conversation.
          </p>
        )}

        <ul className="space-y-5 mt-6">
          {[...post.comments].reverse().map((c) => (
            <li key={c._id} className="flex gap-3">
              <Avatar user={c.author || { username: "?" }} size={36} />
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm">{c.author?.username || "Deleted user"}</span>
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    {timeAgo(c.createdAt)}
                    {user && (isAuthor || c.author?._id === user._id) && (
                      <button onClick={() => deleteComment(c._id)} className="hover:text-red-500 cursor-pointer" aria-label="Delete comment">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
