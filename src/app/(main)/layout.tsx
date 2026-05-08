"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const supabase = createClient();

  // マッチング・新着メッセージのRealtime通知
  useEffect(() => {
    if (!user) return;

    // 新規マッチング通知
    const matchChannel = supabase
      .channel("notify:matches")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `user1_id=eq.${user.id}`,
        },
        () => showToast("match", "新しいマッチングが成立しました！")
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `user2_id=eq.${user.id}`,
        },
        () => showToast("match", "新しいマッチングが成立しました！")
      )
      .subscribe();

    // 新着メッセージ通知（チャット画面以外）
    const messageChannel = supabase
      .channel("notify:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as { sender_id: string; content: string };
          if (msg.sender_id === user.id) return;
          if (pathname.startsWith("/chat/")) return;
          showToast("message", `新しいメッセージが届きました`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [user, pathname, supabase, showToast]);

  const navItems = [
    { href: "/swipe", label: "スワイプ", icon: "💕" },
    { href: "/matches", label: "マッチ", icon: "💬" },
    { href: "/profile/edit", label: "プロフィール", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-bold text-rose-500">💕 マッチング</span>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* ボトムナビゲーション */}
      <nav className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-md mx-auto flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 text-xs transition ${
                pathname === item.href
                  ? "text-rose-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
