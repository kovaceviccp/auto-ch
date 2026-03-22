"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingsResponse, SWISS_CANTONS, CAR_MAKES } from "@/types";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Suspense } from "react";
import { useT } from "@/lib/i18n";

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const t = useT();

  const vehicleTypes = [
    { value: "car", label: t("cat_car") },
    { value: "van", label: t("cat_van") },
    { value: "truck", label: t("cat_truck") },
    { value: "bus", label: t("cat_bus") },
    { value: "trailer", label: t("cat_trailer") },
    { value: "agricultural", label: t("cat_agri") },
  ];

  const params = {
    vehicle_type: searchParams.get("vehicle_type") || "",
    make: searchParams.get("make") || "",
    canton: searchParams.get("canton") || "",
    price_to: searchParams.get("price_to") || "",
    year_from: searchParams.get("year_from") || "",
    search: searchParams.get("search") || "",
    page: searchParams.get("page") || "1",
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
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete("page");
    router.push(`/listings?${sp.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {data ? `${data.total.toLocaleString("de-CH")} ${t("listings_count")}` : t("listings_count")}
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 md:hidden"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t("listings_filter")}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-64 flex-shrink-0`}>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">{t("listings_filter")}</h2>
              <button onClick={() => router.push("/listings")} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                <X className="w-3 h-3" /> {t("listings_reset")}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t("listings_type")}</label>
                <select
                  value={params.vehicle_type}
                  onChange={(e) => updateFilter("vehicle_type", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                >
                  <option value="">{t("listings_all")}</option>
                  {vehicleTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t("listings_make")}</label>
                <select
                  value={params.make}
                  onChange={(e) => updateFilter("make", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                >
                  <option value="">{t("listings_all")}</option>
                  {CAR_MAKES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t("listings_canton")}</label>
                <select
                  value={params.canton}
                  onChange={(e) => updateFilter("canton", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                >
                  <option value="">{t("listings_all_cantons")}</option>
                  {SWISS_CANTONS.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t("listings_price_to")}</label>
                <select
                  value={params.price_to}
                  onChange={(e) => updateFilter("price_to", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                >
                  <option value="">{t("listings_no_limit")}</option>
                  {[
                    [5000, "5'000"],
                    [10000, "10'000"],
                    [20000, "20'000"],
                    [30000, "30'000"],
                    [50000, "50'000"],
                    [75000, "75'000"],
                    [100000, "100'000"],
                    [200000, "200'000"],
                  ].map(([val, label]) => (
                    <option key={val} value={val}>CHF {label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t("listings_year_from")}</label>
                <select
                  value={params.year_from}
                  onChange={(e) => updateFilter("year_from", e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900"
                >
                  <option value="">{t("listings_all_years")}</option>
                  {Array.from({ length: 30 }, (_, i) => 2024 - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Listings grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                {data?.items.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: Math.min(data.pages, 10) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateFilter("page", String(p))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
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
