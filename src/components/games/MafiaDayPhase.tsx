import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../shared/Card';
import Button from '../shared/Button';
import type { MafiaPlayer, MafiaNightResult } from '../../types/database';
import { getGuestInfo } from '../../lib/constants';

interface MafiaDayPhaseProps {
  players: MafiaPlayer[];
  myPlayerId: string;
  isAlive: boolean;
  nightResult: MafiaNightResult | null;
  votes: Record<string, number>;
  hasVoted: boolean;
  timeRemaining: number;
  status: 'day' | 'voting';
  onCastVote: (targetId: string) => void;
}

export default function MafiaDayPhase({
  players,
  myPlayerId,
  isAlive,
  nightResult,
  votes,
  hasVoted,
  timeRemaining,
  status,
  onCastVote,
}: MafiaDayPhaseProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const alivePlayers = players.filter(p => p.is_alive && p.id !== myPlayerId);

  const handleVote = () => {
    if (selectedTarget) {
      onCastVote(selectedTarget);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="mafia-day">
      <div className="mafia-page-container">
        <div className="mafia-day-grid">
          {/* Left Column: Stats & Alerts */}
          <div className="mafia-day-info-column">
            <div className="mafia-night-timer mafia-day-timer">{formatTime(timeRemaining)}</div>

            {/* Night result banner */}
            {nightResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mafia-day-result"
              >
                <Card className={`mafia-day-result-card ${nightResult.killed_player_id ? 'mafia-day-result-death' : 'mafia-day-result-safe'}`}>
                  {nightResult.killed_player_id ? (
                    <p className="mafia-day-result-text">
                      Last night, <strong>{getGuestInfo(nightResult.killed_player_name).name}</strong> was eliminated.
                    </p>
                  ) : nightResult.saved ? (
                    <p className="mafia-day-result-text">
                      Last night, the Doctor saved someone's life. No one was eliminated.
                    </p>
                  ) : (
                    <p className="mafia-day-result-text">
                      An uneventful night. No one was eliminated.
                    </p>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Discussion / Voting prompt */}
            <div className="mafia-day-section">
              <span className="mafia-eyebrow">
                {status === 'day' ? 'Discussion Phase' : 'Voting Phase'}
              </span>
              <h2 className="mafia-day-heading">
                {status === 'day'
                  ? "Talk it out — who's suspicious?"
                  : 'Cast your vote'}
              </h2>
              <p className="mafia-day-sub">
                {status === 'day'
                  ? "Discuss in person, look for clues or suspicious behaviors, then prepare to cast your vote."
                  : "Tap on a player you believe is part of the Mafia to cast your vote for their elimination."}
              </p>
            </div>
          </div>

          {/* Right Column: Player Grid & Actions */}
          <div className="mafia-day-players-column">
            {isAlive && !hasVoted ? (
              <>
                <span className="mafia-eyebrow block text-left mb-2">Select Suspect</span>
                <div className="mafia-player-grid">
                  {alivePlayers.map((player) => {
                    const guestInfo = getGuestInfo(player.guest_name);
                    const isSelected = selectedTarget === player.id;
                    return (
                      <motion.div key={player.id} whileTap={{ scale: 0.97 }} className="w-full">
                        <Card
                          onClick={() => setSelectedTarget(player.id)}
                          className={`mafia-player-card mafia-vote-card relative flex flex-col items-center justify-center gap-2 p-4 text-center ${
                            isSelected ? 'mafia-player-card-selected' : ''
                          }`}
                        >
                          <div className="mafia-player-avatar w-14 h-14 rounded-full overflow-hidden border border-[var(--color-dust)]/30 flex-shrink-0 flex items-center justify-center bg-[var(--color-cream)]">
                            <img src={guestInfo.avatar} alt={guestInfo.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="mafia-player-card-name text-xs font-semibold uppercase tracking-wider">{guestInfo.name}</span>
                          {votes[player.id] && (
                            <span className="mafia-vote-badge">{votes[player.id]}</span>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                <Button
                  variant="primary"
                  onClick={handleVote}
                  disabled={!selectedTarget}
                  className="mafia-day-vote-btn"
                >
                  Cast vote
                </Button>
              </>
            ) : (
              <div className="mafia-day-voted">
                {hasVoted && (
                  <div className="mafia-day-voted-msg">Your vote has been submitted. Waiting for others...</div>
                )}
                {!isAlive && (
                  <div className="mafia-day-voted-msg">You've been eliminated. Watching the trial...</div>
                )}

                <span className="mafia-eyebrow block text-left mb-4">Current Vote Count</span>
                {/* Show live vote counts */}
                <div className="mafia-player-grid">
                  {players.filter(p => p.is_alive).map((player) => {
                    const guestInfo = getGuestInfo(player.guest_name);
                    return (
                      <Card key={player.id} className="mafia-player-card mafia-vote-card relative flex flex-col items-center justify-center gap-2 p-4 text-center">
                        <div className="mafia-player-avatar w-14 h-14 rounded-full overflow-hidden border border-[var(--color-dust)]/30 flex-shrink-0 flex items-center justify-center bg-[var(--color-cream)]">
                          <img src={guestInfo.avatar} alt={guestInfo.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="mafia-player-card-name text-xs font-semibold uppercase tracking-wider">{guestInfo.name}</span>
                        {votes[player.id] && (
                          <span className="mafia-vote-badge">{votes[player.id]}</span>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

