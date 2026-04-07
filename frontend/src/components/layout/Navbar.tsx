"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Car, LogIn, LogOut, Plus, Globe, Heart, Send, Menu, X, Bell, User } from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useLanguageStore } from "@/store/language";
import { useT } from "@/lib/i18n";

export function Navbar() {
  const { user, logout, loadUser } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLanguageStore();
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { loadUser(); }, [loadUser]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinks = [
    { href: "/listings?vehicle_type=car", label: t("nav_cars") },
    { href: "/listings?vehicle_type=van", label: t("nav_vans") },
    { href: "/listings?vehicle_type=truck", label: t("nav_trucks") },
    { href: "/listings", label: t("nav_all") },
    { href: "/valuation", label: t("nav_valuation") },
  ];

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 md:h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-700 hover:text-primary-800 transition-colors flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span>AutoCH</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === "/listings" && link.href === "/listings";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive ? "text-primary-700 bg-primary-50" : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "de" ? "en" : "de")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "de" ? "EN" : "DE"}
            </button>
            <Link
              href="/listings/create"
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {t("nav_post")}
            </Link>
            {user ? (
              <div className="flex items-center gap-1">
                <Link href="/favorites" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title={t("favorites_title")}>
                  <Heart className="w-4 h-4" />
                </Link>
                <Link href="/my-offers" className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Meine Angebote">
                  <Send className="w-4 h-4" />
                </Link>
                <NotificationBell />
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                  <span className="font-medium">{user.first_name}</span>
                </Link>
                <button
                  onClick={() => { logout(); router.push("/auth/login"); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title={t("nav_logout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                <LogIn className="w-4 h-4" />
                {t("nav_login")}
              </Link>
            )}
          </div>

          {/* Mobile: only create + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/listings/create"
              className="flex items-center justify-center w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Menü"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen overlay menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white flex flex-col" style={{ top: "3.5rem" }}>
          <div className="flex-1 overflow-y-auto">
            {/* Nav links */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Fahrzeuge</p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-4 py-4 rounded-2xl text-base font-medium text-gray-800 hover:text-primary-600 hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User actions */}
            {user ? (
              <div className="px-4 pt-2 pb-2 border-t border-gray-100 mt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Mein Konto</p>
                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                {[
                  { href: "/profile", icon: User, label: "Profil" },
                  { href: "/favorites", icon: Heart, label: t("favorites_title") },
                  { href: "/my-offers", icon: Send, label: "Meine Angebote" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <Icon className="w-5 h-5 text-gray-400" />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => { logout(); router.push("/auth/login"); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-medium text-red-500 hover:bg-red-50 transition-colors mt-1"
                >
                  <LogOut className="w-5 h-5" />
                  {t("nav_logout")}
                </button>
              </div>
            ) : (
              <div className="px-4 pt-4 border-t border-gray-100 mt-2">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-4 rounded-2xl font-semibold text-base hover:bg-primary-700 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  {t("nav_login")}
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold text-base hover:bg-gray-50 transition-colors mt-3"
                >
                  Registrieren
                </Link>
              </div>
            )}
          </div>

          {/* Language toggle at bottom */}
          <div className="px-4 py-4 border-t border-gray-100">
            <button
              onClick={() => setLang(lang === "de" ? "en" : "de")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {lang === "de" ? "Switch to English" : "Wechseln zu Deutsch"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
