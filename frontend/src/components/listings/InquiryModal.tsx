"use client";
import { useState } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useT } from "@/lib/i18n";
import { Listing } from "@/types";

interface Props {
  listing: Listing;
  onClose: () => void;
}

export function InquiryModal({ listing, onClose }: Props) {
  const { user } = useAuthStore();
  const t = useT();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    message: "",
    test_drive: false,
    want_leasing: false,
    want_installment: false,
    want_insurance: false,
    want_trade_in: false,
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/inquiries", { ...form, listing_id: listing.id });
      setSent(true);
    } catch {
      setError(t("inquiry_error"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500";
  const checkCls = "w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t("inquiry_title")}</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{listing.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900 text-lg">{t("inquiry_success")}</p>
            <button onClick={onClose} className="mt-5 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              OK
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("inquiry_first_name")} *</label>
                <input type="text" required value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("inquiry_last_name")} *</label>
                <input type="text" required value={form.last_name} onChange={(e) => set("last_name", e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("inquiry_email")} *</label>
                <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("inquiry_phone")}</label>
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} placeholder="+41 79..." />
              </div>
            </div>

            {/* Test drive */}
            <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-primary-50 rounded-lg border border-primary-100">
              <input type="checkbox" checked={form.test_drive} onChange={(e) => set("test_drive", e.target.checked)} className={checkCls} />
              <span className="text-sm font-medium text-primary-800">{t("inquiry_test_drive")}</span>
            </label>

            {/* Info checkboxes */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("inquiry_info_about")}</p>
              {[
                { key: "want_leasing", label: t("inquiry_leasing") },
                { key: "want_installment", label: t("inquiry_installment") },
                { key: "want_insurance", label: t("inquiry_insurance") },
                { key: "want_trade_in", label: t("inquiry_trade_in") },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => set(key, e.target.checked)}
                    className={checkCls}
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t("inquiry_message")}</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                className={inputCls}
                placeholder={t("inquiry_message_placeholder")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? t("inquiry_sending") : t("inquiry_send")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
