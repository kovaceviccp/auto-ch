"use client";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationInit() {
  useNotifications();
  return null;
}
