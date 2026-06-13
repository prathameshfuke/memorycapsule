import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../shared/Card';
import Button from '../shared/Button';
import type { MafiaPlayer, MafiaRole } from '../../types/database';

interface MafiaNightPhaseProps {
  myRole: MafiaRole;
  isAlive: boolean;
  players: MafiaPlayer[];
  myPlayerId: string;
  hasActed: boolean;
  timeRemaining: number;
  investigationResult: boolean | null;
  onSubmitAction: (targetId: string) => void;
}

const NIGHT_PROMPTS: Record<string, string> = {
  mafia: 'Choose who to eliminate',
  detective: 'Choose who to investigate',
  doctor: 'Choose who to protect',
};

export default function MafiaNightPhase({
  myRole,
  isAlive,
  players,
  myPlayerId,
  hasActed,
  timeRemaining,
  investigationResult,
  onSubmitAction,
}: MafiaNightPhaseProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const isActiveRole = ['mafia', 'detective', 'doctor'].includes(myRole);
  const alivePlayers = players.filter(p => p.is_alive && p.id !== myPlayerId);

  const handleSubmit = () => {
    if (selectedTarget) {
      onSubmitAction(selectedTarget);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0) : '?';
  };

  const NIGHT_INSTRUCTIONS: Record<string, string> = {
    mafia: 'Discuss with other Mafia members if possible, then select one guest in the town to eliminate. Your choice must be confirmed before the night ends.',
    detective: 'Select one guest to investigate their true alignment. The results of your check will appear on this screen once you confirm your choice.',
    doctor: 'Select one guest to protect from the Mafia tonight. If they are attacked, they will survive. You may protect yourself.',
  };

  // Dead players or villagers see the waiting screen
  if (!isAlive || !isActiveRole || hasActed) {
    return (
      <div className="mafia-night">
        <div className="mafia-page-container flex flex-col items-center justify-center min-h-[calc(100dvh-200px)]">
          <div className="mafia-night-waiting">
            <div className="mafia-night-timer">{formatTime(timeRemaining)}</div>

            {/* Moon SVG */}
            <div className="mafia-moon-container">
              <svg className="mafia-moon" viewBox="0 0 100 100" width="100" height="100">
                <circle cx="50" cy="50" r="35" fill="none" stroke="var(--charcoal)" strokeWidth="1" opacity="0.4" />
                <path
                  d="M 60 20 A 35 35 0 1 0 60 80 A 28 28 0 1 1 60 20"
                  fill="var(--charcoal)"
                  opacity="0.3"
                />
                {/* Stars */}
                <circle cx="15" cy="25" r="1.5" fill="var(--charcoal)" opacity="0.5" />
                <circle cx="85" cy="35" r="1" fill="var(--charcoal)" opacity="0.4" />
                <circle cx="25" cy="75" r="1.2" fill="var(--charcoal)" opacity="0.3" />
                <circle cx="78" cy="70" r="1.5" fill="var(--charcoal)" opacity="0.5" />
                <circle cx="40" cy="12" r="1" fill="var(--charcoal)" opacity="0.4" />
              </svg>
            </div>

            <h2 className="mafia-night-waiting-heading">
              {!isAlive
                ? "You've been eliminated"
                : hasActed
                ? 'Action submitted'
                : 'Night falls. The town sleeps.'}
            </h2>
            <p className="mafia-night-waiting-sub">
              {!isAlive
                ? 'Watch as the game continues...'
                : hasActed
                ? 'Waiting for other players...'
                : 'Wait for the sun to rise.'}
            </p>

            {/* Show investigation result for detective who has acted */}
            {hasActed && myRole === 'detective' && investigationResult !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mafia-night-investigation"
              >
                <Card className="mafia-night-investigation-card">
                  <p className="mafia-night-investigation-text">
                    {investigationResult
                      ? '🔎 Your investigation reveals: they are Mafia.'
                      : '🔎 Your investigation reveals: they are not Mafia.'}
                  </p>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active role screen
  return (
    <div className="mafia-night">
      <div className="mafia-page-container">
        <div className="mafia-night-grid">
          {/* Left Column: Instructions and details */}
          <div className="mafia-night-info-column">
            <div>
              <div className="mafia-night-timer">{formatTime(timeRemaining)}</div>
              <span className="mafia-eyebrow">Secret Role Action</span>
              <h2 className="mafia-night-prompt">{NIGHT_PROMPTS[myRole]}</h2>
            </div>
            
            <Card className="bg-[rgba(251,246,239,0.03)] border-[rgba(156,138,124,0.2)]">
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-dust)] mb-2">Instructions</div>
              <p className="mafia-night-instruction m-0">
                {NIGHT_INSTRUCTIONS[myRole]}
              </p>
            </Card>
          </div>

          {/* Right Column: Player selection grid */}
          <div className="mafia-night-action">
            <span className="mafia-eyebrow block text-left mb-4">Select Target Player</span>
            <div className="mafia-player-grid">
              {alivePlayers.map((player) => (
                <motion.div
                  key={player.id}
                  whileTap={{ scale: 0.97 }}
                >
                  <Card
                    onClick={() => setSelectedTarget(player.id)}
                    className={`mafia-player-card ${selectedTarget === player.id ? 'mafia-player-card-selected' : ''}`}
                  >
                    <div className="mafia-player-avatar">
                      {getInitials(player.guest_name)}
                    </div>
                    <span className="mafia-player-card-name">{player.guest_name}</span>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Button
              variant="primary"
              onDark
              onClick={handleSubmit}
              disabled={!selectedTarget}
              className="mafia-night-submit-btn"
            >
              Confirm choice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
