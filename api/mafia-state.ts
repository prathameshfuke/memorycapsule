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

    // Find active game
    const { data: game } = await supabase
      .from('mafia_game')
      .select('*')
      .neq('status', 'finished')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Build response
    const response: any = {
      game: game || null,
      players: [],
      myPlayer: null,
      myRole: null,
      votes: {},
      investigationResult: null,
      nightResult: game?.night_result || null,
    };

    if (!game) {
      return res.status(200).json(response);
    }

    // Get all players (strip role and player_token for non-owners)
    const { data: players } = await supabase
      .from('mafia_players')
      .select('id, game_id, guest_name, is_alive, is_host, joined_at, role, player_token')
      .eq('game_id', game.id)
      .order('joined_at');

    if (!players) {
      return res.status(200).json(response);
    }

    // Find the requesting player
    let myPlayer = null;
    let myRole = null;

    if (player_token) {
      myPlayer = players.find((p: any) => p.player_token === player_token) || null;
      if (myPlayer) {
        myRole = myPlayer.role;
      }
    }

    // Strip sensitive data from player list
    const isGameOver = game.status === 'finished';
    const safePlayers = players.map((p: any) => ({
      id: p.id,
      game_id: p.game_id,
      guest_name: p.guest_name,
      is_alive: p.is_alive,
      is_host: p.is_host,
      joined_at: p.joined_at,
      // Only reveal role if: it's the requesting player's own role, OR game is finished
      role: isGameOver ? p.role : (myPlayer && p.id === myPlayer.id ? p.role : null),
    }));

    response.players = safePlayers;
    response.myPlayer = myPlayer ? {
      id: myPlayer.id,
      game_id: myPlayer.game_id,
      guest_name: myPlayer.guest_name,
      is_alive: myPlayer.is_alive,
      is_host: myPlayer.is_host,
      joined_at: myPlayer.joined_at,
      role: myPlayer.role,
    } : null;
    response.myRole = myRole;

    // Get vote tally for current round
    if (game.status === 'day' || game.status === 'voting') {
      const { data: votes } = await supabase
        .from('mafia_votes')
        .select('target_id')
        .eq('game_id', game.id)
        .eq('round', game.round);

      const voteTally: Record<string, number> = {};
      (votes || []).forEach((v: any) => {
        voteTally[v.target_id] = (voteTally[v.target_id] || 0) + 1;
      });
      response.votes = voteTally;

      // Check if this player already voted
      if (myPlayer) {
        const { data: myVote } = await supabase
          .from('mafia_votes')
          .select('id')
          .eq('game_id', game.id)
          .eq('round', game.round)
          .eq('voter_id', myPlayer.id)
          .single();
        response.hasVoted = !!myVote;
      }
    }

    // Check if night action already submitted
    if (game.status === 'night' && myPlayer) {
      const { data: myAction } = await supabase
        .from('mafia_night_actions')
        .select('id')
        .eq('game_id', game.id)
        .eq('round', game.round)
        .eq('actor_id', myPlayer.id)
        .single();
      response.hasActed = !!myAction;
    }

    // Get detective investigation result from last round
    if (myRole === 'detective' && myPlayer && game.round > 1) {
      const { data: investigation } = await supabase
        .from('mafia_night_actions')
        .select('target_id')
        .eq('game_id', game.id)
        .eq('round', game.round - 1)
        .eq('actor_id', myPlayer.id)
        .eq('action_type', 'investigate')
        .single();

      if (investigation) {
        const { data: target } = await supabase
          .from('mafia_players')
          .select('role')
          .eq('id', investigation.target_id)
          .single();
        response.investigationResult = target?.role === 'mafia';
      }
    }

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('mafia-state error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
