"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { Inquiry } from "@/types";
import { useT } from "@/lib/i18n";
import Link from "next/link";
import {
  Mail, Phone, Car, Calendar, ChevronDown, ChevronUp,
  CheckCircle2, Inbox, ArrowLeft, ExternalLink, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { useUnreadCount } from "@/hooks/useUnreadCount";

type Filter = "all" | "unread" | "read";

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

function InquiryCard({ inquiry, onMarkRead, onStatusChange }: {
  inquiry: Inquiry;
  onMarkRead: (id: number) => void;
  onStatusChange: (id: number, status: "accepted" | "declined") => void;
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const [marking, setMarking] = useState(false);
  const [actioning, setActioning] = useState<"accept" | "decline" | null>(null);

  const flags = [
    { key: "test_drive", label: t("inquiry_test_drive_short"), color: "bg-blue-100 text-blue-700" },
    { key: "want_leasing", label: t("inquiry_leasing"), color: "bg-purple-100 text-purple-700" },
    { key: "want_installment", label: t("inquiry_installment"), color: "bg-orange-100 text-orange-700" },
    { key: "want_insurance", label: t("inquiry_insurance"), color: "bg-green-100 text-green-700" },
    { key: "want_trade_in", label: t("inquiry_trade_in"), color: "bg-pink-100 text-pink-700" },
  ].filter(({ key }) => inquiry[key as keyof Inquiry]);

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMarking(true);
    try {
      await api.patch(`/inquiries/${inquiry.id}/read`);
      onMarkRead(inquiry.id);
    } catch {}
    finally { setMarking(false); }
  };

  const handleAction = async (e: React.MouseEvent, action: "accept" | "decline") => {
    e.stopPropagation();
    setActioning(action);
    try {
      await api.patch(`/inquiries/${inquiry.id}/${action}`);
      onStatusChange(inquiry.id, action === "accept" ? "accepted" : "declined");
      onMarkRead(inquiry.id);
    } catch {}
    finally { setActioning(null); }
  };

  const date = new Date(inquiry.created_at).toLocaleDateString("de-CH", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden
        ${!inquiry.is_read
          ? "border-primary-200 shadow-md shadow-primary-50 hover:shadow-lg hover:shadow-primary-100"
          : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
        }
      `}
    >
      {/* Unread accent bar */}
      {!inquiry.is_read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-l-2xl" />
      )}

      {/* Card header — always visible */}
      <button
        className="w-full text-left p-5 pl-6"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
              ${!inquiry.is_read ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"}`}>
              {inquiry.first_name[0]}{inquiry.last_name[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 text-sm">
                  {inquiry.first_name} {inquiry.last_name}
                </p>
                {!inquiry.is_read && (
                  <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full" />
                )}
                {inquiry.status === "accepted" && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Akzeptiert</span>
                )}
                {inquiry.status === "declined" && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Abgelehnt</span>
                )}
              </div>
              {inquiry.listing_title && (
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {t("inquiry_for_listing")}: <span className="text-primary-600 font-medium">{inquiry.listing_title}</span>
                </p>
              )}
            </div>
          </div>

          {/* Right side: date + chevron */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-400 hidden sm:block">{date}</span>
            {expanded
              ? <ChevronUp className="w-4 h-4 text-gray-400 transition-transform duration-200" />
              : <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
            }
          </div>
        </div>

        {/* Flags row */}
        {flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pl-13">
            {flags.map(({ key, label, color }) => (
              <Badge key={key} label={label} color={color} />
            ))}
          </div>
        )}

        {/* Message preview */}
        {!expanded && inquiry.message && (
          <p className="text-xs text-gray-500 mt-2 ml-13 line-clamp-1 pl-0">
            {inquiry.message}
          </p>
        )}
      </button>

      {/* Expanded details */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden
          ${expanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-5 pb-5 pl-6 border-t border-gray-50 pt-4 space-y-4">
          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`mailto:${inquiry.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 p-3 bg-gray-50 hover:bg-primary-50 rounded-xl group/link transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">{t("inquiry_email")}</p>
                <p className="text-sm font-medium text-gray-800 truncate group-hover/link:text-primary-700">
                  {inquiry.email}
                </p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover/link:text-primary-500 ml-auto flex-shrink-0" />
            </a>

            {inquiry.phone && (
              <a
                href={`tel:${inquiry.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2.5 p-3 bg-gray-50 hover:bg-green-50 rounded-xl group/link transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{t("inquiry_phone")}</p>
                  <p className="text-sm font-medium text-gray-800 group-hover/link:text-green-700">
                    {inquiry.phone}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover/link:text-green-500 ml-auto flex-shrink-0" />
              </a>
            )}
          </div>

          {/* Message */}
          {inquiry.message && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t("inquiry_message")}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{inquiry.message}</p>
            </div>
          )}

          {/* Requests */}
          {flags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t("inquiry_requests")}</p>
              <div className="flex flex-wrap gap-2">
                {flags.map(({ key, label, color }) => (
                  <Badge key={key} label={label} color={color} />
                ))}
              </div>
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {date}
            </div>
            <div className="flex items-center gap-2">
              {inquiry.listing_title && (
                <Link
                  href={`/listings/${inquiry.listing_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 font-medium"
                >
                  <Car className="w-3.5 h-3.5" />
                  {t("inquiry_for_listing")}
                </Link>
              )}
              {!inquiry.is_read && (
                <button
                  onClick={handleMarkRead}
                  disabled={marking}
                  className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t("inquiry_mark_read")}
                </button>
              )}
              {inquiry.status === "pending" && (
                <>
                  <button
                    onClick={(e) => handleAction(e, "accept")}
                    disabled={!!actioning}
                    className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {actioning === "accept"
                      ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <ThumbsUp className="w-3.5 h-3.5" />
                    }
                    Akzeptieren
                  </button>
                  <button
                    onClick={(e) => handleAction(e, "decline")}
                    disabled={!!actioning}
                    className="flex items-center gap-1.5 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {actioning === "decline"
                      ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <ThumbsDown className="w-3.5 h-3.5" />
                    }
                    Ablehnen
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InquiriesPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const t = useT();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const { refresh: refreshBadge } = useUnreadCount();

  const fetchInquiries = () => {
    api.get("/inquiries/me")
      .then((r) => setInquiries(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login"); return; }
    fetchInquiries();
    window.addEventListener("new-inquiry", fetchInquiries);
    return () => window.removeEventListener("new-inquiry", fetchInquiries);
  }, [user, authLoading]);

  const handleMarkRead = (id: number) => {
    setInquiries((prev) => prev.map((inq) => inq.id === id ? { ...inq, is_read: true } : inq));
    window.dispatchEvent(new Event("refresh-unread"));
  };

  const handleStatusChange = (id: number, status: "accepted" | "declined") => {
    setInquiries((prev) => prev.map((inq) => inq.id === id ? { ...inq, status } : inq));
  };

  const filtered = inquiries.filter((inq) => {
    if (filter === "unread") return !inq.is_read;
    if (filter === "read") return inq.is_read;
    return true;
  });

  const unreadCount = inquiries.filter((i) => !i.is_read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profile" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("detail_back")}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("inquiry_inbox_title")}</h1>
            <p className="text-sm text-gray-400 mt-1">{t("inquiry_inbox_subtitle")}</p>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-xl px-4 py-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-primary-700">{unreadCount} {t("inquiry_unread")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {(["all", "unread", "read"] as Filter[]).map((f) => {
          const labels: Record<Filter, string> = {
            all: t("inquiry_all"),
            unread: t("inquiry_unread_filter"),
            read: t("inquiry_read_filter"),
          };
          const counts: Record<Filter, number> = {
            all: inquiries.length,
            unread: inquiries.filter((i) => !i.is_read).length,
            read: inquiries.filter((i) => i.is_read).length,
          };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                ${filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {labels[f]}
              {counts[f] > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold
                  ${filter === f ? "bg-primary-100 text-primary-700" : "bg-gray-200 text-gray-500"}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 font-medium">{t("inquiry_no_inquiries")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inq, i) => (
            <div
              key={inq.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <InquiryCard inquiry={inq} onMarkRead={handleMarkRead} onStatusChange={handleStatusChange} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
