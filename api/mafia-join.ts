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

export default async function handler(req: any, res: any) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });

  try {
    const { guest_name } = req.body;
    if (!guest_name || !guest_name.trim()) {
      return res.status(400).json({ error: 'guest_name is required' });
    }

    const trimmedName = guest_name.trim();

    // Find or create active game (not finished)
    let { data: game } = await supabase
      .from('mafia_game')
      .select('*')
      .neq('status', 'finished')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!game) {
      // Create new game
      const { data: newGame, error: createErr } = await supabase
        .from('mafia_game')
        .insert({ status: 'lobby', round: 0 })
        .select()
        .single();

      if (createErr) return res.status(500).json({ error: createErr.message });
      game = newGame;
    }

    // Check if game is still in lobby
    if (game.status !== 'lobby') {
      return res.status(400).json({ error: 'Game already in progress. Wait for it to finish.' });
    }

    // Check if this guest is already in the game
    const { data: existingPlayer } = await supabase
      .from('mafia_players')
      .select('*')
      .eq('game_id', game.id)
      .eq('guest_name', trimmedName)
      .single();

    if (existingPlayer) {
      // Return existing player info (re-joining)
      return res.status(200).json({
        player_id: existingPlayer.id,
        player_token: existingPlayer.player_token,
        game_id: game.id,
        is_host: existingPlayer.is_host,
      });
    }

    // Check if this is the first player (becomes host)
    const { count } = await supabase
      .from('mafia_players')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', game.id);

    const isHost = (count ?? 0) === 0;

    // Insert new player
    const { data: player, error: insertErr } = await supabase
      .from('mafia_players')
      .insert({
        game_id: game.id,
        guest_name: trimmedName,
        is_host: isHost,
      })
      .select()
      .single();

    if (insertErr) return res.status(500).json({ error: insertErr.message });

    return res.status(200).json({
      player_id: player.id,
      player_token: player.player_token,
      game_id: game.id,
      is_host: player.is_host,
    });
  } catch (err: any) {
    console.error('mafia-join error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
