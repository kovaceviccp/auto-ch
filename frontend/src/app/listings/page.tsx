"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingsResponse, SWISS_CANTONS, CAR_MAKES } from "@/types";
import { useState } from "react";
import { SlidersHorizontal, X, Car, Truck, Bus, Tractor } from "lucide-react";
import { Suspense } from "react";
import { useT } from "@/lib/i18n";
import { RecentlyViewed } from "@/components/listings/RecentlyViewed";

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const t = useT();

  const vehicleTypes = [
    { value: "car",          label: t("cat_car"),     icon: Car },
    { value: "van",          label: t("cat_van"),     icon: Car },
    { value: "truck",        label: t("cat_truck"),   icon: Truck },
    { value: "bus",          label: t("cat_bus"),     icon: Bus },
    { value: "trailer",      label: t("cat_trailer"), icon: Truck },
    { value: "agricultural", label: t("cat_agri"),    icon: Tractor },
  ];

  const params = {
    vehicle_type: searchParams.get("vehicle_type") || "",
    make:         searchParams.get("make") || "",
    canton:       searchParams.get("canton") || "",
    price_to:     searchParams.get("price_to") || "",
    year_from:    searchParams.get("year_from") || "",
    search:       searchParams.get("search") || "",
    page:         searchParams.get("page") || "1",
  };

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) queryParams.set(k, v); });

  const { data, isLoading } = useQuery<ListingsResponse>({
    queryKey: ["listings", params],
    queryFn: async () => {
      const { data } = await api.get(`/listings?${queryParams.toString()}`);
      return data;
    },
  });

  const updateFilter = (key: string, value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set(key, value); else sp.delete(key);
    sp.delete("page");
    router.push(`/listings?${sp.toString()}`);
  };

  const activeFiltersCount = [params.vehicle_type, params.make, params.canton, params.price_to, params.year_from].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

      {/* Recently viewed — compact on listings page */}
      <RecentlyViewed />

      {/* Mobile: quick type chips */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        <button
          onClick={() => updateFilter("vehicle_type", "")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !params.vehicle_type ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          Alle
        </button>
        {vehicleTypes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => updateFilter("vehicle_type", params.vehicle_type === value ? "" : value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              params.vehicle_type === value ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base sm:text-xl font-bold text-gray-900">
          {data ? `${data.total.toLocaleString("de-CH")} ${t("listings_count")}` : t("listings_count")}
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`md:hidden flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors border ${
            activeFiltersCount > 0
              ? "bg-primary-600 text-white border-primary-600"
              : "border-gray-200 text-gray-600 bg-white"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t("listings_filter")}
          {activeFiltersCount > 0 && (
            <span className="bg-white text-primary-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold leading-none">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-5">
        {/* Filter sidebar */}
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 flex-shrink-0`}>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm p-4 md:sticky md:top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-sm">{t("listings_filter")}</h2>
              <button onClick={() => router.push("/listings")} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                <X className="w-3 h-3" /> {t("listings_reset")}
              </button>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  label: t("listings_type"),
                  key: "vehicle_type",
                  value: params.vehicle_type,
                  options: [{ value: "", label: t("listings_all") }, ...vehicleTypes.map(({ value, label }) => ({ value, label }))],
                },
                {
                  label: t("listings_make"),
                  key: "make",
                  value: params.make,
                  options: [{ value: "", label: t("listings_all") }, ...CAR_MAKES.map((m) => ({ value: m, label: m }))],
                },
                {
                  label: t("listings_canton"),
                  key: "canton",
                  value: params.canton,
                  options: [{ value: "", label: t("listings_all_cantons") }, ...SWISS_CANTONS.map((c) => ({ value: c.code, label: c.name }))],
                },
                {
                  label: t("listings_price_to"),
                  key: "price_to",
                  value: params.price_to,
                  options: [
                    { value: "", label: t("listings_no_limit") },
                    ...[5000, 10000, 20000, 30000, 50000, 75000, 100000, 200000].map((v) => ({
                      value: String(v),
                      label: `CHF ${v.toLocaleString("de-CH")}`,
                    })),
                  ],
                },
                {
                  label: t("listings_year_from"),
                  key: "year_from",
                  value: params.year_from,
                  options: [
                    { value: "", label: t("listings_all_years") },
                    ...Array.from({ length: 30 }, (_, i) => 2024 - i).map((y) => ({ value: String(y), label: String(y) })),
                  ],
                },
              ].map(({ label, key, value, options }) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">{label}</label>
                  <select
                    value={value}
                    onChange={(e) => updateFilter(key, e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all appearance-none"
                  >
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Apply / close on mobile */}
            {showFilters && (
              <button
                onClick={() => setShowFilters(false)}
                className="md:hidden w-full mt-4 bg-primary-600 text-white py-3 rounded-xl font-medium text-sm"
              >
                Ergebnisse anzeigen {data ? `(${data.total})` : ""}
              </button>
            )}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-lg font-semibold text-gray-700">{t("listings_empty")}</p>
              <p className="text-sm text-gray-400 mt-1">{t("listings_empty_sub")}</p>
              <button
                onClick={() => router.push("/listings")}
                className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {t("listings_reset")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {data?.items.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {data && data.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: Math.min(data.pages, 10) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateFilter("page", String(p))}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                        p === data.page
                          ? "bg-primary-600 text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-3 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}
