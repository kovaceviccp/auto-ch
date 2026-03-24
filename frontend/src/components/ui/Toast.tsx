"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X, Bell, TrendingDown, Heart, MessageSquare } from "lucide-react";

export type ToastType = "offer" | "like" | "price_drop" | "success" | "error" | "info" | "message";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const CONFIG: Record<ToastType, { bg: string; text: string; icon: React.ReactNode }> = {
  offer: {
    bg: "bg-indigo-600",
    text: "text-white",
    icon: <Bell className="w-5 h-5 shrink-0" />,
  },
  like: {
    bg: "bg-rose-500",
    text: "text-white",
    icon: <Heart className="w-5 h-5 shrink-0" />,
  },
  price_drop: {
    bg: "bg-emerald-500",
    text: "text-white",
    icon: <TrendingDown className="w-5 h-5 shrink-0" />,
  },
  success: {
    bg: "bg-green-600",
    text: "text-white",
    icon: <CheckCircle2 className="w-5 h-5 shrink-0" />,
  },
  error: {
    bg: "bg-red-600",
    text: "text-white",
    icon: <AlertCircle className="w-5 h-5 shrink-0" />,
  },
  info: {
    bg: "bg-gray-700",
    text: "text-white",
    icon: <Info className="w-5 h-5 shrink-0" />,
  },
  message: {
    bg: "bg-blue-600",
    text: "text-white",
    icon: <MessageSquare className="w-5 h-5 shrink-0" />,
  },
};

interface SingleToastProps {
  item: ToastItem;
  onRemove: (id: string) => void;
}

function SingleToast({ item, onRemove }: SingleToastProps) {
  const [visible, setVisible] = useState(false);
  const { bg, text, icon } = CONFIG[item.type];
  const duration = item.duration ?? 4000;

  useEffect(() => {
    // Trigger slide-in on mount
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Auto-dismiss
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(item.id), 350);
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [item.id, duration, onRemove]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onRemove(item.id), 350);
  };

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl
        min-w-[280px] max-w-[360px] cursor-default select-none
        transition-all duration-350 ease-out
        ${bg} ${text}
        ${visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
      `}
      style={{ transitionProperty: "transform, opacity" }}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-snug truncate">{item.title}</p>
        {item.message && (
          <p className="text-xs mt-0.5 opacity-90 leading-snug line-clamp-2">{item.message}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="mt-0.5 opacity-70 hover:opacity-100 transition-opacity shrink-0"
        aria-label="Schließen"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastListProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastList({ toasts, onRemove }: ToastListProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <SingleToast item={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
