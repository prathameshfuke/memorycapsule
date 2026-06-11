import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EVENT_CODE_KEY = 'event_code_verified';
const MODE_KEY = 'mode';

// SHA-256 hashes for admin codes
const ADMIN_HASHES = [
  '53b708cfbe20165b40cfd70f90765c9c1b3f9ff7ea44f494bf06517172081f2c', // "ADMINKASHISH"
  '070b4be9d57a9ef387cbfa978a3c8bf5e3a89e9df92a5491f274cb7eb47702f3', // "ADMIN_SECRET"
];

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function EventGate({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [code, setCode] = useState('');
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(EVENT_CODE_KEY);
    if (stored === 'true') {
      setIsVerified(true);
    }
    setIsLoading(false);
  }, []);

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

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#1A1614]"
      >
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-blush)' }} />
      </div>
    );
  }

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#1A1614] select-none">
      {/* Film grain */}
      <div className="film-grain pointer-events-none fixed inset-0 z-40" />
      {/* Vignette */}
      <div className="ink-vignette absolute inset-0 z-10" />

      <div className="relative z-20 w-full max-w-lg px-6 flex flex-col items-center justify-center space-y-12">
        {/* Large Centered Cormorant Phrase */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="text-center"
        >
          <h1
            className="text-[clamp(2.5rem,6vw,4.5rem)] italic leading-tight text-[#FAF7F2] font-[family-name:var(--font-display)] font-light"
          >
            for the keeper of our favorite memories
          </h1>
        </motion.div>

        {/* Minimal input line below with delay */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
          onSubmit={handleSubmit}
          className={`w-full max-w-xs transition-transform ${isShaking ? 'animate-shake' : ''}`}
        >
          <input
            type="text"
            value={code}
            onChange={handleInputChange}
            placeholder={isValidating ? "verifying..." : "your invitation code"}
            autoFocus
            autoComplete="off"
            className="w-full bg-transparent text-center text-lg tracking-[0.15em] uppercase border-b border-[#FAF7F2]/20 focus:border-[#FAF7F2]/60 py-2 outline-none transition-colors"
            style={{
              fontFamily: 'var(--font-body)',
              color: isError ? 'var(--color-blush)' : 'var(--color-white)',
            }}
          />
        </motion.form>
      </div>
    </div>
  );
}
