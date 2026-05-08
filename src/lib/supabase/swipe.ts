import { createClient } from "./client";
import type { Profile } from "@/types";

// 自分の性別に基づいて異性のスワイプ候補を取得
export async function fetchSwipeCandidates(limit = 10): Promise<Profile[]> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // 自分のプロフィールを取得
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("gender")
    .eq("id", user.id)
    .single();

  if (!myProfile) return [];

  const oppositeGender = myProfile.gender === "male" ? "female" : "male";
  const today = new Date().toISOString().split("T")[0];

  // いいね済みのユーザーID一覧
  const { data: liked } = await supabase
    .from("likes")
    .select("to_user_id")
    .eq("from_user_id", user.id);

  // 当日スキップ済みのユーザーID一覧
  const { data: skipped } = await supabase
    .from("skips")
    .select("to_user_id")
    .eq("from_user_id", user.id)
    .gte("created_at", `${today}T00:00:00`);

  // ブロック済みのユーザーID一覧
  const { data: blocked } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", user.id);

  const excludeIds = [
    user.id,
    ...(liked?.map((r) => r.to_user_id) ?? []),
    ...(skipped?.map((r) => r.to_user_id) ?? []),
    ...(blocked?.map((r) => r.blocked_id) ?? []),
  ];

  const { data: candidates } = await supabase
    .from("profiles")
    .select("*")
    .eq("gender", oppositeGender)
    .eq("is_profile_complete", true)
    .not("id", "in", `(${excludeIds.join(",")})`)
    .limit(limit);

  return candidates ?? [];
}
