"use client";
import { useCompareStore } from "@/store/compare";
import { useRouter } from "next/navigation";
import { X, ArrowLeftRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export function CompareBar() {
  const { items, remove, clear } = useCompareStore();
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8001";

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex-shrink-0 hidden sm:block">
          Vergleich
        </span>

        <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0">
          {items.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-shrink-0"
            >
              {listing.images[0] ? (
                <img
                  src={`${apiBase}${listing.images[0]}`}
                  alt=""
                  className="w-10 h-8 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-8 bg-primary-100 rounded-lg flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">
                  {listing.make} {listing.model}
                </p>
                <p className="text-xs text-primary-600 font-medium">{formatPrice(listing.price_chf)}</p>
              </div>
              <button
                onClick={() => remove(listing.id)}
                className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-40 h-14 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0"
            >
              <span className="text-xs text-gray-300">+ Fahrzeug</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clear}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
          >
            Löschen
          </button>
          <button
            disabled={items.length < 2}
            onClick={() => router.push("/compare")}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="hidden sm:inline">Vergleichen</span>
            {items.length >= 2 && (
              <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-xs leading-none">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
