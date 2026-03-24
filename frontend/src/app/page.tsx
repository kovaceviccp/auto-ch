"use client";
import { SearchForm } from "@/components/listings/SearchForm";
import Link from "next/link";
import { Car, Truck, Bus, Tractor, TrendingUp, Shield, Zap, ArrowRight, Calculator } from "lucide-react";
import { useT } from "@/lib/i18n";
import { RecentlyViewed } from "@/components/listings/RecentlyViewed";

export default function HomePage() {
  const t = useT();

  const categories = [
    { type: "car", label: t("cat_car"), icon: Car, color: "bg-blue-50 hover:bg-blue-100 text-blue-600", border: "border-blue-100 hover:border-blue-200" },
    { type: "van", label: t("cat_van"), icon: Car, color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-600", border: "border-emerald-100 hover:border-emerald-200" },
    { type: "truck", label: t("cat_truck"), icon: Truck, color: "bg-orange-50 hover:bg-orange-100 text-orange-600", border: "border-orange-100 hover:border-orange-200" },
    { type: "bus", label: t("cat_bus"), icon: Bus, color: "bg-purple-50 hover:bg-purple-100 text-purple-600", border: "border-purple-100 hover:border-purple-200" },
    { type: "trailer", label: t("cat_trailer"), icon: Truck, color: "bg-yellow-50 hover:bg-yellow-100 text-yellow-600", border: "border-yellow-100 hover:border-yellow-200" },
    { type: "agricultural", label: t("cat_agri"), icon: Tractor, color: "bg-lime-50 hover:bg-lime-100 text-lime-600", border: "border-lime-100 hover:border-lime-200" },
  ];

  const stats = [
    { value: "10'000+", label: t("home_stat_listings") },
    { value: "26", label: t("home_stat_cantons") },
    { value: "100%", label: t("home_stat_free") },
  ];

  const features = [
    { icon: Zap, title: t("home_feat_fast"), desc: t("home_feat_fast_sub"), color: "bg-amber-50 text-amber-600" },
    { icon: Shield, title: t("home_feat_safe"), desc: t("home_feat_safe_sub"), color: "bg-emerald-50 text-emerald-600" },
    { icon: TrendingUp, title: t("home_feat_price"), desc: t("home_feat_price_sub"), color: "bg-primary-50 text-primary-600" },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative text-white py-24 px-4 overflow-hidden min-h-[520px] flex items-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/pozadina.png')" }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-hero-overlay" />
        {/* Decorative orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-primary-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-800/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            {t("home_badge")}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight animate-fade-in stagger-1">
            {t("home_h1_1")}<br />
            <span className="text-primary-300-safe">{t("home_h1_2")}</span>{" "}
            <span className="text-white">{t("home_h1_3")}</span>
          </h1>

          <p className="text-primary-100-safe text-lg mb-8 max-w-xl mx-auto animate-fade-in stagger-2 leading-relaxed">
            {t("home_sub")}
          </p>

          <div className="animate-fade-in stagger-3">
            <SearchForm />
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-10 mt-10 animate-fade-in stagger-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-primary-300-safe text-xs mt-0.5 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {features.map((f, i) => (
            <div key={f.title} className={`flex items-center gap-4 px-6 py-3 md:py-0 first:pl-0 last:pr-0 animate-fade-in`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-10 h-10 ${f.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{f.title}</div>
                <div className="text-xs text-gray-400">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("home_categories")}</h2>
            <p className="text-gray-400 text-sm mt-1">{t("home_categories_sub")}</p>
          </div>
          <Link href="/listings" className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors group">
            {t("home_show_all")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => (
            <Link
              key={cat.type}
              href={`/listings?vehicle_type=${cat.type}`}
              className={`${cat.color} border ${cat.border} rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 hover:scale-105 hover:shadow-md animate-fade-in`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <cat.icon className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-center leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-4 mb-16">
        <div className="max-w-7xl mx-auto bg-primary-gradient rounded-3xl overflow-hidden relative">
          {/* Background image with overlay */}
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/pozadina.png')" }} />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="relative px-8 py-12 md:px-16 text-white text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs text-primary-200-safe mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              {t("home_cta_badge")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("home_sell_title")}</h2>
            <p className="text-primary-200-safe mb-8 max-w-md mx-auto text-lg">{t("home_sell_sub")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/listings/create"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-800 px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Car className="w-5 h-5" />
                {t("home_sell_btn")}
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200"
              >
                {t("home_browse_btn")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/valuation"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200"
              >
                <Calculator className="w-4 h-4" />
                {t("home_valuation_btn")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <RecentlyViewed />
    </div>
  );
}
