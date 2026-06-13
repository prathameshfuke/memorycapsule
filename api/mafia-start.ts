import { createClient } from '@supabase/supabase-js';

const normalizeEnvValue = (value?: string) => value?.trim().replace(/^"(.*)"$/, '$1');
type EnvMap = Record<string, string | undefined>;
const env = ((globalThis as { process?: { env?: EnvMap } }).process?.env ?? {}) as EnvMap;
const supabaseUrl = normalizeEnvValue(env.SUPABASE_URL || env.VITE_SUPABASE_URL);
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function corsHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

type MafiaRole = 'mafia' | 'detective' | 'doctor' | 'villager';

/**
 * Assigns roles based on player count.
 * 4-5 players: 1 Mafia, 1 Detective, 1 Doctor, rest Villagers
 * 6-7 players: 1 Mafia, 1 Detective, 1 Doctor, rest Villagers
 * 8-9 players: 2 Mafia, 1 Detective, 1 Doctor, rest Villagers
 * 10+ players: 3 Mafia, 1 Detective, 1 Doctor, rest Villagers
 */
function assignRoles(playerCount: number): MafiaRole[] {
  let mafiaCount = 1;
  if (playerCount >= 10) mafiaCount = 3;
  else if (playerCount >= 8) mafiaCount = 2;

  const roles: MafiaRole[] = [];

  // Mafia
  for (let i = 0; i < mafiaCount; i++) roles.push('mafia');

  // Special roles
  roles.push('detective');
  roles.push('doctor');

  // Fill rest with villagers
  while (roles.length < playerCount) roles.push('villager');

  // Shuffle (Fisher-Yates)
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  return roles;
}

export default async function handler(req: any, res: any) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });

  try {
    const { player_token } = req.body;
    if (!player_token) return res.status(400).json({ error: 'player_token required' });

    // Verify caller is host
    const { data: caller } = await supabase
      .from('mafia_players')
      .select('*, mafia_game!inner(*)')
      .eq('player_token', player_token)
      .single();

    if (!caller) return res.status(404).json({ error: 'Player not found' });
    if (!caller.is_host) return res.status(403).json({ error: 'Only the host can start the game' });

    const game = (caller as any).mafia_game;
    if (game.status !== 'lobby') {
      return res.status(400).json({ error: 'Game is not in lobby' });
    }

    // Get all players
    const { data: players, error: playersErr } = await supabase
      .from('mafia_players')
      .select('*')
      .eq('game_id', game.id)
      .order('joined_at');

    if (playersErr || !players) {
      return res.status(500).json({ error: 'Failed to fetch players' });
    }

    // Minimum player check (4 normally, 2 in debug mode)
    const minPlayers = req.body.debug ? 2 : 4;
    if (players.length < minPlayers) {
      return res.status(400).json({ error: `Need at least ${minPlayers} players to start` });
    }

    // Assign roles
    const roles = assignRoles(players.length);

    // Update each player with their role
    for (let i = 0; i < players.length; i++) {
      const { error: updateErr } = await supabase
        .from('mafia_players')
        .update({ role: roles[i] })
        .eq('id', players[i].id);

      if (updateErr) {
        return res.status(500).json({ error: `Failed to assign role: ${updateErr.message}` });
      }
    }

    // Transition game to night phase
    const { error: gameErr } = await supabase
      .from('mafia_game')
      .update({
        status: 'night',
        round: 1,
        phase_started_at: new Date().toISOString(),
        night_result: null,
      })
      .eq('id', game.id);

    if (gameErr) {
      return res.status(500).json({ error: gameErr.message });
    }

    return res.status(200).json({ success: true, playerCount: players.length });
  } catch (err: any) {
    console.error('mafia-start error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
