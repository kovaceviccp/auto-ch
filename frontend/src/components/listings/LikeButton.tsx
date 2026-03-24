"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";

interface Props {
  listingId: number;
  sellerId?: number;
  size?: "sm" | "md";
}

export function LikeButton({ listingId, sellerId, size = "md" }: Props) {
  const { user } = useAuthStore();
  const router = useRouter();
  const t = useT();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/listings/${listingId}/like/status`)
      .then((r) => { setLiked(r.data.liked); setCount(r.data.count); })
      .catch(() => {});
  }, [listingId, user]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push("/auth/login"); return; }
    setLoading(true);
    try {
      const r = await api.post(`/listings/${listingId}/like`);
      setLiked(r.data.liked);
      setCount(r.data.count);
      setPopping(true);
      setTimeout(() => setPopping(false), 500);
    } catch {}
    finally { setLoading(false); }
  };

  if (user && sellerId && user.id === sellerId) return null;

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const btnSize = size === "sm" ? "px-2 py-1 text-xs gap-1" : "px-3 py-1.5 text-sm gap-1.5";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={liked ? t("unlike_btn") : t("like_btn")}
      className={`flex items-center ${btnSize} rounded-lg border transition-all ${
        liked
          ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
          : "bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200"
      }`}
    >
      <Heart className={`${iconSize} ${liked ? "fill-current" : ""} ${popping ? "animate-like-pop" : ""}`} />
      {count > 0 && <span className="font-medium">{count}</span>}
    </button>
  );
}
