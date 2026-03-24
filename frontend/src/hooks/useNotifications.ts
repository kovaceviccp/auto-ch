"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/context/ToastContext";
import { useNotificationStore } from "@/store/notifications";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8001";
const WS_BASE = API_BASE.replace("http://", "ws://").replace("https://", "wss://");

export function useNotifications() {
  const { user } = useAuthStore();
  const { show } = useToast();
  const { add } = useNotificationStore();

  useEffect(() => {
    if (!user) return;
    const token = sessionStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/api/v1/notifications/ws?token=${token}`);

    ws.onmessage = (e) => {
      try {
        const { event, data } = JSON.parse(e.data);
        if (event === "OFFER_NEW") {
          const body = `${data.from_name} interessiert sich für: ${data.listing_title}`;
          show("offer", "Neues Angebot!", body);
          add({ type: "offer", title: "Neues Angebot!", body, listing_id: data.listing_id });
          window.dispatchEvent(new Event("new-inquiry"));
          window.dispatchEvent(new Event("refresh-unread"));
        } else if (event === "AD_LIKE") {
          const body = `${data.from_name} hat Ihr Inserat geliked`;
          show("like", "Inserat geliked ❤️", body);
          add({ type: "like", title: "Inserat geliked ❤️", body, listing_id: data.listing_id });
        } else if (event === "PRICE_DROP") {
          const body = `${data.listing_title}: CHF ${data.new_price.toLocaleString("de-CH")} (war ${data.old_price.toLocaleString("de-CH")})`;
          show("price_drop", "Preissenkung!", body);
          add({ type: "price_drop", title: "Preissenkung!", body, listing_id: data.listing_id });
        } else if (event === "OFFER_ACCEPTED") {
          const body = `Ihr Angebot für "${data.listing_title}" wurde akzeptiert!`;
          show("success", "Angebot akzeptiert ✓", body);
          add({ type: "accepted", title: "Angebot akzeptiert ✓", body, listing_id: data.listing_id });
          window.dispatchEvent(new CustomEvent("offer-status-changed", { detail: { listing_id: data.listing_id, status: "accepted" } }));
        } else if (event === "OFFER_DECLINED") {
          const body = `Ihr Angebot für "${data.listing_title}" wurde leider abgelehnt.`;
          show("error", "Angebot abgelehnt", body);
          add({ type: "declined", title: "Angebot abgelehnt", body, listing_id: data.listing_id });
          window.dispatchEvent(new CustomEvent("offer-status-changed", { detail: { listing_id: data.listing_id, status: "declined" } }));
        } else if (event === "MESSAGE") {
          const body = data.content;
          show("message", "Neue Nachricht", body);
          add({ type: "message", title: "Neue Nachricht", body });
        }
      } catch {}
    };

    ws.onerror = () => {};
    return () => ws.close();
  }, [user]);
}
