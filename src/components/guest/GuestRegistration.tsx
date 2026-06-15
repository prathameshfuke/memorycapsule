import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../../hooks/useGuest';
import { GUESTS, getGuestInfo } from '../../lib/constants';

interface GuestRegistrationProps {
  force?: boolean;
}

export default function GuestRegistration({ force = false }: GuestRegistrationProps) {
  const { showRegistration, setShowRegistration, registerGuest } = useGuest();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (guestId: string, name: string, avatar: string) => {
    setSelectedId(guestId);
    
    // Satisfying micro-delay for selection animation feedback before completing
    setTimeout(() => {
      registerGuest(guestId, name, avatar);
      setSelectedId(null);
    }, 600);
  };

  const shouldShow = force || showRegistration;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto ${
            force
              ? 'bg-[var(--color-ink)]'
              : 'bg-[var(--color-ink)]/85 backdrop-blur-md'
          }`}
          onClick={force ? undefined : () => setShowRegistration(false)}
        >
          {/* Subtle film grain & background gradient */}
          <div className="film-grain pointer-events-none fixed inset-0 z-10 opacity-30" />
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'radial-gradient(circle at 50% 30%, rgba(140, 74, 58, 0.15) 0%, transparent 60%)'
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-20 w-full max-w-lg px-5 py-8 md:px-10 md:py-12 text-[var(--color-ink)]"
          >
            {/* Close button (only when not forced) */}
            {!force && (
              <button
                onClick={() => setShowRegistration(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-[4px] text-xl cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-cream)] transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            )}

            {/* Header */}
            <div className="text-center">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-dust)] font-semibold block mb-3">
                Choose Yourself
              </span>
              <h2 className="text-3xl font-light font-[family-name:var(--font-display)] tracking-tight mb-2" style={{ color: 'var(--color-cream)' }}>
                Who are you?
              </h2>
              <p className="text-xs text-[var(--color-dust)] leading-relaxed mx-auto mb-8 text-center" style={{ maxWidth: '420px' }}>
                Select your character card to enter the memory capsule and start playing.
              </p>
            </div>

            {/* Characters Grid — no inner scroll, let page scroll naturally */}
            <div
              className="select-none"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {GUESTS.map((guest) => {
                const info = getGuestInfo(guest.id);
                const isSelected = selectedId === guest.id;
                const isAnySelected = selectedId !== null;

                return (
                  <motion.button
                    key={guest.id}
                    type="button"
                    whileHover={isAnySelected ? {} : { scale: 1.05, y: -2 }}
                    whileTap={isAnySelected ? {} : { scale: 0.97 }}
                    onClick={() => !isAnySelected && handleSelect(guest.id, info.name, info.avatar)}
                    className={`relative flex flex-col items-center justify-center gap-3 rounded-[4px] border cursor-pointer text-center transition-all duration-300 ${
                      isSelected
                        ? 'border-[var(--color-crimson)] shadow-[0_0_15px_rgba(195,35,43,0.25)] bg-[var(--color-ink)]/80'
                        : isAnySelected
                        ? 'opacity-40 border-[var(--color-dust)]/30 bg-transparent'
                        : 'border-[var(--color-dust)]/50 hover:border-[var(--color-ember)] bg-[var(--color-ink)]/40 hover:bg-[var(--color-ink)]/60'
                    }`}
                    style={{ padding: '20px 12px' }}
                  >
                    {/* Avatar Frame */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[var(--color-dust)]/40 bg-[var(--color-cream)] flex-shrink-0 flex items-center justify-center">
                      <img
                        src={info.avatar}
                        alt={info.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isSelected ? 'scale-110 rotate-3' : ''
                        }`}
                      />
                    </div>

                    {/* Name — gap-3 on parent handles spacing, no extra margin */}
                    <span
                      className={`text-xs uppercase tracking-wider font-semibold font-[family-name:var(--font-body)] ${
                        isSelected ? 'text-[var(--color-crimson)]' : 'text-[var(--color-cream)]'
                      }`}
                    >
                      {info.name}
                    </span>

                    {/* Selected Check Indicator Overlay */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-2 right-2 bg-[var(--color-crimson)] text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px]"
                        >
                          ✓
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
