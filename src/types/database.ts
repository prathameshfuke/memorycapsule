// All tables use guest_name (string) — no user IDs, no auth, no guests table.

export interface Photo {
  id: string;
  guest_name: string;
  photo_url: string;
  drive_file_id: string | null;
  filter_used: string | null;
  type: 'photo' | 'video';
  created_at: string;
}

export interface Message {
  id: string;
  guest_name: string;
  message: string;
  created_at: string;
}

export interface OneWord {
  id: string;
  guest_name: string;
  word: string;
  created_at: string;
}

export interface QuizScore {
  id: string;
  guest_name: string;
  score: number;
  total: number;
  created_at: string;
}

export interface GuestbookEntry {
  id: string;
  guest_name: string;
  message: string;
  created_at: string;
}

export interface LiveStatsData {
  photosUploaded: number;
  messagesWritten: number;
  guestsParticipating: number;
  wordsSubmitted: number;
}
