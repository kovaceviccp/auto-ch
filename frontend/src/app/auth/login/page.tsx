"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { Car, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { useT } from "@/lib/i18n";

function CarIllustration() {
  return (
    <svg viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm opacity-90">
      {/* Car body */}
      <path d="M30 100 L45 65 L90 52 L160 48 L230 52 L268 68 L282 100 Z" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.25" strokeWidth="1.5"/>
      {/* Roof */}
      <path d="M90 52 L108 32 L210 32 L230 52 Z" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.3" strokeWidth="1.5"/>
      {/* Windshield */}
      <path d="M96 51 L112 35 L207 35 L224 51 Z" fill="white" fillOpacity="0.1"/>
      {/* Side window */}
      <path d="M115 35 L130 51 L200 51 L215 35 Z" fill="white" fillOpacity="0.15"/>
      {/* Left wheel arch */}
      <path d="M48 100 Q80 88 112 100" stroke="white" strokeOpacity="0.3" strokeWidth="3" fill="none"/>
      {/* Right wheel arch */}
      <path d="M195 100 Q228 88 260 100" stroke="white" strokeOpacity="0.3" strokeWidth="3" fill="none"/>
      {/* Left wheel */}
      <circle cx="82" cy="106" r="22" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="5"/>
      <circle cx="82" cy="106" r="10" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" strokeWidth="2"/>
      {/* Right wheel */}
      <circle cx="228" cy="106" r="22" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="5"/>
      <circle cx="228" cy="106" r="10" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" strokeWidth="2"/>
      {/* Headlight */}
      <ellipse cx="272" cy="80" rx="8" ry="5" fill="white" fillOpacity="0.4"/>
      {/* Grill */}
      <path d="M268 85 L278 85 L280 95 L266 95 Z" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
      {/* Door handle */}
      <rect x="148" y="68" width="18" height="4" rx="2" fill="white" fillOpacity="0.25"/>
      {/* Ground reflection */}
      <ellipse cx="156" cy="130" rx="100" ry="8" fill="white" fillOpacity="0.05"/>
      {/* Road */}
      <line x1="10" y1="128" x2="310" y2="128" stroke="white" strokeOpacity="0.1" strokeWidth="1.5"/>
      <line x1="80" y1="128" x2="120" y2="128" stroke="white" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="8 6"/>
      <line x1="140" y1="128" x2="180" y2="128" stroke="white" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="8 6"/>
      <line x1="200" y1="128" x2="240" y2="128" stroke="white" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="8 6"/>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const t = useT();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      router.push("/");
    } catch {
      setError(t("login_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";

  const features = [
    "Kostenlos inserieren",
    "Direkt mit Käufern kommunizieren",
    "Alle 26 Kantone abgedeckt",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-gradient text-white flex-col justify-between px-14 py-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-950/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />

        {/* Logo */}
        <div className="relative animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">AutoCH</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-6 animate-slide-in-left">
          {/* Car illustration */}
          <div className="animate-float">
            <CarIllustration />
          </div>

          <div>
            <h2 className="text-4xl font-bold leading-tight text-white mb-2">{t("login_welcome")}</h2>
            <p className="text-primary-200-safe text-lg leading-relaxed">{t("login_tagline")}</p>
          </div>

          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={f} className="flex items-center gap-3 text-primary-100-safe" style={{ animationDelay: `${i * 0.1}s` }}>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom badge */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-primary-200-safe">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-soft" />
            Die Nr. 1 Fahrzeugbörse der Schweiz
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-700">AutoCH</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("login_title")}</h1>
            <p className="text-gray-400 text-sm">{t("login_sub")}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2 animate-scale-in">
              <span className="w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("login_email")}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputCls}
                placeholder="ihre@email.ch"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("login_password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={inputCls + " pr-11"}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{t("login_btn")} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            {t("login_no_account")}{" "}
            <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              {t("login_register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
