"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Listing, ListingsResponse } from "@/types";
import { formatPrice, formatMileage } from "@/lib/utils";
import Link from "next/link";
import { Calendar, Gauge, ChevronRight } from "lucide-react";

interface SellerListingsProps {
  sellerId: number;
  currentListingId: number;
  sellerName?: string;
}

export function SellerListings({ sellerId, currentListingId, sellerName }: SellerListingsProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8001";

  const { data, isLoading } = useQuery<ListingsResponse>({
    queryKey: ["seller-listings", sellerId],
    queryFn: async () => {
      const { data } = await api.get(`/listings?seller_id=${sellerId}&per_page=10`);
      return data;
    },
    enabled: !!sellerId,
  });

  const others = data?.items.filter((l) => l.id !== currentListingId) ?? [];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!others.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          Weitere Fahrzeuge von {sellerName || "diesem Verkäufer"}
        </h3>
        <Link
          href={`/sellers/${sellerId}`}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
        >
          Alle anzeigen <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {others.slice(0, 6).map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${listing.id}`}
            className="group block rounded-xl overflow-hidden border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all duration-200"
          >
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
              {listing.images[0] ? (
                <img
                  src={`${apiBase}${listing.images[0]}`}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                  <span className="text-xs text-primary-300">Kein Bild</span>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-700 transition-colors">
                {listing.make} {listing.model}
              </p>
              <p className="text-sm font-bold text-primary-700 mt-0.5">
                {formatPrice(listing.price_chf)}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-0.5">
                  <Calendar className="w-3 h-3" /> {listing.year}
                </span>
                {listing.mileage_km != null && (
                  <span className="flex items-center gap-0.5">
                    <Gauge className="w-3 h-3" /> {formatMileage(listing.mileage_km)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
