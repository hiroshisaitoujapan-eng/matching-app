"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProfileForm, type ProfileFormValues } from "@/components/profile/ProfileForm";

export default function ProfileSetupPage() {
  const router = useRouter();
  const supabase = createClient();

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

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">プロフィール設定</h1>
      <p className="text-sm text-gray-500 mb-6">マッチングのために基本情報を入力してください</p>
      <ProfileForm onSubmit={handleSubmit} submitLabel="設定を完了する" />
    </div>
  );
}
