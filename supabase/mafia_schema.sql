-- ============================================
-- Mafia Game Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Single shared game state
create table if not exists mafia_game (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'lobby',  -- lobby | night | day | voting | finished
  round int not null default 0,
  phase_started_at timestamptz,
  winner text,  -- 'mafia' | 'town' | null
  night_result jsonb,  -- { killed_player_id, killed_player_name, saved }
  created_at timestamptz default now()
);

-- Players in current game
create table if not exists mafia_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references mafia_game(id) on delete cascade,
  guest_name text not null,
  player_token uuid not null default gen_random_uuid(),  -- secret auth token
  role text,  -- 'mafia' | 'detective' | 'doctor' | 'villager' | null until assigned
  is_alive boolean default true,
  is_host boolean default false,
  joined_at timestamptz default now()
);

-- Night actions (mafia kill, doctor save, detective check)
create table if not exists mafia_night_actions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references mafia_game(id) on delete cascade,
  round int not null,
  actor_id uuid references mafia_players(id) on delete cascade,
  action_type text not null,  -- 'kill' | 'save' | 'investigate'
  target_id uuid references mafia_players(id) on delete cascade,
  created_at timestamptz default now()
);

-- Day votes
create table if not exists mafia_votes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references mafia_game(id) on delete cascade,
  round int not null,
  voter_id uuid references mafia_players(id) on delete cascade,
  target_id uuid references mafia_players(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable realtime for all mafia tables
alter publication supabase_realtime add table mafia_game;
alter publication supabase_realtime add table mafia_players;
alter publication supabase_realtime add table mafia_votes;
alter publication supabase_realtime add table mafia_night_actions;

-- Indexes for performance
create index if not exists idx_mafia_players_game on mafia_players(game_id);
create index if not exists idx_mafia_players_token on mafia_players(player_token);
create index if not exists idx_mafia_night_actions_game_round on mafia_night_actions(game_id, round);
create index if not exists idx_mafia_votes_game_round on mafia_votes(game_id, round);
