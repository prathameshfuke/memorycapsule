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
    const { player_token } = req.body;
    if (!player_token) return res.status(400).json({ error: 'player_token required' });

    // Verify caller is host
    const { data: caller } = await supabase
      .from('mafia_players')
      .select('*')
      .eq('player_token', player_token)
      .single();

    if (!caller) return res.status(404).json({ error: 'Player not found' });
    if (!caller.is_host) return res.status(403).json({ error: 'Only the host can reset' });

    const gameId = caller.game_id;

    // Delete all game data in order (foreign key constraints)
    await supabase.from('mafia_votes').delete().eq('game_id', gameId);
    await supabase.from('mafia_night_actions').delete().eq('game_id', gameId);
    await supabase.from('mafia_players').delete().eq('game_id', gameId);
    await supabase.from('mafia_game').delete().eq('id', gameId);

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('mafia-reset error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
