import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/camera', icon: '📸', label: 'Camera' },
  { path: '/one-word', icon: '💬', label: 'Words' },
  { path: '/messages', icon: '💌', label: 'Notes' },
  { path: '/games', icon: '🎮', label: 'Games' },
  { path: '/capsule', icon: '🎁', label: 'Capsule' },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="mx-3 mb-3 rounded-2xl px-2 py-2 flex items-center justify-around"
        style={{
          background: 'rgba(244, 239, 230, 0.85)',
          backdropFilter: 'blur(20px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
          border: '1px solid rgba(93, 64, 55, 0.08)',
          boxShadow: '0 8px 32px rgba(93, 64, 55, 0.12), 0 2px 8px rgba(93, 64, 55, 0.06)',
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(212, 163, 115, 0.15)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="text-lg relative z-10">{item.icon}</span>
              <span
                className="text-[10px] font-medium relative z-10 transition-colors"
                style={{ color: isActive ? '#5d4037' : '#6b6560' }}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </motion.nav>
  );
}
