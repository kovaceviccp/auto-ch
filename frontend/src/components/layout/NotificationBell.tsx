"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Heart, Send, TrendingDown, CheckCircle2, XCircle, MessageCircle, X } from "lucide-react";
import { useNotificationStore, AppNotification, NotifType } from "@/store/notifications";

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "gerade eben";
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`;
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`;
  return `vor ${Math.floor(diff / 86400)} T.`;
}

const TYPE_CONFIG: Record<NotifType, { icon: React.FC<{ className?: string }>; bg: string; text: string; ring: string }> = {
  offer:      { icon: Send,         bg: "bg-indigo-100", text: "text-indigo-600", ring: "ring-indigo-200" },
  like:       { icon: Heart,        bg: "bg-rose-100",   text: "text-rose-500",   ring: "ring-rose-200" },
  price_drop: { icon: TrendingDown, bg: "bg-emerald-100",text: "text-emerald-600",ring: "ring-emerald-200" },
  accepted:   { icon: CheckCircle2, bg: "bg-green-100",  text: "text-green-600",  ring: "ring-green-200" },
  declined:   { icon: XCircle,      bg: "bg-red-100",    text: "text-red-500",    ring: "ring-red-200" },
  message:    { icon: MessageCircle,bg: "bg-blue-100",   text: "text-blue-500",   ring: "ring-blue-200" },
};

function navTarget(n: AppNotification): string {
  if (n.type === "offer") return "/inquiries";
  if (n.type === "accepted" || n.type === "declined") return "/my-offers";
  if (n.type === "message") return "/chat";
  if (n.listing_id) return `/listings/${n.listing_id}`;
  return "/";
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, clear } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleClick = (n: AppNotification) => {
    setOpen(false);
    router.push(navTarget(n));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className={`relative p-2 rounded-lg transition-colors ${open ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-primary-600 hover:bg-primary-50"}`}
        title="Benachrichtigungen"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-0.5 animate-bounce-once">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-dropdown">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-700" />
              <span className="font-semibold text-gray-900 text-sm">Benachrichtigungen</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{unreadCount} neu</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-800 font-medium px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors">
                    Alle gelesen
                  </button>
                  <button onClick={clear} className="p-1 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 font-medium">Keine Benachrichtigungen</p>
                <p className="text-xs text-gray-300 mt-1">Neue Aktivitäten erscheinen hier</p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type];
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-50 last:border-0 animate-fade-in-up`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className={`w-8 h-8 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ${cfg.ring}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-tight ${n.read ? "text-gray-500" : "text-gray-900"}`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                      <p className="text-xs text-gray-300 mt-1">{timeAgo(n.timestamp)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
