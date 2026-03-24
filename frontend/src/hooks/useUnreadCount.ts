"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export function useUnreadCount() {
  const { user } = useAuthStore();
  const [chatCount, setChatCount] = useState(0);
  const [inquiryCount, setInquiryCount] = useState(0);

  const refresh = useCallback(() => {
    if (!user) { setChatCount(0); setInquiryCount(0); return; }
    api.get("/chat/unread-total").then((r) => setChatCount(r.data.total ?? 0)).catch(() => {});
    api.get("/inquiries/unread-count").then((r) => setInquiryCount(r.data.total ?? 0)).catch(() => {});
  }, [user]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    window.addEventListener("refresh-unread", refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener("refresh-unread", refresh);
    };
  }, [refresh]);

  return { chatCount, inquiryCount, refresh };
}
