import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const EVENT_CODE_KEY = 'event_code_verified';
const MODE_KEY = 'mode';

// SHA-256 hashes for admin codes
const ADMIN_HASHES = [
  'aa7463fd6034efb2a16d8c10d2f8238b8e7e930ff4865d2f93d6b40e0a31cbad', // "ADMINKASHISH"
  'ac77ea236b6980230005ec9a5c96d7dff05cccf1eef3754dbaba5e00b1fdf4ff', // "ADMIN_SECRET"
];

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function EventGate({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(
    () => localStorage.getItem(EVENT_CODE_KEY) === 'true',
  );
  const [code, setCode] = useState('');
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validateCode = async (inputVal: string) => {
    const trimmed = inputVal.trim().toUpperCase();
    if (!trimmed) return;

    setIsValidating(true);
    let matchedMode: 'guest' | 'birthday_girl' | 'admin' | null = null;

    if (trimmed === 'CELEBRATEKASHISH') {
      matchedMode = 'guest';
    } else if (trimmed === 'KASHISH') {
      matchedMode = 'birthday_girl';
    } else {
      const inputHash = await sha256(trimmed);
      if (ADMIN_HASHES.includes(inputHash)) {
        matchedMode = 'admin';
      }
    }

    setIsValidating(false);

    if (matchedMode) {
      localStorage.setItem(EVENT_CODE_KEY, 'true');
      localStorage.setItem(MODE_KEY, matchedMode);
      
      // Also write guest name for birthday_girl/admin to bypass registration if needed
      if (matchedMode === 'birthday_girl') {
        localStorage.setItem('guest_name', 'Kashish');
        localStorage.setItem('guest_relationship', 'Birthday Girl');
      } else if (matchedMode === 'admin') {
        localStorage.setItem('guest_name', 'Admin');
        localStorage.setItem('guest_relationship', 'Admin');
      }
      
      setIsVerified(true);
      setIsError(false);
    } else {
      setIsError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Debounced auto-submit logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCode(val);
    setIsError(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (val.trim()) {
      timerRef.current = setTimeout(() => {
        validateCode(val);
      }, 600);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    validateCode(code);
  };

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden select-none"
      style={{
        background: 'radial-gradient(circle at 50% 38%, #8C4A3A 0%, #1C1410 58%, #1C1410 100%)',
      }}
    >
      {/* Film grain */}
      <div className="film-grain pointer-events-none fixed inset-0 z-40" />
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(28, 20, 16, 0.78) 100%)' }}
      />

      <div className="relative z-20 w-full max-w-xl px-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-center w-full"
        >
          <p
            className="mb-6 text-[10px] uppercase tracking-[0.32em]"
            style={{ color: '#C9A45C', fontFamily: 'var(--font-body)' }}
          >
            A private birthday collection
          </p>
          <h1
            className="italic font-[family-name:var(--font-display)] font-light"
            style={{
              color: '#FBF6EF',
              fontSize: 'clamp(3rem, 9vw, 5.5rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
              textShadow: '0 2px 24px rgba(0, 0, 0, 0.32)',
            }}
          >
            <span className="block">For the keeper</span>
            <span className="block">of our favourite</span>
            <span className="block">memories.</span>
          </h1>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className={`w-full max-w-sm mt-12 transition-transform ${isShaking ? 'animate-shake' : ''}`}
        >
          <label
            htmlFor="invitation-code"
            className="block mb-3 text-center text-[10px] uppercase tracking-[0.24em]"
            style={{ color: '#C9A45C', fontFamily: 'var(--font-body)' }}
          >
            Enter your invitation code
          </label>
          <input
            id="invitation-code"
            type="text"
            value={code}
            onChange={handleInputChange}
            placeholder={isValidating ? 'Verifying...' : 'Invitation code'}
            autoFocus
            autoComplete="off"
            className="w-full rounded-[4px] text-center text-sm tracking-[0.16em] uppercase py-3.5 px-4 outline-none transition-colors placeholder:text-[var(--color-cream)]/40"
            style={{
              fontFamily: 'var(--font-body)',
              color: isError ? '#C9A45C' : '#FBF6EF',
              background: 'rgba(251, 246, 239, 0.06)',
              border: `1px solid ${isError ? '#C9A45C' : 'rgba(251, 246, 239, 0.28)'}`,
            }}
          />
          {isError && (
            <p className="mt-3 text-center text-xs" style={{ color: '#C9A45C' }}>
              That code does not open this collection.
            </p>
          )}
        </motion.form>
      </div>
    </div>
  );
}
