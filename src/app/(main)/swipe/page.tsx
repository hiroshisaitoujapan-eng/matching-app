"use client";

import { useSwipe } from "@/hooks/useSwipe";
import { SwipeStack } from "@/components/swipe/SwipeStack";
import { MatchModal } from "@/components/swipe/MatchModal";

export default function SwipePage() {
  const { candidates, loading, newMatch, like, skip, dismissMatch } = useSwipe();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold text-gray-800 mb-6">おすすめ</h1>

      {candidates.length > 0 ? (
        <SwipeStack candidates={candidates} onLike={like} onSkip={skip} />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-5xl mb-4">😴</div>
          <p className="text-gray-500 font-medium">今日の候補はここまでです</p>
          <p className="text-sm text-gray-400 mt-2">明日また新しい候補が表示されます</p>
        </div>
      )}

      {newMatch && (
        <MatchModal match={newMatch} onClose={dismissMatch} />
      )}
    </div>
  );
}
