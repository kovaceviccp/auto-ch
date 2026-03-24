"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Listing } from "@/types";
import { formatPrice, formatMileage } from "@/lib/utils";
import { MapPin, Gauge, Fuel, Calendar, Phone, User, ArrowLeft, Share2, Send, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useT } from "@/lib/i18n";
import { LikeButton } from "@/components/listings/LikeButton";
import { InquiryModal } from "@/components/listings/InquiryModal";
import { SellerReviews } from "@/components/reviews/SellerReviews";
import { SimilarListings } from "@/components/listings/SimilarListings";
import { FinancingCalc } from "@/components/listings/FinancingCalc";
import { useAuthStore } from "@/store/auth";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [imgIdx, setImgIdx] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const t = useT();
  const { add } = useRecentlyViewed();

  const fuelLabels: Record<string, string> = {
    petrol: t("fuel_petrol"), diesel: t("fuel_diesel"), electric: t("fuel_electric"),
    hybrid: t("fuel_hybrid"), plugin_hybrid: t("fuel_plugin_hybrid"), lpg: t("fuel_lpg"),
    cng: t("fuel_cng"), hydrogen: t("fuel_hydrogen"),
  };
  const transLabels: Record<string, string> = {
    manual: t("trans_manual"), automatic: t("trans_automatic"), semi_automatic: t("trans_semi"),
  };

  const { data: listing, isLoading } = useQuery<Listing>({
    queryKey: ["listing", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(`/listings/${id}`);
      return data;
    },
  });

  useEffect(() => {
    if (listing) {
      add(listing.id);
    }
  }, [listing]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 aspect-[4/3] bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return <div className="p-8 text-center text-gray-400">{t("detail_not_found")}</div>;

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8001";
  const fomoCount = listing.likes_count;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/listings" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t("detail_back")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + Details */}
        <div className="lg:col-span-2">
          {/* Main image */}
          <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
            {listing.images.length > 0 ? (
              <img
                src={`${apiBase}${listing.images[imgIdx]}`}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <span>{t("detail_no_image")}</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {listing.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${i === imgIdx ? "border-primary-500" : "border-transparent"}`}
                >
                  <img src={`${apiBase}${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-3">{t("detail_description")}</h2>
            <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
              {listing.description || t("detail_no_desc")}
            </p>
          </div>

          {/* Specs table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-4">
            <h2 className="font-semibold text-lg text-gray-900 mb-4">{t("detail_specs")}</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                [t("detail_make"), listing.make],
                [t("detail_model"), listing.model],
                [t("detail_year"), String(listing.year)],
                [t("detail_mileage"), listing.mileage_km != null ? formatMileage(listing.mileage_km) : "—"],
                [t("detail_fuel"), listing.fuel_type ? (fuelLabels[listing.fuel_type] || listing.fuel_type) : "—"],
                [t("detail_transmission"), listing.transmission ? (transLabels[listing.transmission] || listing.transmission) : "—"],
                [t("detail_engine"), listing.engine_cc ? `${listing.engine_cc} cm³` : "—"],
                [t("detail_power"), listing.power_kw ? `${listing.power_kw} kW (${Math.round(listing.power_kw * 1.36)} PS)` : "—"],
                [t("detail_doors"), listing.doors ? String(listing.doors) : "—"],
                [t("detail_seats"), listing.seats ? String(listing.seats) : "—"],
                [t("detail_color"), listing.color || "—"],
                [t("detail_canton"), listing.canton + (listing.city ? ` / ${listing.city}` : "")],
              ].map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="text-gray-900 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Right: Price + Contact */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl font-bold text-primary-700">
                  {formatPrice(listing.price_chf)}
                </div>
                {listing.price_negotiable && (
                  <span className="text-sm text-gray-400">{t("detail_negotiable")}</span>
                )}
                {listing.leasing_available && (
                  <div className="text-sm text-green-600 mt-1">{t("detail_leasing")}</div>
                )}
              </div>
              <div className="flex gap-2">
                <LikeButton listingId={listing.id} sellerId={listing.seller_id} />
                <button
                  onClick={() => navigator.share?.({ title: listing.title, url: window.location.href })}
                  className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-primary-500 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-gray-600">
                <Calendar className="w-3.5 h-3.5" /> {listing.year}
              </span>
              {listing.mileage_km != null && (
                <span className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-gray-600">
                  <Gauge className="w-3.5 h-3.5" /> {formatMileage(listing.mileage_km)}
                </span>
              )}
              {listing.fuel_type && (
                <span className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-gray-600">
                  <Fuel className="w-3.5 h-3.5" /> {fuelLabels[listing.fuel_type] || listing.fuel_type}
                </span>
              )}
              <span className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-gray-600">
                <MapPin className="w-3.5 h-3.5" /> {listing.canton}
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mt-4">{listing.title}</h1>
            <p className="text-sm text-gray-400 mt-1">{listing.views} {t("detail_views")}</p>

            {fomoCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                {fomoCount} {fomoCount === 1 ? "Person hat" : "Personen haben"} dieses Inserat geliked
              </div>
            )}
          </div>

          {/* Seller */}
          {listing.seller && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> {t("detail_seller")}
              </h3>
              <p className="font-medium text-gray-800">
                {listing.seller.company_name || listing.seller.name}
              </p>
              {listing.seller.canton && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {listing.seller.canton}
                </p>
              )}
              {listing.seller.phone && (
                <a
                  href={`tel:${listing.seller.phone}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-3 font-medium transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {listing.seller.phone}
                </a>
              )}

              {/* Owner: delete controls */}
              {user && user.id === listing.seller_id ? (
                <div className="mt-3">
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg px-4 py-2.5 font-medium transition-all duration-200 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Inserat löschen
                    </button>
                  ) : (
                    <div className="animate-fade-in-up space-y-2">
                      <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">Möchten Sie dieses Inserat wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Abbrechen
                        </button>
                        <button
                          disabled={deleting}
                          onClick={async () => {
                            setDeleting(true);
                            try {
                              await api.delete(`/listings/${listing.id}`);
                              router.push("/listings");
                            } catch {
                              setDeleting(false);
                              setConfirmDelete(false);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {deleting ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Endgültig löschen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Contact/Offer button */}
                  <button
                    onClick={() => setShowInquiry(true)}
                    className="mt-2 w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-3 font-medium transition-colors text-sm shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    {t("inquiry_contact_btn")}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Financing calculator — right column, below seller card */}
        <div className="space-y-4">
          <FinancingCalc priceChf={listing.price_chf} />
        </div>

        {/* Seller Reviews — full width */}
        <div className="lg:col-span-3">
          <SellerReviews
            sellerId={listing.seller_id}
            currentUserId={user?.id}
          />
        </div>

        {/* Similar listings */}
        <SimilarListings
          currentId={listing.id}
          make={listing.make}
          priceChf={listing.price_chf}
        />
      </div>

      {showInquiry && <InquiryModal listing={listing} onClose={() => setShowInquiry(false)} />}
    </div>
  );
}
