"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface SwipeCardProps {
  profile: Profile;
  style?: React.CSSProperties;
  bindGesture?: object;
  onLike?: () => void;
  onSkip?: () => void;
  isTop?: boolean;
}

function calcAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function SwipeCard({ profile, style, bindGesture, onLike, onSkip, isTop }: SwipeCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!profile.photos.length) return;
    Promise.all(
      profile.photos.map((path) =>
        supabase.storage.from("avatars").createSignedUrl(path, 3600).then(({ data }) => data?.signedUrl ?? "")
      )
    ).then((urls) => setPhotoUrls(urls.filter(Boolean)));
  }, [profile.photos, supabase]);

  const handleTap = (e: React.MouseEvent) => {
    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    if (clientX - left > width / 2) {
      setPhotoIndex((i) => Math.min(i + 1, photoUrls.length - 1));
    } else {
      setPhotoIndex((i) => Math.max(i - 1, 0));
    }
  };

  return (
    <div
      style={style}
      className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-gray-200 select-none touch-none"
      {...bindGesture}
    >
      {/* 写真 */}
      <div className="relative w-full h-full cursor-pointer" onClick={handleTap}>
        {photoUrls[photoIndex] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrls[photoIndex]}
            alt={profile.nickname}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
            👤
          </div>
        )}

        {/* 写真インジケーター */}
        {photoUrls.length > 1 && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1">
            {photoUrls.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === photoIndex ? "bg-white w-6" : "bg-white/50 w-3"
                }`}
              />
            ))}
          </div>
        )}

        {/* プロフィール情報 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="text-2xl font-bold">{profile.nickname}</h2>
            <span className="text-xl">{calcAge(profile.birth_date)}歳</span>
          </div>
          {profile.location && (
            <p className="text-sm text-white/80 mb-1">📍 {profile.location}</p>
          )}
          {profile.bio && (
            <p className="text-sm text-white/90 line-clamp-2">{profile.bio}</p>
          )}
          {profile.hobbies.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.hobbies.slice(0, 4).map((h) => (
                <span key={h} className="text-xs bg-white/20 rounded-full px-2 py-0.5">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* いいね・スキップボタン（最前面カードのみ） */}
      {isTop && (
        <div className="absolute bottom-[-64px] left-0 right-0 flex justify-center gap-8">
          <button
            onClick={onSkip}
            className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition"
          >
            ✕
          </button>
          <button
            onClick={onLike}
            className="w-14 h-14 rounded-full bg-rose-500 shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition"
          >
            ♥
          </button>
        </div>
      )}
    </div>
  );
}
