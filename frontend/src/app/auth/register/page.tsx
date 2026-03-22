"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { SWISS_CANTONS } from "@/types";
import Link from "next/link";
import { Car, User, Building2, ShoppingCart, Check } from "lucide-react";
import { useT } from "@/lib/i18n";

type AccountType = "buyer" | "seller" | "dealer";

export default function RegisterPage() {
  const t = useT();

  const accountTypes = [
    {
      id: "buyer" as AccountType,
      icon: ShoppingCart,
      title: t("register_buyer"),
      subtitle: t("register_buyer_sub"),
      features: ["Favoriten speichern", "Suchalerts einrichten", "Verkäufer kontaktieren"],
      color: "border-blue-500 bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: "seller" as AccountType,
      icon: User,
      title: t("register_seller"),
      subtitle: t("register_seller_sub"),
      features: ["Bis 5 kostenlose Inserate", "Direkte Käuferkontakte", "Einfaches Inserieren"],
      color: "border-green-500 bg-green-50",
      iconColor: "text-green-600",
    },
    {
      id: "dealer" as AccountType,
      icon: Building2,
      title: t("register_dealer"),
      subtitle: t("register_dealer_sub"),
      features: ["Unbegrenzte Inserate", "Händler-Profil & Logo", "Featured Listings"],
      color: "border-primary-500 bg-primary-50",
      iconColor: "text-primary-600",
    },
  ];
  const router = useRouter();
  const { register } = useAuthStore();
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    company_name: "",
    uid_number: "",
    website: "",
    canton: "",
    city: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountType) return;
    setIsLoading(true);
    setError("");
    try {
      const payload: Record<string, string> = {
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        role: accountType,
      };
      if (form.phone) payload.phone = form.phone;
      if (form.canton) payload.canton = form.canton;
      if (form.city) payload.city = form.city;
      if (accountType === "dealer") {
        if (form.company_name) payload.company_name = form.company_name;
      }
      await register(payload);
      router.push("/");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(axiosError.response?.data?.detail || "Registrierung fehlgeschlagen");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500";
  const selectCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-lg shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Car className="w-7 h-7 text-primary-600" />
          <span className="text-2xl font-bold text-primary-700">AutoCH</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">{t("register_title")}</h1>
        <p className="text-sm text-gray-500 mb-6">{t("register_sub")}</p>

        {/* Account type selector */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {accountTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAccountType(t.id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                accountType === t.id
                  ? t.color
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {accountType === t.id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <t.icon className={`w-6 h-6 ${accountType === t.id ? t.iconColor : "text-gray-400"}`} />
              <div>
                <div className={`text-xs font-semibold ${accountType === t.id ? "text-gray-900" : "text-gray-600"}`}>
                  {t.title}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{t.subtitle}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Features of selected type */}
        {accountType && (
          <div className="mb-5 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-2">Inklusive:</p>
            <ul className="space-y-1">
              {accountTypes.find((t) => t.id === accountType)?.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {accountType && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
                <input type="text" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className={inputCls} placeholder="Max" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
                <input type="text" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} className={inputCls} placeholder="Mustermann" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="ihre@email.ch" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort *</label>
              <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className={inputCls} placeholder="Min. 8 Zeichen" minLength={8} required />
            </div>

            {/* Seller & Dealer: phone + canton */}
            {(accountType === "seller" || accountType === "dealer") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon {accountType === "dealer" ? "*" : ""}
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputCls}
                    placeholder="+41 79 123 45 67"
                    required={accountType === "dealer"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kanton</label>
                    <select value={form.canton} onChange={(e) => set("canton", e.target.value)} className={selectCls}>
                      <option value="">Kanton wählen</option>
                      {SWISS_CANTONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stadt / Ort</label>
                    <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} placeholder="Zürich" />
                  </div>
                </div>
              </>
            )}

            {/* Dealer only fields */}
            {accountType === "dealer" && (
              <>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Firmendaten</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Firmenname *</label>
                      <input type="text" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} className={inputCls} placeholder="Muster Auto AG" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UID-Nummer</label>
                      <input type="text" value={form.uid_number} onChange={(e) => set("uid_number", e.target.value)} className={inputCls} placeholder="CHE-123.456.789" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} className={inputCls} placeholder="https://musterauto.ch" />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? "..." : t("register_btn")}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          {t("register_have_account")}{" "}
          <Link href="/auth/login" className="text-primary-600 hover:underline font-medium">
            {t("register_login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
