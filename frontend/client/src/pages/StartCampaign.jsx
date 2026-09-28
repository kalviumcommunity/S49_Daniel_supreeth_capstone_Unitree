import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../lib/api";
import useApi from "../lib/useApi";
import { currencySymbol } from "../lib/format";
import ImagePicker from "../components/ImagePicker";
import { Alert, PageLoader, Spinner } from "../components/ui";

const EMPTY = { title: "", summary: "", story: "", category: "Community", goal: "", location: "", deadline: "", image: "" };

// Used for both creating (/start-campaign) and editing (/campaigns/:id/edit)
export default function StartCampaign() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: categories } = useApi("/campaigns/categories");
  const { data: existing, loading, error: loadError } = useApi(isEdit ? `/campaigns/${id}` : null);

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!existing) return;
    const c = existing.campaign;
    setForm({
      title: c.title,
      summary: c.summary,
      story: c.story,
      category: c.category,
      goal: String(c.goal),
      location: c.location || "",
      deadline: c.deadline ? c.deadline.slice(0, 10) : "",
      image: c.image || "",
    });
  }, [existing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, goal: Number(form.goal), deadline: form.deadline || null };
      const res = isEdit ? await api.put(`/campaigns/${id}`, payload) : await api.post("/campaigns", payload);
      navigate(`/campaigns/${res.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loading) return <PageLoader />;
  if (loadError) return <div className="page max-w-xl"><Alert>{loadError}</Alert></div>;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="page max-w-2xl">
        <h1 className="text-4xl font-bold text-blue-700 mb-2 text-center">
          {isEdit ? "Edit Campaign" : "Start a Campaign"}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isEdit ? "Keep your supporters up to date." : "Tell your story and set a goal. It only takes a few minutes."}
        </p>

        <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5">
          <div>
            <label className="label" htmlFor="title">Campaign title</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} maxLength={120} required className="input" placeholder="e.g. Help build a community garden" />
          </div>

          <div>
            <label className="label" htmlFor="summary">Short summary</label>
            <input id="summary" name="summary" value={form.summary} onChange={handleChange} maxLength={200} required className="input" placeholder="One sentence people will see on the campaign card" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="category">Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange} className="input">
                {(categories || [form.category]).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="goal">Goal amount ({currencySymbol})</label>
              <input id="goal" name="goal" type="number" min="1" value={form.goal} onChange={handleChange} required className="input" placeholder="5000" />
            </div>
            <div>
              <label className="label" htmlFor="location">Location</label>
              <input id="location" name="location" value={form.location} onChange={handleChange} maxLength={100} className="input" placeholder="City (optional)" />
            </div>
            <div>
              <label className="label" htmlFor="deadline">End date</label>
              <input id="deadline" name="deadline" type="date" min={isEdit ? undefined : today} value={form.deadline} onChange={handleChange} className="input" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="story">Your story</label>
            <textarea id="story" name="story" rows="8" value={form.story} onChange={handleChange} required maxLength={10000} className="input" placeholder="Why are you raising money? Who will it help? How will the funds be used?" />
          </div>

          <ImagePicker label="Cover photo" value={form.image} onChange={(image) => setForm({ ...form, image })} />

          <Alert>{error}</Alert>

          <div className="flex gap-3">
            <Link to={isEdit ? `/campaigns/${id}` : "/campaigns"} className="btn-outline flex-1">Cancel</Link>
            <button type="submit" disabled={submitting} className="btn-accent flex-1 py-2.5">
              {submitting && <Spinner size={18} />} {isEdit ? "Save changes" : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
