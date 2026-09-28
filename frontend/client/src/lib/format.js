const CURRENCY = import.meta.env.VITE_CURRENCY || "USD";

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export const formatMoney = (n) => currencyFormatter.format(Number(n) || 0);

export const currencySymbol =
  currencyFormatter.formatToParts(0).find((p) => p.type === "currency")?.value || "$";

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";

export function timeAgo(d) {
  const seconds = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export function daysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

export const percent = (raised, goal) => Math.min(100, Math.round(((raised || 0) / (goal || 1)) * 100));
