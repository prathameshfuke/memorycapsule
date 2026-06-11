import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../../hooks/useGuest';
import { RELATIONSHIPS } from '../../lib/constants';

export default function GuestRegistration() {
  const { showRegistration, setShowRegistration, registerGuest } = useGuest();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !relationship) return;
    registerGuest(name.trim(), relationship);
  };

  return (
    <AnimatePresence>
      {showRegistration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(46, 46, 46, 0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowRegistration(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl p-6 relative"
            style={{
              background: 'var(--color-bg)',
              boxShadow: '0 20px 60px rgba(93, 64, 55, 0.2)',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowRegistration(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-lg cursor-pointer"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Close"
            >
              ×
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-3xl mb-2 block">👋</span>
              <h2
                className="text-xl"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
              >
                Before we begin...
              </h2>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                Tell us who you are. Just once. That's it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="guest-name"
                  className="block text-xs font-medium mb-1.5 tracking-wide uppercase"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Your Name
                </label>
                <input
                  id="guest-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you?"
                  required
                  autoFocus
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-shadow"
                  style={{
                    background: 'var(--color-cream)',
                    color: 'var(--color-text)',
                    border: '1px solid rgba(93, 64, 55, 0.08)',
                  }}
                />
              </div>

              {/* Relationship */}
              <div>
                <label
                  htmlFor="guest-relationship"
                  className="block text-xs font-medium mb-1.5 tracking-wide uppercase"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  How do you know her?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RELATIONSHIPS.map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setRelationship(rel)}
                      className="py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer"
                      style={{
                        background: relationship === rel ? 'var(--color-brown)' : 'var(--color-cream)',
                        color: relationship === rel ? 'var(--color-cream)' : 'var(--color-text)',
                        border: relationship === rel
                          ? '1px solid var(--color-brown)'
                          : '1px solid rgba(93, 64, 55, 0.08)',
                      }}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!name.trim() || !relationship}
                className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--color-brown)',
                  color: 'var(--color-cream)',
                  boxShadow: '0 4px 16px rgba(93, 64, 55, 0.15)',
                }}
              >
                Let's Go ✨
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
