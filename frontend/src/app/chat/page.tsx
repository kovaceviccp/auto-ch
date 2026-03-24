"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { ChatRoom } from "@/types";
import { MessageCircle, Car } from "lucide-react";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8001";

export default function ChatListPage() {
  const { user } = useAuthStore();
  const t = useT();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get("/chat/rooms")
      .then((r) => setRooms(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <MessageCircle className="w-12 h-12 text-gray-200" />
        <p className="text-gray-500 font-medium">{t("profile_not_logged")}</p>
        <Link href="/auth/login" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm">
          {t("profile_login_btn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t("chat_title")}</h1>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3 animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <MessageCircle className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t("chat_empty")}</p>
          <p className="text-gray-400 text-sm mt-1">{t("chat_empty_sub")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/chat/${room.id}`}
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
            >
              {room.listing_image ? (
                <img src={`${API_BASE}${room.listing_image}`} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-6 h-6 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm truncate">{room.other_user_name}</p>
                  {room.unread_count > 0 && (
                    <span className="flex-shrink-0 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {room.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{room.listing_title}</p>
                {room.last_message && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{room.last_message}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
