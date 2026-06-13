import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../hooks/useGuest';
import { useMafiaGame } from '../hooks/useMafiaGame';
import PageWrapper from '../components/layout/PageWrapper';
import MafiaRules from '../components/games/MafiaRules';
import MafiaLobby from '../components/games/MafiaLobby';
import MafiaRoleReveal from '../components/games/MafiaRoleReveal';
import MafiaNightPhase from '../components/games/MafiaNightPhase';
import MafiaDayPhase from '../components/games/MafiaDayPhase';
import MafiaGameOver from '../components/games/MafiaGameOver';

type MafiaView = 'rules' | 'lobby' | 'role-reveal' | 'night' | 'day' | 'gameover';

export default function MafiaPage() {
  const navigate = useNavigate();
  const { guestName, isRegistered } = useGuest();

  const {
    game,
    players,
    myPlayer,
    myRole,
    votes,
    hasVoted,
    hasActed,
    investigationResult,
    nightResult,
    isLoading,
    error,
    timeRemaining,
    roleRevealed,
    setRoleRevealed,
    joinGame,
    startGame,
    submitNightAction,
    castVote,
    resetGame,
    isJoined,
    isHost,
    isAlive,
    playerCount,
  } = useMafiaGame();

  // Determine initial view based on localStorage + game state
  const [showRules, setShowRules] = useState(() => {
    return !localStorage.getItem('mafia_rules_seen');
  });

  // Derive current view from game state
  const deriveView = (): MafiaView => {
    if (showRules) return 'rules';

    if (!game || game.status === 'lobby') return 'lobby';

    // Show role reveal once when game transitions out of lobby
    if (myRole && !roleRevealed && (game.status === 'night') && game.round === 1) {
      return 'role-reveal';
    }

    switch (game.status) {
      case 'night': return 'night';
      case 'day':
      case 'voting': return 'day';
      case 'finished': return 'gameover';
      default: return 'lobby';
    }
  };

  const currentView = deriveView();

  // Determine page styling
  const isDarkView = ['night', 'role-reveal', 'gameover'].includes(currentView);
  const isRulesView = currentView === 'rules';

  return (
    <PageWrapper
      className={`mafia-page ${isDarkView ? 'bg-[var(--color-ink)]' : isRulesView ? 'bg-[var(--color-parchment)]' : 'bg-[var(--color-parchment)]'}`}
    >
      <div className="w-full">
        {/* Back button (only in lobby and rules) */}
        {(currentView === 'rules' || currentView === 'lobby') && (
          <div className="mafia-page-container" style={{ paddingBottom: 0, paddingTop: '24px' }}>
            <button
              onClick={() => navigate('/games')}
              className="text-xs uppercase tracking-[0.2em] mb-4 cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)] transition-colors"
            >
              ← Back to Games
            </button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mafia-page-container" style={{ paddingTop: 0, paddingBottom: 0 }}>
            <div className="mafia-error">
              <p>{error}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentView === 'rules' && (
            <motion.div key="rules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mafia-page-container">
                <MafiaRules onStartPlaying={() => setShowRules(false)} />
              </div>
            </motion.div>
          )}

          {currentView === 'lobby' && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mafia-page-container">
                <MafiaLobby
                  players={players}
                  isJoined={isJoined}
                  isHost={isHost}
                  playerCount={playerCount}
                  isLoading={isLoading}
                  guestName={guestName || 'Guest'}
                  onJoin={() => guestName && joinGame(guestName)}
                  onStart={startGame}
                  onShowRules={() => setShowRules(true)}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'role-reveal' && myRole && (
            <motion.div key="role-reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MafiaRoleReveal
                role={myRole}
                onDismiss={() => setRoleRevealed(true)}
              />
            </motion.div>
          )}

          {currentView === 'night' && myRole && myPlayer && (
            <motion.div key="night" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MafiaNightPhase
                myRole={myRole}
                isAlive={isAlive}
                players={players}
                myPlayerId={myPlayer.id}
                hasActed={hasActed}
                timeRemaining={timeRemaining}
                investigationResult={investigationResult}
                onSubmitAction={submitNightAction}
              />
            </motion.div>
          )}

          {currentView === 'day' && game && myPlayer && (
            <motion.div key="day" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MafiaDayPhase
                players={players}
                myPlayerId={myPlayer.id}
                isAlive={isAlive}
                nightResult={nightResult}
                votes={votes}
                hasVoted={hasVoted}
                timeRemaining={timeRemaining}
                status={game.status as 'day' | 'voting'}
                onCastVote={castVote}
              />
            </motion.div>
          )}

          {currentView === 'gameover' && game && (
            <motion.div key="gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MafiaGameOver
                players={players}
                winner={game.winner}
                isHost={isHost}
                onPlayAgain={resetGame}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback for non-joined players watching a game in progress */}
        {!isJoined && game && game.status !== 'lobby' && currentView !== 'rules' && (
          <div className="mafia-page-container text-center">
            <p className="text-sm text-[var(--color-dust)] mb-4">
              A game is in progress. Wait for it to finish to join the next one.
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
