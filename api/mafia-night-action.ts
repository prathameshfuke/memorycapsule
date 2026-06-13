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

/**
 * Check win conditions after an elimination.
 * Returns 'mafia' | 'town' | null
 */
function checkWinCondition(players: any[]): 'mafia' | 'town' | null {
  const alive = players.filter((p: any) => p.is_alive);
  const mafiaAlive = alive.filter((p: any) => p.role === 'mafia').length;
  const townAlive = alive.filter((p: any) => p.role !== 'mafia').length;

  if (mafiaAlive === 0) return 'town';
  if (mafiaAlive >= townAlive) return 'mafia';
  return null;
}

async function resolveNight(supabase: any, gameId: string, round: number) {
  // Get all night actions for this round
  const { data: actions } = await supabase
    .from('mafia_night_actions')
    .select('*')
    .eq('game_id', gameId)
    .eq('round', round);

  // Get all players
  const { data: players } = await supabase
    .from('mafia_players')
    .select('*')
    .eq('game_id', gameId);

  if (!actions || !players) return;

  // Find the mafia kill target (take first mafia kill action — multiple mafia must agree)
  const killActions = (actions as any[]).filter((a: any) => a.action_type === 'kill');
  const saveActions = (actions as any[]).filter((a: any) => a.action_type === 'save');

  // Determine kill target — most targeted by mafia, random tiebreak
  let killTargetId: string | null = null;
  if (killActions.length > 0) {
    const targetCounts: Record<string, number> = {};
    killActions.forEach((a: any) => {
      targetCounts[a.target_id] = (targetCounts[a.target_id] || 0) + 1;
    });
    const maxVotes = Math.max(...Object.values(targetCounts));
    const topTargets = Object.keys(targetCounts).filter(id => targetCounts[id] === maxVotes);
    killTargetId = topTargets[Math.floor(Math.random() * topTargets.length)];
  }

  // Check if doctor saved the target
  const doctorSaveTargetIds = saveActions.map((a: any) => a.target_id);
  const wasSaved = killTargetId && doctorSaveTargetIds.includes(killTargetId);

  let killedPlayer = null;

  if (killTargetId && !wasSaved) {
    // Kill the player
    await supabase
      .from('mafia_players')
      .update({ is_alive: false })
      .eq('id', killTargetId);

    killedPlayer = (players as any[]).find((p: any) => p.id === killTargetId);
  }

  // Build night result
  const nightResult = {
    killed_player_id: wasSaved ? null : (killTargetId || null),
    killed_player_name: wasSaved ? null : (killedPlayer?.guest_name || null),
    saved: !!wasSaved,
  };

  // Re-fetch players after potential kill
  const { data: updatedPlayers } = await supabase
    .from('mafia_players')
    .select('*')
    .eq('game_id', gameId);

  // Check win condition
  const winner = checkWinCondition(updatedPlayers || []);

  // Transition to day (or finished)
  await supabase
    .from('mafia_game')
    .update({
      status: winner ? 'finished' : 'day',
      phase_started_at: new Date().toISOString(),
      night_result: nightResult,
      winner,
    })
    .eq('id', gameId);
}

export default async function handler(req: any, res: any) {
  corsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });

  try {
    const { player_token, target_id } = req.body;
    if (!player_token || !target_id) {
      return res.status(400).json({ error: 'player_token and target_id required' });
    }

    // Get actor player
    const { data: actor } = await supabase
      .from('mafia_players')
      .select('*')
      .eq('player_token', player_token)
      .single();

    if (!actor) return res.status(404).json({ error: 'Player not found' });
    if (!actor.is_alive) return res.status(400).json({ error: 'Dead players cannot act' });

    // Get game
    const { data: game } = await supabase
      .from('mafia_game')
      .select('*')
      .eq('id', actor.game_id)
      .single();

    if (!game || game.status !== 'night') {
      return res.status(400).json({ error: 'Not night phase' });
    }

    // Determine action type from role
    let actionType: string;
    switch (actor.role) {
      case 'mafia': actionType = 'kill'; break;
      case 'doctor': actionType = 'save'; break;
      case 'detective': actionType = 'investigate'; break;
      default:
        return res.status(400).json({ error: 'Villagers have no night action' });
    }

    // Check if already acted this round
    const { data: existingAction } = await supabase
      .from('mafia_night_actions')
      .select('*')
      .eq('game_id', game.id)
      .eq('round', game.round)
      .eq('actor_id', actor.id)
      .single();

    if (existingAction) {
      return res.status(400).json({ error: 'Already acted this round' });
    }

    // Record the action
    const { error: insertErr } = await supabase
      .from('mafia_night_actions')
      .insert({
        game_id: game.id,
        round: game.round,
        actor_id: actor.id,
        action_type: actionType,
        target_id,
      });

    if (insertErr) return res.status(500).json({ error: insertErr.message });

    // Detective gets immediate investigation result
    let investigationResult: boolean | null = null;
    if (actionType === 'investigate') {
      const { data: target } = await supabase
        .from('mafia_players')
        .select('role')
        .eq('id', target_id)
        .single();

      investigationResult = target?.role === 'mafia';
    }

    // Check if all required actions are submitted
    const { data: allPlayers } = await supabase
      .from('mafia_players')
      .select('*')
      .eq('game_id', game.id)
      .eq('is_alive', true);

    const activeRoles = (allPlayers || []).filter(
      (p: any) => ['mafia', 'detective', 'doctor'].includes(p.role)
    );

    const { data: roundActions } = await supabase
      .from('mafia_night_actions')
      .select('actor_id')
      .eq('game_id', game.id)
      .eq('round', game.round);

    const actedPlayerIds = new Set((roundActions || []).map((a: any) => a.actor_id));
    const allActed = activeRoles.every((p: any) => actedPlayerIds.has(p.id));

    if (allActed) {
      await resolveNight(supabase, game.id, game.round);
    }

    return res.status(200).json({
      success: true,
      investigationResult,
      allActed,
    });
  } catch (err: any) {
    console.error('mafia-night-action error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
