"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types";

export function useChat(matchId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 初回メッセージ取得
  useEffect(() => {
    supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages(data ?? []);
        setLoading(false);
      });
  }, [matchId, supabase]);

  // Realtimeでリアルタイム受信
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId, supabase]);

  // 新メッセージ到着時にスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 既読更新（自分宛の未読メッセージを既読に）
  useEffect(() => {
    const markAsRead = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("match_id", matchId)
        .eq("is_read", false)
        .neq("sender_id", user.id);
    };

    if (!loading) markAsRead();
  }, [loading, matchId, supabase]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSending(false); return; }

    const { data: inserted } = await supabase
      .from("messages")
      .insert({ match_id: matchId, sender_id: user.id, content: content.trim() })
      .select()
      .single();

    if (inserted) {
      // マッチ相手を取得してWeb Push通知を送信
      const { data: match } = await supabase
        .from("matches")
        .select("user1_id, user2_id")
        .eq("id", matchId)
        .single();

      if (match) {
        const recipientId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        await fetch("/api/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: recipientId,
            title: "新しいメッセージ",
            body: content.trim().slice(0, 50),
            url: `/chat/${matchId}`,
          }),
        });
      }
    }

    setSending(false);
  };

  return { messages, loading, sending, sendMessage, bottomRef };
}
