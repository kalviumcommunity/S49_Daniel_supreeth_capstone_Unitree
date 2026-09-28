import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../lib/api";
import useApi from "../lib/useApi";
import { useAuth } from "../context/AuthContext";
import ImagePicker from "../components/ImagePicker";
import { Alert, PageLoader, Spinner } from "../components/ui";

// Used for both writing (/blog/new) and editing (/blog/:id/edit) posts
export default function PostEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: existing, loading, error: loadError } = useApi(isEdit ? `/posts/${id}` : null);
  const { data: mine } = useApi("/campaigns", { creator: user._id, status: "all", limit: 50 });

  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    coverImage: "",
    campaign: searchParams.get("campaign") || "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setForm({
      title: existing.title,
      content: existing.content,
      tags: (existing.tags || []).join(", "),
      coverImage: existing.coverImage || "",
      campaign: existing.campaign?._id || "",
    });
  }, [existing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, campaign: form.campaign || null };
      const res = isEdit ? await api.put(`/posts/${id}`, payload) : await api.post("/posts", payload);
      navigate(`/blog/${res.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loading) return <PageLoader />;
  if (loadError) return <div className="page max-w-xl"><Alert>{loadError}</Alert></div>;

  return (
    <div className="page max-w-3xl">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">{isEdit ? "Edit Post" : "Write a Post"}</h1>
      <p className="text-gray-600 mb-8">Share your story, a campaign update, or a thank-you note.</p>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} maxLength={150} required className="input text-lg" placeholder="Give your post a title" />
        </div>

        <div>
          <label className="label" htmlFor="content">Content</label>
          <textarea id="content" name="content" rows="12" value={form.content} onChange={handleChange} maxLength={20000} required className="input leading-relaxed" placeholder="Write your story..." />
          <p className="text-xs text-gray-400 text-right mt-1">{form.content.length} / 20000</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="tags">Tags</label>
            <input id="tags" name="tags" value={form.tags} onChange={handleChange} className="input" placeholder="update, thank-you" />
            <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
          </div>
          <div>
            <label className="label" htmlFor="campaign">Link to one of your campaigns</label>
            <select id="campaign" name="campaign" value={form.campaign} onChange={handleChange} className="input">
              <option value="">None (general post)</option>
              {mine?.campaigns.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <ImagePicker label="Cover image (optional)" value={form.coverImage} onChange={(coverImage) => setForm({ ...form, coverImage })} />

        <Alert>{error}</Alert>

        <div className="flex gap-3">
          <Link to={isEdit ? `/blog/${id}` : "/blog"} className="btn-outline flex-1">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5">
            {submitting && <Spinner size={18} />} {isEdit ? "Save changes" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
