-- ============================================
-- Guest Games Schema (Guess Who & Most Likely To)
-- Run this in Supabase SQL Editor
-- ============================================

-- Table to store votes for Guess Who and Most Likely To
create table if not exists game_votes (
  id uuid primary key default gen_random_uuid(),
  game_type text not null,       -- 'guess_who' | 'most_likely'
  question_id text not null,     -- ID of the question prompt
  voter_name text not null,      -- Name of the guest who voted
  target_name text not null,     -- Name of the guest voted for
  created_at timestamptz default now(),
  -- Ensure a user can only vote once per question per game type
  unique(game_type, question_id, voter_name)
);

-- Enable realtime for this table so updates reflect instantly
alter publication supabase_realtime add table game_votes;

-- Index for performance
create index if not exists idx_game_votes_lookup on game_votes(game_type, question_id);
