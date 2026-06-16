-- ============================================================
-- COMPLETE SUPABASE SCHEMA FOR KASHISH BIRTHDAY APP
-- Run this ENTIRE file in Supabase SQL Editor (one time)
-- ============================================================


-- ╔══════════════════════════════════════════════╗
-- ║  SECTION 1: CORE APP TABLES                  ║
-- ║  (Messages, One Word, Photos, Guestbook)     ║
-- ╚══════════════════════════════════════════════╝

-- 1a. Messages (letters for her)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  message text not null,
  created_at timestamptz default now()
);

-- 1b. Future Letters (letters for next year's birthday)
create table if not exists future_letters (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  message text not null,
  created_at timestamptz default now()
);

-- 1c. One Word (describe her in one word)
create table if not exists one_word (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  word text not null,
  created_at timestamptz default now()
);

-- 1d. Photos & Videos (uploaded media)
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  photo_url text not null,
  drive_file_id text,
  filter_used text,
  type text not null default 'photo',  -- 'photo' | 'video'
  created_at timestamptz default now()
);

-- 1e. Guestbook (public signatures)
create table if not exists guestbook (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  message text not null,
  created_at timestamptz default now()
);


-- ╔══════════════════════════════════════════════╗
-- ║  SECTION 2: GUEST GAMES                      ║
-- ║  (Guess Who & Most Likely To)                 ║
-- ╚══════════════════════════════════════════════╝

create table if not exists game_votes (
  id uuid primary key default gen_random_uuid(),
  game_type text not null,       -- 'guess_who' | 'most_likely'
  question_id text not null,     -- ID of the question prompt
  voter_name text not null,      -- Name of the guest who voted
  target_name text not null,     -- Name of the guest voted for
  created_at timestamptz default now(),
  unique(game_type, question_id, voter_name)
);

create index if not exists idx_game_votes_lookup on game_votes(game_type, question_id);


-- ╔══════════════════════════════════════════════╗
-- ║  SECTION 3: CAT COPY CHALLENGE               ║
-- ║  (Real-time multiplayer cat drawing game)     ║
-- ╚══════════════════════════════════════════════╝

-- 3a. Game sessions
create table if not exists cat_game (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'lobby',  -- lobby | roulette | reveal | hold | voting | result | scoreboard
  round int not null default 0,
  current_player text,
  current_cat text,
  round_type text,               -- 'normal' | 'double_trouble' | 'kashish_choice' | 'nightmare' | 'sudden_death'
  used_cats int[] default '{}',
  used_players text[] default '{}',
  created_at timestamptz default now()
);

-- 3b. Players in a cat game session
create table if not exists cat_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references cat_game(id) on delete cascade,
  player_name text not null,
  is_host boolean default false,
  joined_at timestamptz default now(),
  unique(game_id, player_name)
);

-- 3c. Votes for cat copy rounds
create table if not exists cat_votes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references cat_game(id) on delete cascade,
  round int not null,
  voter_name text not null,
  target_name text not null,
  score int not null,            -- Star rating (1-5)
  created_at timestamptz default now(),
  unique(game_id, round, voter_name)
);


-- ╔══════════════════════════════════════════════╗
-- ║  SECTION 4: MAFIA GAME                       ║
-- ║  (Multiplayer social deduction)               ║
-- ╚══════════════════════════════════════════════╝

-- 4a. Game state
create table if not exists mafia_game (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'lobby',  -- lobby | night | day | voting | finished
  round int not null default 0,
  phase_started_at timestamptz,
  winner text,                   -- 'mafia' | 'town' | null
  night_result jsonb,            -- { killed_player_id, killed_player_name, saved }
  created_at timestamptz default now()
);

-- 4b. Players
create table if not exists mafia_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references mafia_game(id) on delete cascade,
  guest_name text not null,
  player_token uuid not null default gen_random_uuid(),
  role text,                     -- 'mafia' | 'detective' | 'doctor' | 'villager' | null
  is_alive boolean default true,
  is_host boolean default false,
  joined_at timestamptz default now()
);

-- 4c. Night actions
create table if not exists mafia_night_actions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references mafia_game(id) on delete cascade,
  round int not null,
  actor_id uuid references mafia_players(id) on delete cascade,
  action_type text not null,     -- 'kill' | 'save' | 'investigate'
  target_id uuid references mafia_players(id) on delete cascade,
  created_at timestamptz default now()
);

-- 4d. Day votes
create table if not exists mafia_votes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references mafia_game(id) on delete cascade,
  round int not null,
  voter_id uuid references mafia_players(id) on delete cascade,
  target_id uuid references mafia_players(id) on delete cascade,
  created_at timestamptz default now()
);

-- Mafia indexes
create index if not exists idx_mafia_players_game on mafia_players(game_id);
create index if not exists idx_mafia_players_token on mafia_players(player_token);
create index if not exists idx_mafia_night_actions_game_round on mafia_night_actions(game_id, round);
create index if not exists idx_mafia_votes_game_round on mafia_votes(game_id, round);


-- ╔══════════════════════════════════════════════╗
-- ║  SECTION 5: ENABLE REALTIME                   ║
-- ║  (So updates sync instantly across devices)   ║
-- ╚══════════════════════════════════════════════╝

alter publication supabase_realtime add table game_votes;
alter publication supabase_realtime add table cat_game;
alter publication supabase_realtime add table cat_players;
alter publication supabase_realtime add table cat_votes;
alter publication supabase_realtime add table mafia_game;
alter publication supabase_realtime add table mafia_players;
alter publication supabase_realtime add table mafia_votes;
alter publication supabase_realtime add table mafia_night_actions;


-- ╔══════════════════════════════════════════════╗
-- ║  SECTION 6: ROW LEVEL SECURITY (RLS)          ║
-- ║  Allow all access (no auth used in this app)  ║
-- ╚══════════════════════════════════════════════╝

-- Enable RLS on all tables but allow unrestricted access
-- (This app uses no Supabase Auth — guests identify by name)

alter table messages enable row level security;
create policy "Allow all on messages" on messages for all using (true) with check (true);

alter table future_letters enable row level security;
create policy "Allow all on future_letters" on future_letters for all using (true) with check (true);

alter table one_word enable row level security;
create policy "Allow all on one_word" on one_word for all using (true) with check (true);

alter table photos enable row level security;
create policy "Allow all on photos" on photos for all using (true) with check (true);

alter table guestbook enable row level security;
create policy "Allow all on guestbook" on guestbook for all using (true) with check (true);

alter table game_votes enable row level security;
create policy "Allow all on game_votes" on game_votes for all using (true) with check (true);

alter table cat_game enable row level security;
create policy "Allow all on cat_game" on cat_game for all using (true) with check (true);

alter table cat_players enable row level security;
create policy "Allow all on cat_players" on cat_players for all using (true) with check (true);

alter table cat_votes enable row level security;
create policy "Allow all on cat_votes" on cat_votes for all using (true) with check (true);

alter table mafia_game enable row level security;
create policy "Allow all on mafia_game" on mafia_game for all using (true) with check (true);

alter table mafia_players enable row level security;
create policy "Allow all on mafia_players" on mafia_players for all using (true) with check (true);

alter table mafia_night_actions enable row level security;
create policy "Allow all on mafia_night_actions" on mafia_night_actions for all using (true) with check (true);

alter table mafia_votes enable row level security;
create policy "Allow all on mafia_votes" on mafia_votes for all using (true) with check (true);


-- ╔══════════════════════════════════════════════╗
-- ║  SECTION 7: STORAGE BUCKET (for photo uploads)║
-- ╚══════════════════════════════════════════════╝
-- NOTE: Create a storage bucket named 'photos' manually in 
-- Supabase Dashboard → Storage → New Bucket
-- Set it to PUBLIC (so uploaded images can be viewed by all)
-- OR run this (if your Supabase version supports it):

-- insert into storage.buckets (id, name, public) 
-- values ('photos', 'photos', true)
-- on conflict (id) do nothing;


-- ============================================================
-- DONE! Your app is ready to use.
-- ============================================================
