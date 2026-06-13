import { motion } from 'framer-motion';
import Button from '../shared/Button';
import type { MafiaRole } from '../../types/database';

interface MafiaRoleRevealProps {
  role: MafiaRole;
  onDismiss: () => void;
}

const ROLE_DESCRIPTIONS: Record<MafiaRole, string> = {
  mafia: 'You wake at night and choose someone to eliminate.',
  detective: 'Each night, investigate one person to learn if they are Mafia.',
  doctor: 'Each night, choose one person to protect from the Mafia.',
  villager: 'No special power — just your instincts and your vote.',
};

export default function MafiaRoleReveal({ role, onDismiss }: MafiaRoleRevealProps) {
  const isMafia = role === 'mafia';

  return (
    <motion.div
      className="mafia-role-reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mafia-role-reveal-inner">
        <motion.span
          className="mafia-role-reveal-eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your role
        </motion.span>

        <motion.h1
          className="mafia-role-reveal-name"
          style={{ color: isMafia ? 'var(--red)' : 'var(--paper)' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </motion.h1>

        <motion.p
          className="mafia-role-reveal-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {ROLE_DESCRIPTIONS[role]}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <Button variant="ghost" onDark onClick={onDismiss}>
            Got it
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
