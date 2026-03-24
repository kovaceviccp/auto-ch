"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ToastItem, ToastList, ToastType } from "@/components/ui/Toast";

interface ToastContextValue {
  show: (type: ToastType, title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export const useToast = () => useContext(ToastContext);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    },
    []
  );

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastList toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}
