"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Listing } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Clock } from "lucide-react";

export function RecentlyViewed() {
  const { get } = useRecentlyViewed();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = get();
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    Promise.all(ids.map((id) => api.get(`/listings/${id}`).then((r) => r.data).catch(() => null)))
      .then((results) => {
        setListings(results.filter(Boolean) as Listing[]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || listings.length < 2) return null;

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8001";

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-900">Zuletzt angesehen</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 group"
            style={{ width: "160px" }}
          >
            <div className="h-24 bg-gray-100 overflow-hidden">
              {listing.images.length > 0 ? (
                <img
                  src={`${apiBase}${listing.images[0]}`}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  Kein Bild
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p
                className="text-xs font-medium text-gray-800 leading-tight"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {listing.title}
              </p>
              <p className="text-xs font-bold text-primary-700 mt-1.5">
                {formatPrice(listing.price_chf)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
