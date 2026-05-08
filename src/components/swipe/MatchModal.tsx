"use client";

import Link from "next/link";
import type { Match } from "@/types";

interface MatchModalProps {
  match: Match;
  onClose: () => void;
}

export function MatchModal({ match, onClose }: MatchModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 mx-6 text-center max-w-sm w-full">
        <div className="text-5xl mb-3">💕</div>
        <h2 className="text-2xl font-bold text-rose-500 mb-1">マッチング成立！</h2>
        <p className="text-gray-500 mb-6">
          {match.partner?.nickname ?? "相手"} さんとマッチングしました！
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition"
          >
            続けてスワイプ
          </button>
          <Link
            href={`/chat/${match.id}`}
            className="flex-1 bg-rose-500 text-white font-bold py-3 rounded-xl hover:bg-rose-600 transition text-center"
            onClick={onClose}
          >
            メッセージ送る
          </Link>
        </div>
      </div>
    </div>
  );
}
