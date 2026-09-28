import { Link } from "react-router-dom";
import { Heart, MapPin, MessageCircle, Package, ImageOff } from "lucide-react";
import { formatMoney, percent, timeAgo, daysLeft } from "../lib/format";
import { ProgressBar, StatusBadge } from "./ui";

function Cover({ src, alt, className = "h-48" }) {
  if (!src) {
    return (
      <div className={`w-full ${className} bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center`}>
        <ImageOff className="text-blue-300" size={36} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full ${className} object-cover transition-transform duration-500 group-hover:scale-105`}
    />
  );
}

export function CampaignCard({ campaign: c }) {
  const left = daysLeft(c.deadline);
  return (
    <Link
      to={`/campaigns/${c._id}`}
      className="group card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col"
    >
      <div className="relative overflow-hidden">
        <Cover src={c.image} alt={c.title} />
        <span className="absolute top-3 right-3 bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow">
          {c.category}
        </span>
        {c.status !== "active" && (
          <span className="absolute top-3 left-3">
            <StatusBadge status={c.status} />
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{c.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{c.summary}</p>
        <ProgressBar raised={c.raised} goal={c.goal} className="h-2 mb-3" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            <strong>{formatMoney(c.raised)}</strong> of {formatMoney(c.goal)}
          </span>
          <span className="font-medium text-blue-600">{percent(c.raised, c.goal)}%</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <Heart size={12} className="text-orange-500" /> {c.donationCount} donation{c.donationCount === 1 ? "" : "s"}
          </span>
          {left !== null && c.status === "active" && (
            <span>{left > 0 ? `${left} days left` : "Ended"}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ItemCard({ item }) {
  return (
    <Link
      to={`/items/${item._id}`}
      className="group card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col"
    >
      <div className="relative overflow-hidden">
        {item.images?.[0] ? (
          <Cover src={item.images[0]} alt={item.name} className="h-44" />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-orange-50 to-blue-100 flex items-center justify-center">
            <Package className="text-blue-300" size={40} />
          </div>
        )}
        <span className="absolute top-3 right-3">
          <StatusBadge status={item.status} />
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">{item.description}</p>
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {item.category} · {item.condition} · Qty {item.quantity}
          </span>
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {item.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function PostCard({ post }) {
  return (
    <Link
      to={`/blog/${post._id}`}
      className="group card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col"
    >
      <div className="overflow-hidden">
        <Cover src={post.coverImage} alt={post.title} className="h-44" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        {post.campaign && (
          <span className="text-xs font-semibold text-orange-600 mb-1 line-clamp-1">
            Update · {post.campaign.title}
          </span>
        )}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            {post.author?.username || "Unknown"} · {timeAgo(post.createdAt)}
          </span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart size={12} /> {post.likeCount ?? post.likes?.length ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={12} /> {post.commentCount ?? 0}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
