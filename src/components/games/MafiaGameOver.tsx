import { motion } from 'framer-motion';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Confetti from '../shared/Confetti';
import type { MafiaPlayer, MafiaWinner } from '../../types/database';

interface MafiaGameOverProps {
  players: MafiaPlayer[];
  winner: MafiaWinner;
  isHost: boolean;
  onPlayAgain: () => void;
}

export default function MafiaGameOver({
  players,
  winner,
  isHost,
  onPlayAgain,
}: MafiaGameOverProps) {
  const isTownWin = winner === 'town';

  const getInitials = (name: string) => {
    return name ? name.charAt(0) : '?';
  };

  return (
    <div className="mafia-gameover">
      {isTownWin && <Confetti duration={5000} />}

      <div className="mafia-page-container">
        <div className="mafia-gameover-layout">
          {/* Left Column: Heading and Main Info */}
          <div className="flex flex-col justify-center items-start text-left">
            <span className="mafia-eyebrow mafia-gameover-eyebrow">Game Over</span>

            <motion.h1
              className="mafia-gameover-heading"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {isTownWin ? 'The Town Wins' : 'Mafia Wins'}
            </motion.h1>

            <motion.p
              className="mafia-gameover-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {isTownWin
                ? 'Justice prevails. Every last Mafia member was successfully found and eliminated by the town.'
                : 'The shadows win. The Mafia successfully took over the town and eliminated all resistance.'}
            </motion.p>

            {isHost && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="w-full"
              >
                <Button variant="primary" onDark onClick={onPlayAgain} className="mafia-gameover-btn">
                  Play again
                </Button>
              </motion.div>
            )}
          </div>

          {/* Right Column: Revealed Roles list */}
          <div className="mafia-gameover-roles-section text-left">
            <h3 className="mafia-gameover-roles-heading">All Roles Revealed</h3>
            
            <div className="mafia-gameover-grid">
              {players.map((player) => (
                <Card
                  key={player.id}
                  className={`mafia-gameover-card ${player.role === 'mafia' ? 'mafia-gameover-card-mafia' : ''} ${!player.is_alive ? 'mafia-gameover-card-dead' : ''}`}
                >
                  <div className="mafia-player-avatar">
                    {getInitials(player.guest_name)}
                  </div>
                  <span className="mafia-gameover-card-name">{player.guest_name}</span>
                  <span
                    className="mafia-gameover-card-role text-xs"
                    style={{ color: player.role === 'mafia' ? 'var(--red)' : 'var(--charcoal)' }}
                  >
                    {player.role ? player.role.charAt(0).toUpperCase() + player.role.slice(1) : 'Unknown'}
                  </span>
                  {!player.is_alive && (
                    <span className="mafia-gameover-card-status">Eliminated</span>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
