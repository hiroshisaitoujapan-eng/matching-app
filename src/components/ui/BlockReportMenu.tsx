"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ReportCategory } from "@/types";

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "harassment", label: "迷惑行為" },
  { value: "inappropriate_photo", label: "不適切な写真" },
  { value: "spam", label: "スパム" },
  { value: "other", label: "その他" },
];

interface BlockReportMenuProps {
  targetId: string;
  targetName: string;
  onBlock: () => void;
  onClose: () => void;
}

type Step = "menu" | "report" | "done";

export function BlockReportMenu({ targetId, targetName, onBlock, onClose }: BlockReportMenuProps) {
  const [step, setStep] = useState<Step>("menu");
  const [category, setCategory] = useState<ReportCategory>("harassment");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleBlock = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    await supabase.from("blocks").insert({ blocker_id: user.id, blocked_id: targetId });
    setLoading(false);
    onBlock();
    onClose();
  };

  const handleReport = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_id: targetId,
      category,
      detail: detail || null,
    });
    setLoading(false);
    setStep("done");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "menu" && (
          <>
            <h3 className="text-center font-bold text-gray-800 mb-6">
              {targetName} さん
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setStep("report")}
                className="w-full py-3 text-orange-500 font-medium border border-orange-200 rounded-xl hover:bg-orange-50 transition"
              >
                通報する
              </button>
              <button
                onClick={handleBlock}
                disabled={loading}
                className="w-full py-3 text-red-500 font-medium border border-red-200 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
              >
                {loading ? "処理中..." : "ブロックする"}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition"
              >
                キャンセル
              </button>
            </div>
          </>
        )}

        {step === "report" && (
          <>
            <h3 className="font-bold text-gray-800 mb-4">通報の理由を選択してください</h3>
            <div className="space-y-2 mb-4">
              {CATEGORIES.map((c) => (
                <label key={c.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={c.value}
                    checked={category === c.value}
                    onChange={() => setCategory(c.value)}
                    className="accent-rose-500"
                  />
                  <span className="text-gray-700">{c.label}</span>
                </label>
              ))}
            </div>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="詳細（任意）"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setStep("menu")}
                className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition"
              >
                戻る
              </button>
              <button
                onClick={handleReport}
                disabled={loading}
                className="flex-1 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
              >
                {loading ? "送信中..." : "通報する"}
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-bold text-gray-800 mb-1">通報を受け付けました</p>
            <p className="text-sm text-gray-500 mb-6">ご報告ありがとうございます</p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
