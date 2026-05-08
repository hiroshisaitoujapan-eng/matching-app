# 設計書

## アーキテクチャ概要

```
ブラウザ (Next.js App Router)
    │
    ├─ Supabase Auth (認証・セッション管理)
    ├─ Supabase Database (PostgreSQL + RLS)
    ├─ Supabase Realtime (チャットのリアルタイム更新)
    └─ Supabase Storage (プロフィール写真)

デプロイ: Vercel (GitHub main ブランチ連携)
```

---

## ディレクトリ構成

```
matching-app/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # 認証不要グループ
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/                 # 認証必須グループ
│   │   │   ├── layout.tsx          # 共通ナビゲーション
│   │   │   ├── swipe/page.tsx      # スワイプ画面
│   │   │   ├── matches/page.tsx    # マッチ一覧
│   │   │   ├── chat/[matchId]/page.tsx  # チャット画面
│   │   │   └── profile/
│   │   │       ├── setup/page.tsx  # 初回プロフィール設定
│   │   │       └── edit/page.tsx   # プロフィール編集
│   │   ├── layout.tsx
│   │   └── page.tsx                # ルートリダイレクト
│   ├── components/
│   │   ├── swipe/
│   │   │   ├── SwipeCard.tsx
│   │   │   ├── SwipeStack.tsx
│   │   │   └── MatchModal.tsx
│   │   ├── chat/
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── profile/
│   │   │   ├── ProfileForm.tsx
│   │   │   └── PhotoUploader.tsx
│   │   └── ui/                     # 共通UIコンポーネント
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Toast.tsx
│   ├── hooks/
│   │   ├── useSwipe.ts             # スワイプロジック
│   │   ├── useChat.ts              # チャットのRealtime購読
│   │   └── useAuth.ts             # 認証状態管理
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # ブラウザ用クライアント
│   │   │   └── server.ts           # サーバー用クライアント
│   │   └── utils.ts
│   └── types/
│       └── index.ts                # 共通型定義
├── supabase/
│   └── migrations/                 # DBマイグレーションSQL
├── public/
├── .env.local                      # 環境変数（Git管理外）
├── requirements.md
├── design.md
└── task.md
```

---

## データベース設計

### テーブル一覧

#### `profiles` テーブル
ユーザープロフィール情報。`auth.users` と1対1対応。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK, FK → auth.users) | ユーザーID |
| nickname | text NOT NULL | ニックネーム |
| gender | text NOT NULL | 'male' or 'female' |
| birth_date | date NOT NULL | 生年月日 |
| bio | text | 自己紹介文 |
| location | text | 居住地 |
| hobbies | text[] | 趣味タグ配列 |
| photos | text[] | 写真URLの配列（最大5枚） |
| is_profile_complete | boolean DEFAULT false | プロフィール設定完了フラグ |
| created_at | timestamptz DEFAULT now() | 作成日時 |
| updated_at | timestamptz DEFAULT now() | 更新日時 |

#### `likes` テーブル
いいね情報。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| from_user_id | uuid (FK → profiles) | いいねを送ったユーザー |
| to_user_id | uuid (FK → profiles) | いいねを受けたユーザー |
| created_at | timestamptz DEFAULT now() | |

- UNIQUE(from_user_id, to_user_id)

#### `skips` テーブル
スキップ情報（当日再表示しないために使用）。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| from_user_id | uuid (FK → profiles) | スキップしたユーザー |
| to_user_id | uuid (FK → profiles) | スキップされたユーザー |
| created_at | timestamptz DEFAULT now() | |

#### `matches` テーブル
マッチング成立情報。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | マッチID |
| user1_id | uuid (FK → profiles) | ユーザー1（likes.from_user_id） |
| user2_id | uuid (FK → profiles) | ユーザー2（likes.to_user_id） |
| created_at | timestamptz DEFAULT now() | マッチ成立日時 |

- UNIQUE(user1_id, user2_id)

#### `messages` テーブル
チャットメッセージ。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| match_id | uuid (FK → matches) | 対象マッチ |
| sender_id | uuid (FK → profiles) | 送信者 |
| content | text NOT NULL | メッセージ本文 |
| is_read | boolean DEFAULT false | 既読フラグ |
| created_at | timestamptz DEFAULT now() | |

#### `blocks` テーブル
ブロック情報。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| blocker_id | uuid (FK → profiles) | ブロックしたユーザー |
| blocked_id | uuid (FK → profiles) | ブロックされたユーザー |
| created_at | timestamptz DEFAULT now() | |

- UNIQUE(blocker_id, blocked_id)

#### `reports` テーブル
通報情報。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| reporter_id | uuid (FK → profiles) | 通報したユーザー |
| reported_id | uuid (FK → profiles) | 通報されたユーザー |
| category | text NOT NULL | 'harassment' / 'inappropriate_photo' / 'spam' / 'other' |
| detail | text | 詳細テキスト |
| created_at | timestamptz DEFAULT now() | |

---

## RLS（行レベルセキュリティ）設計

| テーブル | ポリシー |
|---------|---------|
| profiles | 本人のみ UPDATE。SELECT は全認証ユーザー可（ブロック除外はアプリ側で制御）|
| likes | from_user_id = 自分のみ INSERT/SELECT |
| skips | from_user_id = 自分のみ INSERT/SELECT |
| matches | user1_id または user2_id が自分のみ SELECT |
| messages | match に参加している自分のみ INSERT/SELECT |
| blocks | blocker_id = 自分のみ INSERT/SELECT |
| reports | reporter_id = 自分のみ INSERT |

---

## 画面設計

### 画面一覧

| パス | 画面名 | 認証 |
|------|--------|------|
| `/` | ルート（スワイプへリダイレクト） | - |
| `/login` | ログイン | 不要 |
| `/register` | 会員登録 | 不要 |
| `/profile/setup` | 初回プロフィール設定 | 必要 |
| `/swipe` | スワイプ（メイン画面） | 必要 |
| `/matches` | マッチ一覧・チャットルーム一覧 | 必要 |
| `/chat/[matchId]` | チャット画面 | 必要 |
| `/profile/edit` | プロフィール編集 | 必要 |

### 画面遷移

```
未認証
  └─ /login ─── 登録リンク ──→ /register
                               │
                 ログイン成功 ←─┘
                    │
                    ├─ プロフィール未設定 → /profile/setup → /swipe
                    └─ プロフィール設定済み → /swipe

/swipe（メイン）
  ├─ マッチング成立 → マッチモーダル → /matches or /swipe継続
  └─ ナビ: matches・profile/edit

/matches
  └─ チャットルームタップ → /chat/[matchId]
```

### スワイプUIの実装方針

- `react-spring` + `@use-gesture/react` でドラッグ＆スワイプアニメーションを実装
- カードを重ねたスタック表示（最前面1枚が操作対象）
- 右スワイプ時：右方向にカードが飛ぶ + ハートエフェクト
- 左スワイプ時：左方向にカードが飛ぶ + バツエフェクト
- スワイプ距離のしきい値を超えたら確定

---

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # サーバーサイドのみ
```

---

## GitHub ブランチ戦略

```
main          ← Vercel 本番デプロイ（PR マージのみ）
  └── develop ← 開発統合ブランチ
        ├── feature/auth          ← 認証機能
        ├── feature/profile       ← プロフィール機能
        ├── feature/swipe         ← スワイプ機能
        ├── feature/matching      ← マッチング機能
        ├── feature/chat          ← チャット機能
        └── feature/block-report  ← ブロック・通報機能
```

- `feature/*` → `develop` へ PR でマージ
- `develop` → `main` へ PR でマージ（本番リリース）
- Vercel はプレビューデプロイも自動生成（PR ごと）
