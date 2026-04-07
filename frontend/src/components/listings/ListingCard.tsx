"use client";
import Link from "next/link";
import { Listing } from "@/types";
import { formatPrice, formatMileage } from "@/lib/utils";
import { MapPin, Gauge, Fuel, Calendar, ArrowUpRight, Images, ArrowLeftRight } from "lucide-react";
import { useT, TranslationKey } from "@/lib/i18n";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCompareStore } from "@/store/compare";

function CarPlaceholder({ label }: { label: string }) {
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
      <span className="text-xs text-primary-300-safe font-medium tracking-wide">{label}</span>
    </div>
  );
}

const fuelKeyMap: Record<string, TranslationKey> = {
  petrol: "fuel_petrol",
  diesel: "fuel_diesel",
  electric: "fuel_electric",
  hybrid: "fuel_hybrid",
  plugin_hybrid: "fuel_plugin_hybrid",
  lpg: "fuel_lpg",
  cng: "fuel_cng",
  hydrogen: "fuel_hydrogen",
};

export function ListingCard({ listing }: { listing: Listing }) {
  const t = useT();
  const { ref, visible } = useScrollReveal();
  const { add, remove, has } = useCompareStore();
  const inCompare = has(listing.id);
  const mainImage = listing.images[0] || null;
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8001";
  const imageCount = listing.images.length;
  const ageMs = Date.now() - new Date(listing.created_at).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const isNew = ageHours < 24;

  const ageBadge = ageHours < 2
    ? { label: "Neu", color: "bg-emerald-500" }
    : ageHours < 24
    ? { label: "Heute", color: "bg-emerald-500" }
    : ageDays < 2
    ? { label: "Gestern", color: "bg-amber-500" }
    : ageDays < 7
    ? { label: `${Math.floor(ageDays)}T`, color: "bg-gray-400" }
    : null;

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <Link
        href={`/listings/${listing.id}`}
        className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
      >
        <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
          {mainImage ? (
            <img
              src={`${apiBase}${mainImage}`}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <CarPlaceholder label={t("detail_no_image")} />
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
            {ageBadge && (
              <span className={`${ageBadge.color} text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm flex items-center gap-1`}>
                {ageBadge.color === "bg-emerald-500" && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                {ageBadge.label}
              </span>
            )}
            {listing.condition === "new" && !isNew && (
              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm">
                {t("cond_new")}
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

        <div className="p-3 sm:p-4 border-l-2 border-l-transparent group-hover:border-l-primary-500 transition-all duration-300">
          <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-primary-700 transition-colors duration-200">
            {listing.make} {listing.model}
          </h3>

          <div className="flex items-center justify-between mt-1.5">
            <div className="font-semibold text-primary-700 text-sm leading-tight">
              {formatPrice(listing.price_chf)}
            </div>
            {listing.price_negotiable && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">{t("listing_vb")}</span>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-400">
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
                <Fuel className="w-3 h-3 text-gray-300" />
                {fuelKeyMap[listing.fuel_type] ? t(fuelKeyMap[listing.fuel_type]) : listing.fuel_type}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-300" /> {listing.canton}
            </span>
          </div>
        </div>
      </Link>

      {/* Compare button — outside Link to prevent navigation */}
      <button
        onClick={(e) => {
          e.preventDefault();
          inCompare ? remove(listing.id) : add(listing);
        }}
        title={inCompare ? "Aus Vergleich entfernen" : "Zum Vergleich hinzufügen"}
        className={`absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 ${
          inCompare
            ? "bg-primary-100 text-primary-700 border border-primary-200"
            : "bg-white/90 text-gray-500 border border-gray-200 hover:text-primary-600 hover:border-primary-300"
        }`}
      >
        <ArrowLeftRight className="w-3 h-3" />
        {inCompare ? "✓" : "Vergleichen"}
      </button>
    </div>
  );
}
