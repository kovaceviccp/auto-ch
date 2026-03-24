"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { Listing } from "@/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { User, Mail, Phone, MapPin, Building2, LogOut, Plus, Car, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useT } from "@/lib/i18n";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loadUser } = useAuthStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [tab, setTab] = useState<"info" | "listings">("info");
  const t = useT();

  const roleLabels: Record<string, { label: string; color: string }> = {
    buyer: { label: t("register_buyer"), color: "bg-blue-100 text-blue-700" },
    seller: { label: t("register_seller"), color: "bg-green-100 text-green-700" },
    dealer: { label: t("register_dealer"), color: "bg-primary-100 text-primary-700" },
    admin: { label: "Admin", color: "bg-red-100 text-red-700" },
  };

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!user) return;
    setLoadingListings(true);
    api.get("/listings?per_page=50")
      .then((r) => {
        const mine = r.data.items.filter((l: Listing) => l.seller_id === user.id);
        setListings(mine);
      })
      .finally(() => setLoadingListings(false));
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 animate-fade-in">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{t("profile_not_logged")}</h1>
        <p className="text-gray-500 text-sm">{t("profile_login_prompt")}</p>
        <Link href="/auth/login" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
          {t("profile_login_btn")}
        </Link>
      </div>
    );
  }

  const role = roleLabels[user.role] ?? { label: user.role, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="bg-primary-gradient rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-bold">
            {user.first_name[0]}{user.last_name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{user.first_name} {user.last_name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.color} bg-opacity-90`}>
                {role.label}
              </span>
              {user.is_verified && (
                <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> {t("profile_verified")}
                </span>
              )}
            </div>
            {user.company_name && (
              <p className="text-primary-200-safe text-sm mt-0.5">{user.company_name}</p>
            )}
            <p className="text-primary-300-safe text-xs mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 rounded-lg text-sm"
          >
            <LogOut className="w-4 h-4" />
            {t("profile_logout")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { id: "info", label: t("profile_title") },
          { id: "listings", label: `${t("profile_listings")} (${listings.length})` },
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id as "info" | "listings")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === tabItem.id ? "bg-white text-primary-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
          {/* Personal info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-600" /> {t("profile_info")}
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <dt className="text-gray-400 text-xs">{t("profile_email_field")}</dt>
                  <dd className="text-gray-900 font-medium">{user.email}</dd>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <dt className="text-gray-400 text-xs">{t("profile_phone_field")}</dt>
                    <dd className="text-gray-900 font-medium">{user.phone}</dd>
                  </div>
                </div>
              )}
              {user.canton && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <dt className="text-gray-400 text-xs">{t("profile_location_field")}</dt>
                    <dd className="text-gray-900 font-medium">{user.city ? `${user.city}, ` : ""}{user.canton}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {/* Dealer info */}
          {user.role === "dealer" && user.company_name && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-600" /> {t("profile_company")}
              </h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-400 text-xs">{t("profile_company_name_field")}</dt>
                  <dd className="text-gray-900 font-medium">{user.company_name}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">{t("profile_actions")}</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/listings/create"
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t("profile_new_listing")}
              </Link>
              <Link
                href="/listings"
                className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Car className="w-4 h-4" />
                {t("profile_all_listings")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {tab === "listings" && (
        <div className="animate-slide-up">
          {loadingListings ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Car className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{t("profile_no_listings")}</p>
              <p className="text-gray-400 text-sm mt-1 mb-4">{t("profile_no_listings_sub")}</p>
              <Link href="/listings/create" className="bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                {t("profile_new_listing")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
