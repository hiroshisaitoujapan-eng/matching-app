"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

const MAX_PHOTOS = 5;

export function PhotoUploader({ photos, onChange }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - photos.length;
    const targets = files.slice(0, remaining);

    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("未認証です");

      const uploadedUrls: string[] = [];

      for (const file of targets) {
        if (!file.type.startsWith("image/")) {
          setError("画像ファイルのみアップロードできます");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("ファイルサイズは5MB以下にしてください");
          continue;
        }

        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data } = await supabase.storage
          .from("avatars")
          .createSignedUrl(path, 60 * 60 * 24 * 365);

        if (data?.signedUrl) {
          uploadedUrls.push(path);
        }
      }

      onChange([...photos, ...uploadedUrls]);
    } catch (err) {
      setError("アップロードに失敗しました");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (path: string, index: number) => {
    await supabase.storage.from("avatars").remove([path]);
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        プロフィール写真（最大{MAX_PHOTOS}枚）
      </label>

      <div className="flex flex-wrap gap-3 mb-3">
        {photos.map((path, i) => (
          <PhotoPreview key={path} path={path} onRemove={() => handleRemove(path, i)} />
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 hover:border-rose-400 hover:text-rose-400 transition disabled:opacity-50"
          >
            {uploading ? "..." : "+"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

function PhotoPreview({ path, onRemove }: { path: string; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const supabase = createClient();

  if (!url) {
    supabase.storage.from("avatars").createSignedUrl(path, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl);
    });
  }

  return (
    <div className="relative w-24 h-24">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="プロフィール写真" className="w-24 h-24 object-cover rounded-xl" />
      ) : (
        <div className="w-24 h-24 bg-gray-100 rounded-xl animate-pulse" />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
      >
        ×
      </button>
    </div>
  );
}
