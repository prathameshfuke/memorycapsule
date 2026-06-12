import React, { useState } from 'react';
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--color-ink)]/70 backdrop-blur-sm"
          onClick={() => setShowRegistration(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[4px] p-6 relative border border-[var(--color-dust)] bg-[var(--color-cream)] text-[var(--color-ink)]"
          >
            {/* Close button */}
            <button
              onClick={() => setShowRegistration(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-[4px] text-lg cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)]"
              aria-label="Close"
            >
              ×
            </button>

            {/* Header */}
            <div className="text-center mb-6 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-dust)]">
                Registration
              </span>
              <h2
                className="text-2xl font-light font-[family-name:var(--font-display)]"
              >
                before we begin
              </h2>
              <p className="text-xs text-[var(--color-dust)] leading-relaxed">
                Tell us who you are. Just once. That's it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="guest-name"
                  className="block text-[10px] uppercase tracking-[0.15em] text-[var(--color-dust)]"
                >
                  your name
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
                  className="w-full px-4 py-3 rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)] text-sm outline-none caret-[var(--color-blush)]"
                  style={{
                    color: 'var(--color-ink)',
                  }}
                />
              </div>

              {/* Relationship */}
              <div className="space-y-1.5">
                <label
                  htmlFor="guest-relationship"
                  className="block text-[10px] uppercase tracking-[0.15em] text-[var(--color-dust)]"
                >
                  how do you know her?
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {RELATIONSHIPS.map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setRelationship(rel)}
                      className="py-2.5 rounded-[4px] text-xs uppercase tracking-[0.1em] transition-colors cursor-pointer border"
                      style={{
                        background: relationship === rel ? 'var(--color-ink)' : 'var(--color-cream)',
                        color: relationship === rel ? 'var(--color-cream)' : 'var(--color-ink)',
                        borderColor: relationship === rel ? 'var(--color-ink)' : 'var(--color-dust)',
                      }}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!name.trim() || !relationship}
                className="w-full py-3.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-[4px] text-xs uppercase tracking-[0.2em] font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-ink)]/90 transition-colors"
              >
                let's begin
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
