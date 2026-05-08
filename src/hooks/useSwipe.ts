"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchSwipeCandidates } from "@/lib/supabase/swipe";
import type { Profile, Match } from "@/types";

export function useSwipe() {
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMatch, setNewMatch] = useState<Match | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchSwipeCandidates().then((data) => {
      setCandidates(data);
      setLoading(false);
    });
  }, []);

  const like = async (targetId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // いいね登録
    await supabase.from("likes").insert({ from_user_id: user.id, to_user_id: targetId });

    // 相手が既に自分にいいねしているか確認
    const { data: mutualLike } = await supabase
      .from("likes")
      .select("id")
      .eq("from_user_id", targetId)
      .eq("to_user_id", user.id)
      .maybeSingle();

    if (mutualLike) {
      // マッチング成立：user1_id < user2_id で重複防止
      const [user1, user2] = [user.id, targetId].sort();
      const { data: match } = await supabase
        .from("matches")
        .insert({ user1_id: user1, user2_id: user2 })
        .select()
        .single();

      if (match) {
        // パートナー情報を付与
        const { data: partner } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", targetId)
          .single();

        setNewMatch({ ...match, partner: partner ?? undefined });
      }
    }

    removeCandidate(targetId);
  };

  const skip = async (targetId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("skips").insert({ from_user_id: user.id, to_user_id: targetId });
    removeCandidate(targetId);
  };

  const removeCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const dismissMatch = () => setNewMatch(null);

  return { candidates, loading, newMatch, like, skip, dismissMatch };
}
