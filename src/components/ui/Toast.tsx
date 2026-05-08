"use client";

import type { Toast as ToastType } from "@/hooks/useToast";

const ICONS: Record<ToastType["type"], string> = {
  match: "💕",
  message: "💬",
  info: "ℹ️",
  error: "⚠️",
};

const COLORS: Record<ToastType["type"], string> = {
  match: "bg-rose-500",
  message: "bg-indigo-500",
  info: "bg-gray-700",
  error: "bg-red-600",
};

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${COLORS[toast.type]} text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 pointer-events-auto max-w-sm w-full animate-slide-down`}
          onClick={() => onRemove(toast.id)}
        >
          <span className="text-lg">{ICONS[toast.type]}</span>
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button className="text-white/70 hover:text-white text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  );
}
