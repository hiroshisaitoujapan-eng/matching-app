export type Gender = "male" | "female";

export type ReportCategory =
  | "harassment"
  | "inappropriate_photo"
  | "spam"
  | "other";

export interface Profile {
  id: string;
  nickname: string;
  gender: Gender;
  birth_date: string;
  bio: string | null;
  location: string | null;
  hobbies: string[];
  photos: string[];
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
}

export interface Skip {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  partner?: Profile;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  category: ReportCategory;
  detail: string | null;
  created_at: string;
}
