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
    const { player_token, target_id } = req.body;
    if (!player_token || !target_id) {
      return res.status(400).json({ error: 'player_token and target_id required' });
    }

    // Get voter
    const { data: voter } = await supabase
      .from('mafia_players')
      .select('*')
      .eq('player_token', player_token)
      .single();

    if (!voter) return res.status(404).json({ error: 'Player not found' });
    if (!voter.is_alive) return res.status(400).json({ error: 'Dead players cannot vote' });

    // Get game
    const { data: game } = await supabase
      .from('mafia_game')
      .select('*')
      .eq('id', voter.game_id)
      .single();

    if (!game || (game.status !== 'day' && game.status !== 'voting')) {
      return res.status(400).json({ error: 'Not in voting phase' });
    }

    // If game was in 'day', transition to 'voting' on first vote
    if (game.status === 'day') {
      await supabase
        .from('mafia_game')
        .update({ status: 'voting', phase_started_at: new Date().toISOString() })
        .eq('id', game.id);
    }

    // Check if already voted this round
    const { data: existingVote } = await supabase
      .from('mafia_votes')
      .select('*')
      .eq('game_id', game.id)
      .eq('round', game.round)
      .eq('voter_id', voter.id)
      .single();

    if (existingVote) {
      return res.status(400).json({ error: 'Already voted this round' });
    }

    // Record vote
    const { error: insertErr } = await supabase
      .from('mafia_votes')
      .insert({
        game_id: game.id,
        round: game.round,
        voter_id: voter.id,
        target_id,
      });

    if (insertErr) return res.status(500).json({ error: insertErr.message });

    // Get all alive players and all votes for this round
    const { data: alivePlayers } = await supabase
      .from('mafia_players')
      .select('*')
      .eq('game_id', game.id)
      .eq('is_alive', true);

    const { data: roundVotes } = await supabase
      .from('mafia_votes')
      .select('*')
      .eq('game_id', game.id)
      .eq('round', game.round);

    const aliveCount = (alivePlayers || []).length;
    const voteCount = (roundVotes || []).length;

    // Build vote tally for response
    const voteTally: Record<string, number> = {};
    (roundVotes || []).forEach((v: any) => {
      voteTally[v.target_id] = (voteTally[v.target_id] || 0) + 1;
    });

    // Check if all alive players have voted
    if (voteCount >= aliveCount) {
      // Tally and eliminate
      const maxVotes = Math.max(...Object.values(voteTally));
      const topTargets = Object.keys(voteTally).filter(id => voteTally[id] === maxVotes);
      const eliminatedId = topTargets[Math.floor(Math.random() * topTargets.length)];

      // Eliminate player
      await supabase
        .from('mafia_players')
        .update({ is_alive: false })
        .eq('id', eliminatedId);

      // Re-fetch players for win check
      const { data: updatedPlayers } = await supabase
        .from('mafia_players')
        .select('*')
        .eq('game_id', game.id);

      const eliminatedPlayer = (updatedPlayers || []).find((p: any) => p.id === eliminatedId);
      const winner = checkWinCondition(updatedPlayers || []);

      if (winner) {
        // Game over
        await supabase
          .from('mafia_game')
          .update({
            status: 'finished',
            winner,
            night_result: {
              killed_player_id: eliminatedId,
              killed_player_name: eliminatedPlayer?.guest_name || null,
              saved: false,
            },
          })
          .eq('id', game.id);
      } else {
        // Next round — night phase
        await supabase
          .from('mafia_game')
          .update({
            status: 'night',
            round: game.round + 1,
            phase_started_at: new Date().toISOString(),
            night_result: null,
          })
          .eq('id', game.id);
      }

      return res.status(200).json({
        success: true,
        voteTally,
        allVoted: true,
        eliminatedId,
        eliminatedName: eliminatedPlayer?.guest_name,
        eliminatedRole: eliminatedPlayer?.role,
        winner,
      });
    }

    return res.status(200).json({
      success: true,
      voteTally,
      allVoted: false,
      votesIn: voteCount,
      votesNeeded: aliveCount,
    });
  } catch (err: any) {
    console.error('mafia-vote error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
