"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { BlockReportMenu } from "@/components/ui/BlockReportMenu";
import type { Profile } from "@/types";

export default function ChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const { messages, loading, sending, sendMessage, bottomRef } = useChat(matchId);
  const [myId, setMyId] = useState<string | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMyId(user.id);

      const { data: match } = await supabase
        .from("matches")
        .select("user1_id, user2_id")
        .eq("id", matchId)
        .single();

      if (!match) { router.push("/matches"); return; }

      const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id;

      const { data: partnerProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", partnerId)
        .single();

      setPartner(partnerProfile);
    };

    load();
  }, [matchId, router, supabase]);

  const handleBlock = () => {
    router.push("/matches");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -mx-4 -my-6">
      {/* チャットヘッダー */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => router.push("/matches")}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ←
        </button>
        <span className="font-semibold text-gray-800 flex-1">
          {partner?.nickname ?? "..."}
        </span>
        {partner && (
          <button
            onClick={() => setShowMenu(true)}
            className="text-gray-400 hover:text-gray-600 text-xl px-1"
          >
            ⋯
          </button>
        )}
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">読み込み中...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">最初のメッセージを送ってみましょう</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isMine={msg.sender_id === myId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* メッセージ入力 */}
      <div className="flex-shrink-0">
        <MessageInput onSend={sendMessage} disabled={sending} />
      </div>

      {/* ブロック・通報メニュー */}
      {showMenu && partner && (
        <BlockReportMenu
          targetId={partner.id}
          targetName={partner.nickname}
          onBlock={handleBlock}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
