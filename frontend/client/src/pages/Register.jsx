import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/api";
import { Alert, Spinner } from "../components/ui";

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password });
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { name: "username", label: "Username", type: "text", placeholder: "Your Name", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email" },
    { name: "password", label: "Password", type: "password", placeholder: "At least 6 characters", autoComplete: "new-password" },
    { name: "confirm", label: "Confirm password", type: "password", placeholder: "Repeat your password", autoComplete: "new-password" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-200 py-12">
      <div className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-8 w-[90%] max-w-md transition-all hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-2">Create Your Account</h2>
        <p className="text-center text-gray-500 text-sm mb-6">Start campaigns, donate, and share your story.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="label" htmlFor={f.name}>{f.label}</label>
              <input
                id={f.name}
                {...f}
                value={form[f.name]}
                onChange={handleChange}
                className="input focus:ring-orange-400"
                required
              />
            </div>
          ))}

          <Alert>{error}</Alert>

          <button
            type="submit"
            disabled={submitting}
            className="btn-accent w-full bg-orange-600 hover:bg-orange-700 py-2.5"
          >
            {submitting && <Spinner size={18} />} Sign Up
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-600 hover:underline font-medium transition">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
