"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { Inquiry } from "@/types";
import { useT } from "@/lib/i18n";
import Link from "next/link";
import { ArrowLeft, Car, Calendar, CheckCircle2, XCircle, Clock, Send } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "accepted") return (
    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
      <CheckCircle2 className="w-3.5 h-3.5" /> Akzeptiert
    </span>
  );
  if (status === "declined") return (
    <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-semibold">
      <XCircle className="w-3.5 h-3.5" /> Abgelehnt
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">
      <Clock className="w-3.5 h-3.5" /> Ausstehend
    </span>
  );
}

export default function MyOffersPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const t = useT();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    api.get("/inquiries/my-sent")
      .then((r) => setInquiries(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login"); return; }
    fetch();

    // Live update when seller accepts/declines
    const handler = (e: Event) => {
      const { listing_id, status } = (e as CustomEvent).detail;
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.listing_id === listing_id ? { ...inq, status } : inq
        )
      );
    };
    window.addEventListener("offer-status-changed", handler);
    return () => window.removeEventListener("offer-status-changed", handler);
  }, [user, authLoading, fetch]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/profile" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center">
          <Send className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meine Angebote</h1>
          <p className="text-sm text-gray-400 mt-0.5">Alle gesendeten Anfragen und deren Status</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 font-medium">Noch keine Anfragen gesendet</p>
          <Link href="/listings" className="mt-4 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 font-medium">
            <Car className="w-4 h-4" /> Fahrzeuge durchsuchen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq, i) => {
            const date = new Date(inq.created_at).toLocaleDateString("de-CH", {
              day: "2-digit", month: "2-digit", year: "numeric",
            });
            return (
              <div
                key={inq.id}
                className="animate-fade-in-up bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${inq.status === "accepted" ? "bg-green-100 text-green-700"
                        : inq.status === "declined" ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-700"}`}>
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/listings/${inq.listing_id}`}
                        className="font-semibold text-gray-900 text-sm hover:text-primary-700 transition-colors truncate block"
                      >
                        {inq.listing_title || `Inserat #${inq.listing_id}`}
                      </Link>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {date}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={inq.status} />
                </div>

                {inq.message && (
                  <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3 line-clamp-2">
                    {inq.message}
                  </p>
                )}

                {inq.status === "accepted" && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Der Verkäufer hat Ihre Anfrage akzeptiert. Sie können jetzt Kontakt aufnehmen.
                  </div>
                )}
                {inq.status === "declined" && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    Der Verkäufer hat Ihre Anfrage leider abgelehnt.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
