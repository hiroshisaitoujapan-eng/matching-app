"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Match, Profile } from "@/types";

interface MatchWithPartner extends Match {
  partner: Profile;
  lastMessage?: { content: string; created_at: string; is_read: boolean; sender_id: string };
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMyId(user.id);

      const { data: matchRows } = await supabase
        .from("matches")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!matchRows?.length) { setLoading(false); return; }

      const enriched: MatchWithPartner[] = await Promise.all(
        matchRows.map(async (m) => {
          const partnerId = m.user1_id === user.id ? m.user2_id : m.user1_id;

          const { data: partner } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", partnerId)
            .single();

          const { data: lastMsgRows } = await supabase
            .from("messages")
            .select("content, created_at, is_read, sender_id")
            .eq("match_id", m.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return { ...m, partner, lastMessage: lastMsgRows?.[0] };
        })
      );

      setMatches(enriched);
      setLoading(false);
    };

    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">マッチ一覧</h1>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-5xl mb-4">💕</div>
          <p className="text-gray-500 font-medium">まだマッチングがありません</p>
          <p className="text-sm text-gray-400 mt-2">スワイプしていいねしてみましょう</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {matches.map((m) => {
            const unread =
              m.lastMessage && !m.lastMessage.is_read && m.lastMessage.sender_id !== myId;

            return (
              <li key={m.id}>
                <Link
                  href={`/chat/${m.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-gray-50 transition"
                >
                  <PartnerAvatar partner={m.partner} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{m.partner.nickname}</span>
                      {m.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {new Date(m.lastMessage.created_at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${unread ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                      {m.lastMessage?.content ?? "マッチングしました！メッセージを送ってみましょう"}
                    </p>
                  </div>
                  {unread && (
                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full flex-shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PartnerAvatar({ partner }: { partner: Profile }) {
  const [url, setUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!partner.photos[0]) return;
    supabase.storage.from("avatars").createSignedUrl(partner.photos[0], 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl);
    });
  }, [partner.photos, supabase]);

  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={partner.nickname} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
  ) : (
    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl flex-shrink-0">
      👤
    </div>
  );
}
