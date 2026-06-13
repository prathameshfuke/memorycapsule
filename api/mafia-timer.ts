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

function checkWinCondition(players: any[]): 'mafia' | 'town' | null {
  const alive = players.filter((p: any) => p.is_alive);
  const mafiaAlive = alive.filter((p: any) => p.role === 'mafia').length;
  const townAlive = alive.filter((p: any) => p.role !== 'mafia').length;

  if (mafiaAlive === 0) return 'town';
  if (mafiaAlive >= townAlive) return 'mafia';
  return null;
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

    // Get caller
    const { data: caller } = await supabase
      .from('mafia_players')
      .select('*')
      .eq('player_token', player_token)
      .single();

    if (!caller) return res.status(404).json({ error: 'Player not found' });

    // Get game
    const { data: game } = await supabase
      .from('mafia_game')
      .select('*')
      .eq('id', caller.game_id)
      .single();

    if (!game) return res.status(404).json({ error: 'Game not found' });

    // Only auto-resolve if current phase matches
    if (game.status === 'night') {
      // Auto-resolve night: Mafia kills random alive non-mafia player if no kill submitted
      const { data: allPlayers } = await supabase
        .from('mafia_players')
        .select('*')
        .eq('game_id', game.id)
        .eq('is_alive', true);

      const mafiaPlayers = (allPlayers || []).filter((p: any) => p.role === 'mafia');
      const nonMafiaPlayers = (allPlayers || []).filter((p: any) => p.role !== 'mafia');

      // Check if any mafia has acted
      const { data: existingKills } = await supabase
        .from('mafia_night_actions')
        .select('*')
        .eq('game_id', game.id)
        .eq('round', game.round)
        .eq('action_type', 'kill');

      // If no mafia kill submitted, auto-target random non-mafia
      if ((!existingKills || existingKills.length === 0) && mafiaPlayers.length > 0 && nonMafiaPlayers.length > 0) {
        const randomTarget = nonMafiaPlayers[Math.floor(Math.random() * nonMafiaPlayers.length)];
        await supabase
          .from('mafia_night_actions')
          .insert({
            game_id: game.id,
            round: game.round,
            actor_id: mafiaPlayers[0].id,
            action_type: 'kill',
            target_id: randomTarget.id,
          });
      }

      // Now resolve with whatever actions exist
      const { data: actions } = await supabase
        .from('mafia_night_actions')
        .select('*')
        .eq('game_id', game.id)
        .eq('round', game.round);

      const killActions = (actions || []).filter((a: any) => a.action_type === 'kill');
      const saveActions = (actions || []).filter((a: any) => a.action_type === 'save');

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

      const doctorSaveTargetIds = saveActions.map((a: any) => a.target_id);
      const wasSaved = killTargetId && doctorSaveTargetIds.includes(killTargetId);

      let killedPlayer = null;
      if (killTargetId && !wasSaved) {
        await supabase.from('mafia_players').update({ is_alive: false }).eq('id', killTargetId);
        killedPlayer = (allPlayers || []).find((p: any) => p.id === killTargetId);
      }

      const nightResult = {
        killed_player_id: wasSaved ? null : (killTargetId || null),
        killed_player_name: wasSaved ? null : (killedPlayer?.guest_name || null),
        saved: !!wasSaved,
      };

      const { data: updatedPlayers } = await supabase
        .from('mafia_players').select('*').eq('game_id', game.id);

      const winner = checkWinCondition(updatedPlayers || []);

      await supabase
        .from('mafia_game')
        .update({
          status: winner ? 'finished' : 'day',
          phase_started_at: new Date().toISOString(),
          night_result: nightResult,
          winner,
        })
        .eq('id', game.id);

      return res.status(200).json({ success: true, resolved: 'night' });
    }

    if (game.status === 'voting') {
      // Auto-resolve voting with whatever votes exist
      const { data: roundVotes } = await supabase
        .from('mafia_votes')
        .select('*')
        .eq('game_id', game.id)
        .eq('round', game.round);

      if (roundVotes && roundVotes.length > 0) {
        const voteTally: Record<string, number> = {};
        roundVotes.forEach((v: any) => {
          voteTally[v.target_id] = (voteTally[v.target_id] || 0) + 1;
        });

        const maxVotes = Math.max(...Object.values(voteTally));
        const topTargets = Object.keys(voteTally).filter(id => voteTally[id] === maxVotes);
        const eliminatedId = topTargets[Math.floor(Math.random() * topTargets.length)];

        await supabase.from('mafia_players').update({ is_alive: false }).eq('id', eliminatedId);

        const { data: updatedPlayers } = await supabase
          .from('mafia_players').select('*').eq('game_id', game.id);

        const winner = checkWinCondition(updatedPlayers || []);

        await supabase
          .from('mafia_game')
          .update({
            status: winner ? 'finished' : 'night',
            round: winner ? game.round : game.round + 1,
            phase_started_at: new Date().toISOString(),
            winner,
          })
          .eq('id', game.id);

        return res.status(200).json({ success: true, resolved: 'voting' });
      } else {
        // No votes at all — skip voting, go to next night
        await supabase
          .from('mafia_game')
          .update({
            status: 'night',
            round: game.round + 1,
            phase_started_at: new Date().toISOString(),
          })
          .eq('id', game.id);

        return res.status(200).json({ success: true, resolved: 'voting_skipped' });
      }
    }

    return res.status(400).json({ error: 'Cannot auto-resolve in current phase' });
  } catch (err: any) {
    console.error('mafia-timer error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
