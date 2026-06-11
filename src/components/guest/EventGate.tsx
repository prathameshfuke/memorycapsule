import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';

const EVENT_CODE = import.meta.env.VITE_EVENT_CODE || 'SUNSHINE2026';
const EVENT_CODE_KEY = 'event_code_verified';

export default function EventGate({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(EVENT_CODE_KEY);
    if (stored === 'true') {
      setIsVerified(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === EVENT_CODE.toUpperCase()) {
      localStorage.setItem(EVENT_CODE_KEY, 'true');
      setIsVerified(true);
      setError('');
    } else {
      setError("Hmm, that doesn't seem right. Try again?");
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="w-6 h-6 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm text-center"
      >
        {/* Emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-6"
        >
          🎂
        </motion.div>

        {/* Title */}
        <h1
          className="text-2xl mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
        >
          Welcome
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Enter the event code to continue.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(''); }}
              placeholder="Event Code"
              autoFocus
              autoComplete="off"
              className="w-full px-5 py-4 rounded-2xl text-center text-lg tracking-widest uppercase outline-none"
              style={{
                background: 'var(--color-cream)',
                color: 'var(--color-brown)',
                border: error
                  ? '2px solid rgba(192, 57, 43, 0.4)'
                  : '1px solid rgba(93, 64, 55, 0.08)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
              }}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs mt-2"
                style={{ color: 'rgba(192, 57, 43, 0.8)' }}
              >
                {error}
              </motion.p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={!code.trim()}
            className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-brown)',
              color: 'var(--color-cream)',
              boxShadow: '0 4px 16px rgba(93, 64, 55, 0.15)',
            }}
          >
            Enter ✨
          </motion.button>
        </form>

        <p className="text-[10px] mt-8" style={{ color: 'var(--color-text-muted)' }}>
          Check the invite or ask the host for the code.
        </p>
      </motion.div>
    </div>
  );
}
