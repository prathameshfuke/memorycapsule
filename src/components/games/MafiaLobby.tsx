import { motion } from 'framer-motion';
import Card from '../shared/Card';
import Button from '../shared/Button';
import type { MafiaPlayer } from '../../types/database';
import { getGuestInfo } from '../../lib/constants';

interface MafiaLobbyProps {
  players: MafiaPlayer[];
  isJoined: boolean;
  isHost: boolean;
  playerCount: number;
  isLoading: boolean;
  guestName: string;
  onJoin: () => void;
  onStart: () => void;
  onShowRules: () => void;
}

export default function MafiaLobby({
  players,
  isJoined,
  isHost,
  playerCount,
  isLoading,
  guestName,
  onJoin,
  onStart,
  onShowRules,
}: MafiaLobbyProps) {
  const minPlayers = 4;
  const canStart = playerCount >= minPlayers;

  return (
    <div className="mafia-lobby">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onShowRules}
          className="mafia-lobby-rules-link"
        >
          Rules & Roles
        </button>
      </div>

      <div className="mafia-lobby-grid">
        {/* Left Column: Status and Settings */}
        <div className="mafia-lobby-info-column">
          <div className="mafia-lobby-header">
            <span className="mafia-eyebrow">Party Game</span>
            <h1 className="mafia-lobby-heading">Gather the Suspects</h1>
            <div className="mt-4">
              <span className="mafia-lobby-count">
                {playerCount} player{playerCount !== 1 ? 's' : ''} joined
              </span>
            </div>
          </div>

          <Card className="mafia-lobby-status-card">
            <div className="mafia-lobby-status-title">Game Settings</div>
            <p className="mafia-lobby-status-text">
              Minimum {minPlayers} players are required to start. 
              {playerCount < minPlayers 
                ? ` Waiting for at least ${minPlayers - playerCount} more player${minPlayers - playerCount !== 1 ? 's' : ''} to join.`
                : " We have enough players! The host can start the game when everyone is ready."
              }
            </p>
          </Card>

          <Card className="border-l-4 border-[var(--color-dust)]">
            <div className="mafia-lobby-status-title">How it works</div>
            <p className="mafia-lobby-status-text">
              Once started, players will be secretly assigned roles (Mafia, Detective, Doctor, or Villager) on their phones. Keep your screen secret!
            </p>
          </Card>
        </div>

        {/* Right Column: Player Grid & Actions */}
        <div className="mafia-lobby-players-column">
          <h3 className="mafia-lobby-players-heading">Joined Guests</h3>
          
          <div className="mafia-lobby-players-grid">
            {players.map((player) => {
              const guestInfo = getGuestInfo(player.guest_name);
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <Card className="mafia-lobby-player-card">
                    <div className="mafia-lobby-player-inner flex items-center gap-3">
                      <div className="mafia-player-avatar w-10 h-10 rounded-full overflow-hidden border border-[var(--color-dust)]/30 flex-shrink-0 flex items-center justify-center bg-[var(--color-cream)]">
                        <img src={guestInfo.avatar} alt={guestInfo.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="mafia-lobby-player-name font-medium">{guestInfo.name}</span>
                      {player.is_host && (
                        <span className="mafia-lobby-host-badge">host</span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}


            {playerCount === 0 && (
              <p className="mafia-lobby-empty">
                No one has joined yet. Be the first to enter the lobby!
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mafia-lobby-actions">
            {!isJoined ? (
              <Button
                variant="primary"
                onClick={onJoin}
                disabled={isLoading}
                className="mafia-lobby-join-btn"
              >
                {isLoading ? 'Joining...' : `Join as ${guestName}`}
              </Button>
            ) : (
              <div className="mafia-lobby-joined-msg">
                You're joined · Waiting for host to start
              </div>
            )}

            {isHost && (
              <Button
                variant="primary"
                onClick={onStart}
                disabled={!canStart || isLoading}
                className="mafia-lobby-start-btn"
              >
                {isLoading ? 'Starting...' : canStart ? 'Start Game' : `Need ${minPlayers} Players`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
