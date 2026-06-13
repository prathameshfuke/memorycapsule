import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MafiaGame, MafiaPlayer, MafiaRole, MafiaNightResult } from '../types/database';

const MAFIA_PLAYER_TOKEN_KEY = 'mafia_player_token';
const MAFIA_PLAYER_ID_KEY = 'mafia_player_id';
const MAFIA_GAME_ID_KEY = 'mafia_game_id';
const PHASE_DURATION = 60; // seconds

export interface MafiaState {
  game: MafiaGame | null;
  players: MafiaPlayer[];
  myPlayer: MafiaPlayer | null;
  myRole: MafiaRole | null;
  votes: Record<string, number>;
  hasVoted: boolean;
  hasActed: boolean;
  investigationResult: boolean | null;
  nightResult: MafiaNightResult | null;
  isLoading: boolean;
  error: string | null;
  timeRemaining: number;
}

export function useMafiaGame() {
  const [state, setState] = useState<MafiaState>({
    game: null,
    players: [],
    myPlayer: null,
    myRole: null,
    votes: {},
    hasVoted: false,
    hasActed: false,
    investigationResult: null,
    nightResult: null,
    isLoading: true,
    error: null,
    timeRemaining: PHASE_DURATION,
  });

  const [roleRevealed, setRoleRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerFiredRef = useRef(false);
  const channelRef = useRef<any>(null);

  const getPlayerToken = () => localStorage.getItem(MAFIA_PLAYER_TOKEN_KEY);
  const getPlayerId = () => localStorage.getItem(MAFIA_PLAYER_ID_KEY);

  // Fetch game state from API
  const fetchState = useCallback(async () => {
    try {
      const playerToken = getPlayerToken();
      const response = await fetch('/api/mafia-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_token: playerToken }),
      });

      if (!response.ok) {
        // No game exists yet — that's fine
        if (response.status === 404) {
          setState(prev => ({ ...prev, game: null, players: [], isLoading: false }));
          return;
        }
        throw new Error('Failed to fetch game state');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        game: data.game,
        players: data.players || [],
        myPlayer: data.myPlayer,
        myRole: data.myRole,
        votes: data.votes || {},
        hasVoted: data.hasVoted || false,
        hasActed: data.hasActed || false,
        investigationResult: data.investigationResult ?? null,
        nightResult: data.nightResult ?? data.game?.night_result ?? null,
        isLoading: false,
        error: null,
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  }, []);

  // Timer management
  useEffect(() => {
    if (!state.game?.phase_started_at) return;
    if (state.game.status === 'lobby' || state.game.status === 'finished') return;

    timerFiredRef.current = false;

    const phaseStart = new Date(state.game.phase_started_at).getTime();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - phaseStart) / 1000);
      const remaining = Math.max(0, PHASE_DURATION - elapsed);
      setState(prev => ({ ...prev, timeRemaining: remaining }));

      if (remaining <= 0 && !timerFiredRef.current) {
        timerFiredRef.current = true;
        handleTimerExpired();
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.game?.phase_started_at, state.game?.status]);

  const handleTimerExpired = async () => {
    const playerToken = getPlayerToken();
    if (!playerToken) return;
    // Only the host triggers auto-resolve to prevent race conditions
    if (!state.myPlayer?.is_host) return;

    try {
      await fetch('/api/mafia-timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_token: playerToken }),
      });
      // State will update via realtime subscription
    } catch (err) {
      console.error('Timer resolve error:', err);
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    channelRef.current = supabase
      .channel('mafia-game-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mafia_game' },
        () => fetchState()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mafia_players' },
        () => fetchState()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mafia_votes' },
        () => fetchState()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mafia_night_actions' },
        () => fetchState()
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchState]);

  // Initial fetch
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Join game
  const joinGame = async (guestName: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch('/api/mafia-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_name: guestName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem(MAFIA_PLAYER_TOKEN_KEY, data.player_token);
      localStorage.setItem(MAFIA_PLAYER_ID_KEY, data.player_id);
      localStorage.setItem(MAFIA_GAME_ID_KEY, data.game_id);

      await fetchState();
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  };

  // Start game (host only)
  const startGame = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const playerToken = getPlayerToken();
      const response = await fetch('/api/mafia-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_token: playerToken }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setRoleRevealed(false);
      await fetchState();
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  };

  // Submit night action
  const submitNightAction = async (targetId: string) => {
    try {
      const playerToken = getPlayerToken();
      const response = await fetch('/api/mafia-night-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_token: playerToken, target_id: targetId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Store investigation result if detective
      if (data.investigationResult !== undefined && data.investigationResult !== null) {
        setState(prev => ({ ...prev, investigationResult: data.investigationResult, hasActed: true }));
      } else {
        setState(prev => ({ ...prev, hasActed: true }));
      }

      await fetchState();
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  };

  // Cast vote
  const castVote = async (targetId: string) => {
    try {
      const playerToken = getPlayerToken();
      const response = await fetch('/api/mafia-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_token: playerToken, target_id: targetId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setState(prev => ({
        ...prev,
        hasVoted: true,
        votes: data.voteTally || prev.votes,
      }));

      await fetchState();
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  };

  // Reset game (host only)
  const resetGame = async () => {
    try {
      const playerToken = getPlayerToken();
      const response = await fetch('/api/mafia-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_token: playerToken }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Clear local storage
      localStorage.removeItem(MAFIA_PLAYER_TOKEN_KEY);
      localStorage.removeItem(MAFIA_PLAYER_ID_KEY);
      localStorage.removeItem(MAFIA_GAME_ID_KEY);

      setRoleRevealed(false);
      setState({
        game: null,
        players: [],
        myPlayer: null,
        myRole: null,
        votes: {},
        hasVoted: false,
        hasActed: false,
        investigationResult: null,
        nightResult: null,
        isLoading: false,
        error: null,
        timeRemaining: PHASE_DURATION,
      });
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    }
  };

  // Leave game (for non-hosts)
  const leaveGame = () => {
    localStorage.removeItem(MAFIA_PLAYER_TOKEN_KEY);
    localStorage.removeItem(MAFIA_PLAYER_ID_KEY);
    localStorage.removeItem(MAFIA_GAME_ID_KEY);
    setRoleRevealed(false);
    setState(prev => ({ ...prev, myPlayer: null, myRole: null }));
  };

  return {
    ...state,
    roleRevealed,
    setRoleRevealed,
    joinGame,
    startGame,
    submitNightAction,
    castVote,
    resetGame,
    leaveGame,
    fetchState,
    isJoined: !!state.myPlayer,
    isHost: state.myPlayer?.is_host ?? false,
    isAlive: state.myPlayer?.is_alive ?? false,
    playerCount: state.players.length,
  };
}
