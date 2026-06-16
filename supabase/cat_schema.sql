-- ============================================
-- Cat Copy Challenge Real-Time Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Table to manage Cat Copy game rooms/sessions
create table if not exists cat_game (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'lobby',  -- lobby | roulette | reveal | hold | voting | result | scoreboard
  round int not null default 0,
  current_player text,                   -- Name of the active player to draw
  current_cat text,                      -- Path/URL to the selected cat image
  round_type text,                       -- RoundType: 'normal' | 'double_trouble' | 'kashish_choice' | 'nightmare' | 'sudden_death'
  used_cats int[] default '{}',          -- List of cat numbers already used
  used_players text[] default '{}',      -- List of player names who have already drawn
  created_at timestamptz default now()
);

-- Table to track players joined in the current game session
create table if not exists cat_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references cat_game(id) on delete cascade,
  player_name text not null,
  is_host boolean default false,
  joined_at timestamptz default now(),
  unique(game_id, player_name)
);

-- Table to store votes cast during the rating phase of a round
create table if not exists cat_votes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references cat_game(id) on delete cascade,
  round int not null,
  voter_name text not null,
  target_name text not null,             -- Name of the player who drew
  score int not null,                    -- Star rating (1-5)
  created_at timestamptz default now(),
  unique(game_id, round, voter_name)
);

-- Enable realtime for the tables so updates sync instantly
alter publication supabase_realtime add table cat_game;
alter publication supabase_realtime add table cat_players;
alter publication supabase_realtime add table cat_votes;

-- Alter table to support player presence, activity tracking, and recovery
alter table cat_players add column if not exists last_seen timestamptz default now();
alter table cat_players add column if not exists is_connected boolean default true;
alter table cat_players add column if not exists updated_at timestamptz default now();

