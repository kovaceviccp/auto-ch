"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Listing } from "@/types";
import { formatPrice, formatMileage } from "@/lib/utils";
import { Gauge, Calendar, MapPin, Sparkles } from "lucide-react";

interface Props {
  currentId: number;
  make: string;
  priceChf: number;
}

export function SimilarListings({ currentId, make, priceChf }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8001";

  useEffect(() => {
    api.get(`/listings?make=${encodeURIComponent(make)}&per_page=6`)
      .then((r) => {
        const filtered = r.data.items
          .filter((l: Listing) => l.id !== currentId)
          .slice(0, 3);
        // If not enough same make, fill with price range
        if (filtered.length < 3) {
          const min = priceChf * 0.6;
          const max = priceChf * 1.4;
          api.get(`/listings?price_from=${min}&price_to=${max}&per_page=10`)
            .then((r2) => {
              const extra = r2.data.items
                .filter((l: Listing) => l.id !== currentId && !filtered.find((f: Listing) => f.id === l.id))
                .slice(0, 3 - filtered.length);
              setListings([...filtered, ...extra]);
            })
            .catch(() => setListings(filtered));
        } else {
          setListings(filtered);
        }
      })
      .catch(() => {});
  }, [currentId, make, priceChf]);

  if (listings.length === 0) return null;

  return (
    <div className="lg:col-span-3 mt-2">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary-500" />
        <h2 className="text-lg font-bold text-gray-900">Ähnliche Fahrzeuge</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {listings.map((l, i) => (
          <Link
            key={l.id}
            href={`/listings/${l.id}`}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
              {l.images[0] ? (
                <img
                  src={`${apiBase}${l.images[0]}`}
                  alt={l.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-300 text-xs">Kein Bild</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-3">
              <p className="font-bold text-primary-700 text-base">{formatPrice(l.price_chf)}</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5 line-clamp-1">{l.title}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{l.year}</span>
                {l.mileage_km != null && <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{formatMileage(l.mileage_km)}</span>}
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{l.canton}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
