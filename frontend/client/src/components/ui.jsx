import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { percent } from "../lib/format";

export function Spinner({ size = 20, className = "" }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex justify-center items-center py-24 text-blue-600">
      <Spinner size={36} />
    </div>
  );
}

export function Alert({ type = "error", children }) {
  if (!children) return null;
  const styles =
    type === "success"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-red-50 text-red-700 border-red-200";
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`flex items-start gap-2 border rounded-lg px-4 py-3 text-sm ${styles}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="text-center py-16 px-6 card">
      {Icon && <Icon size={40} className="mx-auto text-blue-300 mb-3" />}
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      {text && <p className="text-gray-500 text-sm mb-4">{text}</p>}
      {action}
    </div>
  );
}

export function ProgressBar({ raised, goal, className = "h-2" }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div
        className="bg-blue-500 h-full rounded-full transition-all duration-700"
        style={{ width: `${percent(raised, goal)}%` }}
      />
    </div>
  );
}

export function Avatar({ user, size = 36 }) {
  const name = user?.username || "?";
  const style = { width: size, height: size, fontSize: size * 0.42 };
  if (user?.avatar) {
    return <img src={user.avatar} alt={name} style={style} className="rounded-full object-cover shrink-0" />;
  }
  return (
    <span
      style={style}
      className="rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center shrink-0 uppercase"
    >
      {name.charAt(0)}
    </span>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-3 mt-10">
      <button className="btn-outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page {page} of {pages}
      </span>
      <button className="btn-outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    active: "bg-green-100 text-green-700",
    available: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    donated: "bg-blue-100 text-blue-700",
    claimed: "bg-amber-100 text-amber-700",
    closed: "bg-gray-200 text-gray-600",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${styles[status] || styles.closed}`}>
      {status}
    </span>
  );
}
