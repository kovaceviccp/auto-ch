"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Listing, ListingsResponse } from "@/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { SellerReviews } from "@/components/reviews/SellerReviews";
import { useAuthStore } from "@/store/auth";
import { MapPin, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SellerProfile {
  id: number;
  name: string;
  company_name?: string;
  canton?: string;
  city?: string;
  role: string;
  created_at: string;
}

export default function SellerProfilePage() {
  const { id } = useParams();
  const { user } = useAuthStore();

  const { data: seller, isLoading: sellerLoading } = useQuery<SellerProfile>({
    queryKey: ["seller", id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}/public`);
      return data;
    },
    enabled: !!id,
  });

  const { data: listingsData, isLoading: listingsLoading } = useQuery<ListingsResponse>({
    queryKey: ["seller-all-listings", id],
    queryFn: async () => {
      const { data } = await api.get(`/listings?seller_id=${id}&per_page=50`);
      return data;
    },
    enabled: !!id,
  });

  if (sellerLoading || listingsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const listings = listingsData?.items ?? [];
  const displayName = seller?.company_name || seller?.name || "Unbekannter Verkäufer";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/listings" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </Link>

      {/* Seller Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl flex-shrink-0">
            {displayName[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
            {seller?.canton && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {seller.canton}{seller.city ? ` / ${seller.city}` : ""}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {listings.length} aktive{listings.length !== 1 ? " Inserate" : "s Inserat"}
            </p>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {listings.length > 0 ? (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Fahrzeuge von {displayName}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-400 text-center py-12">
          Keine aktiven Inserate gefunden.
        </p>
      )}

      {/* Reviews */}
      {seller && (
        <SellerReviews sellerId={seller.id} currentUserId={user?.id} />
      )}
    </div>
  );
}
