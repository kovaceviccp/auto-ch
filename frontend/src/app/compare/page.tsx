"use client";
import { useCompareStore } from "@/store/compare";
import { formatPrice, formatMileage } from "@/lib/utils";
import { ArrowLeft, X, Check, Minus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const fuelLabels: Record<string, string> = {
  petrol: "Benzin", diesel: "Diesel", electric: "Elektro",
  hybrid: "Hybrid", plugin_hybrid: "Plug-in Hybrid", lpg: "LPG",
  cng: "CNG", hydrogen: "Wasserstoff",
};
const transLabels: Record<string, string> = {
  manual: "Schaltgetriebe", automatic: "Automatik", semi_automatic: "Halbautomatik",
};
const condLabels: Record<string, string> = {
  new: "Neu", used: "Occasion", damaged: "Unfall",
};

export default function ComparePage() {
  const { items, remove, clear } = useCompareStore();
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8001";

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">⚖️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kein Fahrzeug zum Vergleichen</h1>
        <p className="text-gray-500 mb-6">Wähle bis zu 3 Fahrzeuge aus den Inseraten aus, um sie zu vergleichen.</p>
        <Link href="/listings" className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors">
          Zu den Inseraten
        </Link>
      </div>
    );
  }

  const rows: { label: string; getValue: (l: typeof items[0]) => string | null }[] = [
    { label: "Preis", getValue: (l) => formatPrice(l.price_chf) + (l.price_negotiable ? " (VB)" : "") },
    { label: "Baujahr", getValue: (l) => String(l.year) },
    { label: "Kilometerstand", getValue: (l) => l.mileage_km != null ? formatMileage(l.mileage_km) : null },
    { label: "Treibstoff", getValue: (l) => l.fuel_type ? (fuelLabels[l.fuel_type] || l.fuel_type) : null },
    { label: "Getriebe", getValue: (l) => l.transmission ? (transLabels[l.transmission] || l.transmission) : null },
    { label: "Motorvolumen", getValue: (l) => l.engine_cc ? `${l.engine_cc} cm³` : null },
    { label: "Leistung", getValue: (l) => l.power_kw ? `${l.power_kw} kW (${Math.round(l.power_kw * 1.36)} PS)` : null },
    { label: "Türen", getValue: (l) => l.doors ? String(l.doors) : null },
    { label: "Sitze", getValue: (l) => l.seats ? String(l.seats) : null },
    { label: "Farbe", getValue: (l) => l.color || null },
    { label: "Zustand", getValue: (l) => condLabels[l.condition] || l.condition },
    { label: "Kanton", getValue: (l) => l.canton + (l.city ? ` / ${l.city}` : "") },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <button
          onClick={() => { clear(); router.push("/listings"); }}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Vergleich leeren
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fahrzeugvergleich</h1>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          {/* Vehicle header cards */}
          <thead>
            <tr>
              <th className="w-40 pb-4 pr-4 text-left align-bottom">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Eigenschaft</span>
              </th>
              {items.map((listing) => (
                <th key={listing.id} className="pb-4 px-3 align-top">
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="aspect-[16/9] bg-gray-100 relative">
                      {listing.images[0] ? (
                        <img
                          src={`${apiBase}${listing.images[0]}`}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100" />
                      )}
                      <button
                        onClick={() => remove(listing.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3 text-left">
                      <p className="font-bold text-gray-900 text-sm">{listing.make} {listing.model}</p>
                      <p className="text-primary-600 font-semibold text-sm">{formatPrice(listing.price_chf)}</p>
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-xs text-gray-400 hover:text-primary-600 transition-colors mt-1 block"
                      >
                        Inserat ansehen →
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
              {/* Placeholder for 3rd slot */}
              {items.length < 3 && (
                <th className="pb-4 px-3 align-top">
                  <Link
                    href="/listings"
                    className="block border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                  >
                    <div className="text-3xl mb-2">+</div>
                    <p className="text-xs text-gray-400 group-hover:text-primary-600 transition-colors">
                      Fahrzeug hinzufügen
                    </p>
                  </Link>
                </th>
              )}
            </tr>
          </thead>

          {/* Spec rows */}
          <tbody>
            {rows.map((row, rowIdx) => {
              const values = items.map((l) => row.getValue(l));
              const allSame = values.every((v) => v === values[0]);

              return (
                <tr
                  key={row.label}
                  className={rowIdx % 2 === 0 ? "bg-gray-50/60" : "bg-white"}
                >
                  <td className="py-3 pr-4 pl-3 text-xs font-semibold text-gray-500 rounded-l-xl">
                    {row.label}
                  </td>
                  {items.map((listing, ci) => {
                    const val = values[ci];
                    const isDifferent = !allSame && val !== null;
                    return (
                      <td
                        key={listing.id}
                        className={`py-3 px-3 text-sm text-center font-medium ${
                          isDifferent ? "text-gray-900" : "text-gray-600"
                        } ${ci === items.length - 1 ? "rounded-r-xl" : ""}`}
                      >
                        {val ?? (
                          <span className="text-gray-300"><Minus className="w-3 h-3 inline" /></span>
                        )}
                      </td>
                    );
                  })}
                  {items.length < 3 && <td />}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
