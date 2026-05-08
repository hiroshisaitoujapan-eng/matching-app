"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProfileForm, type ProfileFormValues } from "@/components/profile/ProfileForm";
import type { Profile } from "@/types";

export default function ProfileEditPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    })();
  }, [supabase]);

  const handleSubmit = async (values: ProfileFormValues) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("未認証です");

    const { error } = await supabase
      .from("profiles")
      .update({
        nickname: values.nickname,
        gender: values.gender,
        birth_date: values.birth_date,
        bio: values.bio,
        location: values.location,
        hobbies: values.hobbies,
        photos: values.photos,
        is_profile_complete: true,
      })
      .eq("id", user.id);

    if (error) throw error;

    router.push("/swipe");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">プロフィール編集</h1>
      <p className="text-sm text-gray-500 mb-6">プロフィールを更新できます</p>
      {profile && (
        <ProfileForm
          initialValues={profile}
          onSubmit={handleSubmit}
          submitLabel="変更を保存する"
        />
      )}
    </div>
  );
}
