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

/* ─── Mafia Game Types ─── */

export type MafiaGameStatus = 'lobby' | 'night' | 'day' | 'voting' | 'finished';
export type MafiaRole = 'mafia' | 'detective' | 'doctor' | 'villager';
export type MafiaWinner = 'mafia' | 'town' | null;
export type MafiaActionType = 'kill' | 'save' | 'investigate';

export interface MafiaGame {
  id: string;
  status: MafiaGameStatus;
  round: number;
  phase_started_at: string | null;
  winner: MafiaWinner;
  night_result: MafiaNightResult | null;
  created_at: string;
}

export interface MafiaPlayer {
  id: string;
  game_id: string;
  guest_name: string;
  role: MafiaRole | null;
  is_alive: boolean;
  is_host: boolean;
  joined_at: string;
}

export interface MafiaNightAction {
  id: string;
  game_id: string;
  round: number;
  actor_id: string;
  action_type: MafiaActionType;
  target_id: string;
  created_at: string;
}

export interface MafiaVote {
  id: string;
  game_id: string;
  round: number;
  voter_id: string;
  target_id: string;
  created_at: string;
}

export interface MafiaNightResult {
  killed_player_id: string | null;
  killed_player_name: string | null;
  saved: boolean;
}

export interface MafiaGameState {
  game: MafiaGame | null;
  players: MafiaPlayer[];
  myPlayer: MafiaPlayer | null;
  myRole: MafiaRole | null;
  votes: Record<string, number>;
  investigationResult: boolean | null;
  nightResult: MafiaNightResult | null;
}
