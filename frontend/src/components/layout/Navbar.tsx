"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Car, LogIn, LogOut, Plus, Globe, Heart, MessageCircle, Send } from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useLanguageStore } from "@/store/language";
import { useT } from "@/lib/i18n";
import { useUnreadCount } from "@/hooks/useUnreadCount";

export function Navbar() {
  const { user, logout, loadUser } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLanguageStore();
  const t = useT();
  const { chatCount: unreadChat } = useUnreadCount();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const navLinks = [
    { href: "/listings?vehicle_type=car", label: t("nav_cars") },
    { href: "/listings?vehicle_type=van", label: t("nav_vans") },
    { href: "/listings?vehicle_type=truck", label: t("nav_trucks") },
    { href: "/listings", label: t("nav_all") },
    { href: "/valuation", label: t("nav_valuation") },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-700 hover:text-primary-800 transition-colors">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          AutoCH
        </Link>

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

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "de" ? "en" : "de")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            title={lang === "de" ? "Switch to English" : "Wechseln zu Deutsch"}
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "de" ? "EN" : "DE"}
          </button>

          <Link
            href="/listings/create"
            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t("nav_post")}</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-1">
              <Link href="/favorites" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title={t("favorites_title")}>
                <Heart className="w-4 h-4" />
              </Link>
              <Link href="/my-offers" className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Meine Angebote">
                <Send className="w-4 h-4" />
              </Link>
              <Link href="/chat" className="relative p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title={t("chat_title")}>
                <MessageCircle className="w-4 h-4" />
                {unreadChat > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadChat > 9 ? "9+" : unreadChat}
                  </span>
                )}
              </Link>
              <NotificationBell />
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {user.first_name[0]}{user.last_name[0]}
                </div>
                <span className="hidden sm:inline font-medium">{user.first_name}</span>
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
              <span className="hidden sm:inline">{t("nav_login")}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
