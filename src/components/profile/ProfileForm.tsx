"use client";

import { useState } from "react";
import { PhotoUploader } from "./PhotoUploader";
import type { Gender, Profile } from "@/types";

const HOBBY_TAGS = [
  "映画", "音楽", "読書", "旅行", "料理", "スポーツ",
  "ゲーム", "アウトドア", "カフェ巡り", "写真", "アート", "ファッション",
];

interface ProfileFormProps {
  initialValues?: Partial<Profile>;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  submitLabel: string;
}

export interface ProfileFormValues {
  nickname: string;
  gender: Gender;
  birth_date: string;
  bio: string;
  location: string;
  hobbies: string[];
  photos: string[];
}

export function ProfileForm({ initialValues, onSubmit, submitLabel }: ProfileFormProps) {
  const [nickname, setNickname] = useState(initialValues?.nickname ?? "");
  const [gender, setGender] = useState<Gender>(initialValues?.gender ?? "female");
  const [birthDate, setBirthDate] = useState(initialValues?.birth_date ?? "");
  const [bio, setBio] = useState(initialValues?.bio ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [hobbies, setHobbies] = useState<string[]>(initialValues?.hobbies ?? []);
  const [photos, setPhotos] = useState<string[]>(initialValues?.photos ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleHobby = (tag: string) => {
    setHobbies((prev) =>
      prev.includes(tag) ? prev.filter((h) => h !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit({ nickname, gender, birth_date: birthDate, bio, location, hobbies, photos });
    } catch {
      setError("保存に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 写真 */}
      <PhotoUploader photos={photos} onChange={setPhotos} />

      {/* ニックネーム */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ニックネーム <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          maxLength={20}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
          placeholder="例：太郎"
        />
      </div>

      {/* 性別 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          性別 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          {(["female", "male"] as Gender[]).map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={gender === g}
                onChange={() => setGender(g)}
                className="accent-rose-500"
              />
              <span>{g === "female" ? "女性" : "男性"}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 生年月日 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          生年月日 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
          max={new Date().toISOString().split("T")[0]}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
      </div>

      {/* 自己紹介 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          自己紹介文 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
          rows={4}
          maxLength={300}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
          placeholder="趣味や自己PRを書いてください"
        />
        <p className="text-xs text-gray-400 text-right">{bio.length}/300</p>
      </div>

      {/* 居住地 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          居住地（任意）
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={30}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
          placeholder="例：東京都"
        />
      </div>

      {/* 趣味タグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          趣味（任意・複数選択可）
        </label>
        <div className="flex flex-wrap gap-2">
          {HOBBY_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleHobby(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                hobbies.includes(tag)
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-rose-400"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
      >
        {loading ? "保存中..." : submitLabel}
      </button>
    </form>
  );
}
