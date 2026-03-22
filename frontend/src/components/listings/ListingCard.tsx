import Link from "next/link";
import { Listing } from "@/types";
import { formatPrice, formatMileage } from "@/lib/utils";
import { MapPin, Gauge, Fuel, Calendar, ArrowUpRight, Images } from "lucide-react";

const fuelLabels: Record<string, string> = {
  petrol: "Benzin", diesel: "Diesel", electric: "Elektro",
  hybrid: "Hybrid", plugin_hybrid: "Plug-in", lpg: "LPG",
};

function CarPlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 gap-3">
      <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-auto">
        <path d="M8 38 L16 22 L34 18 L60 16 L86 18 L102 24 L110 38 Z" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1.5"/>
        <path d="M34 18 L40 10 L80 10 L86 18 Z" fill="#93c5fd" stroke="#60a5fa" strokeWidth="1.5"/>
        <path d="M36 18 L41 12 L78 12 L84 18 Z" fill="#bfdbfe" fillOpacity="0.6"/>
        <circle cx="30" cy="41" r="9" fill="none" stroke="#60a5fa" strokeWidth="3"/>
        <circle cx="30" cy="41" r="4" fill="#93c5fd"/>
        <circle cx="88" cy="41" r="9" fill="none" stroke="#60a5fa" strokeWidth="3"/>
        <circle cx="88" cy="41" r="4" fill="#93c5fd"/>
        <ellipse cx="104" cy="30" rx="4" ry="3" fill="#fbbf24" fillOpacity="0.8"/>
      </svg>
      <span className="text-xs text-primary-300-safe font-medium tracking-wide">Kein Bild</span>
    </div>
  );
}

export function ListingCard({ listing }: { listing: Listing }) {
  const mainImage = listing.images[0] || null;
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8001";
  const imageCount = listing.images.length;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
        {mainImage ? (
          <img
            src={`${apiBase}${mainImage}`}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <CarPlaceholder />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {listing.is_featured && (
            <span className="bg-accent-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm">
              ★ Featured
            </span>
          )}
          {listing.condition === "new" && (
            <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm">
              Neu
            </span>
          )}
        </div>

        {/* Image count */}
        {imageCount > 1 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            <Images className="w-3 h-3" />
            {imageCount}
          </div>
        )}

        {/* Arrow icon on hover */}
        <div className="absolute top-3 right-3 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm translate-y-1 group-hover:translate-y-0">
          <ArrowUpRight className="w-3.5 h-3.5 text-primary-600" />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="font-bold text-primary-700 text-lg leading-tight">
            {formatPrice(listing.price_chf)}
          </div>
          {listing.price_negotiable && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">VB</span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mt-1 text-sm leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors duration-200">
          {listing.title}
        </h3>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-300" /> {listing.year}
          </span>
          {listing.mileage_km != null && (
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-gray-300" /> {formatMileage(listing.mileage_km)}
            </span>
          )}
          {listing.fuel_type && (
            <span className="flex items-center gap-1">
              <Fuel className="w-3 h-3 text-gray-300" /> {fuelLabels[listing.fuel_type] || listing.fuel_type}
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-300" /> {listing.canton}
          </span>
        </div>
      </div>
    </Link>
  );
}
