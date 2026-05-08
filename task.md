# タスク一覧

## ステータス凡例
- 🔴 未実装
- 🟢 最小実装済
- ✅️ リファクタリング済
- ⚠️ ブロック済

---

## Phase 0: 環境構築

| # | タスク | ステータス | ブランチ |
|---|--------|----------|---------|
| 0-1 | GitHub リポジトリ作成・初期コミット | 🔴 | - |
| 0-2 | Next.js + TypeScript + Tailwind CSS プロジェクト初期化 | ✅️ | - |
| 0-3 | Supabase プロジェクト作成・環境変数設定 | ✅️ | - |
| 0-4 | Vercel プロジェクト作成・GitHub 連携・環境変数設定 | 🔴 | - |
| 0-5 | Supabase クライアント設定（browser / server 両対応） | ✅️ | - |

---

## Phase 1: 認証機能

| # | タスク | ステータス | ブランチ |
|---|--------|----------|---------|
| 1-1 | 会員登録ページ実装（メール + パスワード） | ✅️ | feature/auth |
| 1-2 | ログインページ実装 | ✅️ | feature/auth |
| 1-3 | ログアウト機能実装 | ✅️ | feature/auth |
| 1-4 | 認証ミドルウェア実装（未認証ならログインへリダイレクト） | ✅️ | feature/auth |
| 1-5 | useAuth フック実装 | ✅️ | feature/auth |

---

## Phase 2: プロフィール機能

| # | タスク | ステータス | ブランチ |
|---|--------|----------|---------|
| 2-1 | profiles テーブル + RLS マイグレーション作成 | 🟢 | feature/profile |
| 2-2 | 初回プロフィール設定ページ実装（必須項目） | 🟢 | feature/profile |
| 2-3 | 写真アップロード機能実装（Supabase Storage） | 🟢 | feature/profile |
| 2-4 | プロフィール編集ページ実装 | 🟢 | feature/profile |
| 2-5 | プロフィール未設定の場合は /profile/setup へリダイレクト | 🟢 | feature/profile |

---

## Phase 3: スワイプ機能

| # | タスク | ステータス | ブランチ |
|---|--------|----------|---------|
| 3-1 | likes / skips / matches テーブル + RLS マイグレーション作成 | 🟢 | feature/swipe |
| 3-2 | スワイプ候補ユーザー取得ロジック実装（異性・未いいね・未スキップ・未ブロック除外） | 🟢 | feature/swipe |
| 3-3 | SwipeCard コンポーネント実装（写真切り替え・プロフィール表示） | 🟢 | feature/swipe |
| 3-4 | SwipeStack コンポーネント実装（ドラッグ＆スワイプアニメーション） | 🟢 | feature/swipe |
| 3-5 | useSwipe フック実装（いいね・スキップの DB 書き込み） | 🟢 | feature/swipe |
| 3-6 | スワイプ候補なし時の EmptyState 表示 | 🟢 | feature/swipe |

---

## Phase 4: マッチング機能

| # | タスク | ステータス | ブランチ |
|---|--------|----------|---------|
| 4-1 | いいね送信時のマッチング判定ロジック実装（相互いいね確認→matches INSERT） | 🟢 | feature/matching |
| 4-2 | マッチング成立時の祝福モーダル（MatchModal）実装 | 🟢 | feature/matching |
| 4-3 | マッチ一覧ページ実装（/matches） | 🟢 | feature/matching |

---

## Phase 5: チャット機能

| # | タスク | ステータス | ブランチ |
|---|--------|----------|---------|
| 5-1 | messages テーブル + RLS マイグレーション作成 | 🟢 | feature/chat |
| 5-2 | チャット画面実装（/chat/[matchId]） | 🟢 | feature/chat |
| 5-3 | useChat フック実装（Supabase Realtime でリアルタイム受信） | 🟢 | feature/chat |
| 5-4 | メッセージ送信機能実装 | 🟢 | feature/chat |
| 5-5 | 既読フラグ更新実装 | 🟢 | feature/chat |

---

## Phase 6: 通知機能

| # | タスク | ステータス | ブランチ |
|---|--------|----------|---------|
| 6-1 | アプリ内トースト通知実装（マッチング・新着メッセージ） | 🟢 | feature/notification |
| 6-2 | Web Push 通知実装（Service Worker + VAPID） | 🟢 | feature/notification |

---

## Phase 7: ブロック・通報機能

| # | タスク | ステータス | ブランチ |
|---|--------|----------|---------|
| 7-1 | blocks / reports テーブル + RLS マイグレーション作成 | 🟢 | feature/block-report |
| 7-2 | ブロック機能実装（スワイプ・チャット一覧から除外） | 🟢 | feature/block-report |
| 7-3 | 通報機能実装（カテゴリ + 詳細テキスト送信） | 🟢 | feature/block-report |

---

## Phase 8: 品質・最終調整

| # | タスク | ステータス | ブランチ |
|---|--------|----------|---------|
| 8-1 | レスポンシブデザイン確認・調整 | 🟢 | - |
| 8-2 | RLS ポリシー全体レビュー | 🟢 | - |
| 8-3 | 本番環境（Vercel + Supabase）での動作確認 | ✅️ | - |
