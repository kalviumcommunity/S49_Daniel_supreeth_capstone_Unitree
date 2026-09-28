import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../lib/api";
import useApi from "../lib/useApi";
import ImagePicker from "../components/ImagePicker";
import { Alert, PageLoader, Spinner } from "../components/ui";

const EMPTY = { name: "", description: "", category: "Other", condition: "Good", quantity: 1, location: "", images: [] };
const CONDITIONS = ["New", "Like new", "Good", "Fair"];

// Used for both listing a new item (/donate-items) and editing one (/items/:id/edit)
export default function DonateItems() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: categories } = useApi("/items/categories");
  const { data: existing, loading, error: loadError } = useApi(isEdit ? `/items/${id}` : null);

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!existing) return;
    const { name, description, category, condition, quantity, location, images } = existing;
    setForm({ name, description, category, condition, quantity, location: location || "", images: images || [] });
  }, [existing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, quantity: Number(form.quantity) };
      const res = isEdit ? await api.put(`/items/${id}`, payload) : await api.post("/items", payload);
      navigate(`/items/${res.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loading) return <PageLoader />;
  if (loadError) return <div className="page max-w-xl"><Alert>{loadError}</Alert></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="page max-w-xl">
        <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">{isEdit ? "Edit Item" : "Donate Items"}</h1>
        <p className="text-center text-gray-600 mb-8">
          List something you no longer need. Someone in the community can claim it, and you&apos;ll arrange the handover.
        </p>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label" htmlFor="name">Item name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} maxLength={100} required className="input" placeholder="e.g. Winter jacket" />
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="3" value={form.description} onChange={handleChange} maxLength={2000} required className="input" placeholder="Size, brand, any defects, pickup details..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="category">Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange} className="input">
                {(categories || [form.category]).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="condition">Condition</label>
              <select id="condition" name="condition" value={form.condition} onChange={handleChange} className="input">
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="quantity">Quantity</label>
              <input id="quantity" name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="location">Pickup location</label>
              <input id="location" name="location" value={form.location} onChange={handleChange} maxLength={100} className="input" placeholder="City / area" />
            </div>
          </div>

          <ImagePicker label="Photos (up to 5)" multiple value={form.images} onChange={(images) => setForm({ ...form, images })} />

          <Alert>{error}</Alert>

          <button type="submit" disabled={submitting} className="btn-accent w-full py-2.5">
            {submitting && <Spinner size={18} />} {isEdit ? "Save changes" : "Donate Item"}
          </button>
        </form>

        <Link to="/items" className="block text-center mt-8 text-blue-600 hover:underline">
          ← Browse donated items
        </Link>
      </div>
    </div>
  );
}
