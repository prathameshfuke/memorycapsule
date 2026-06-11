import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { isCapsuleUnlocked } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { GuestbookEntry } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';

export default function GuestbookPage() {
  const { guestName, isRegistered, setShowRegistration } = useGuest();
  const { isLocked } = useBirthdayLock();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fetchEntries = useCallback(async () => {
    const mode = localStorage.getItem('mode');
    const unlocked = isCapsuleUnlocked();

    // Query gate: if not admin and locked, DO NOT query
    if (mode !== 'admin' && !unlocked) {
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('guestbook')
          .select('*')
          .order('created_at', { ascending: true });
        if (data) setEntries(data as unknown as GuestbookEntry[]);
      } catch (err) {
        console.error('Failed to fetch guestbook:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('guestbook').insert([{
          guest_name: guestName,
          message: message.trim(),
        }]);
        if (error) throw error;
        fetchEntries();
      } else {
        // Local fallback
        setEntries(prev => [...prev, {
          id: crypto.randomUUID(),
          guest_name: guestName || 'Anonymous',
          message: message.trim(),
          created_at: new Date().toISOString(),
        }]);
      }
      setMessage('');
      setHasSubmitted(true);
    } catch (err) {
      console.error('Error signing guestbook:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="bg-[#FAF7F2]">
      <div className="film-grain pointer-events-none fixed inset-0 z-40" />

      <div className="px-6 pt-20 pb-8 max-w-[860px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 mb-8"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
            Registry
          </span>
          <h1
            className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]"
          >
            guestbook
          </h1>
          <p className="text-sm text-[var(--color-dust)]">
            Leave your signature on the registry.
          </p>
        </motion.div>

        {/* Form */}
        {!hasSubmitted ? (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="mb-12 space-y-4"
          >
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a public note..."
              rows={4}
              className="w-full px-5 py-4 rounded-[4px] text-sm outline-none resize-none leading-relaxed caret-[var(--color-blush)]"
              style={{
                background: 'var(--color-cream)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-dust)',
                fontFamily: message ? 'var(--font-handwritten)' : 'var(--font-body)',
                fontStyle: message ? 'italic' : 'normal',
                fontSize: message ? '1.1rem' : '0.875rem',
              }}
            />
            <button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className="w-full py-3.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-[4px] text-xs uppercase tracking-[0.2em] font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-ink)]/90 transition-colors"
            >
              {isSubmitting ? 'signing registry...' : 'sign the guestbook'}
            </button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 mb-12 rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)] flex flex-col items-center justify-center space-y-3"
          >
            <h3 className="text-2xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
              signature recorded
            </h3>
            <p className="text-sm text-[var(--color-dust)] max-w-xs">
              Thank you for signing the guestbook.
            </p>
            <button
              onClick={() => setHasSubmitted(false)}
              className="text-xs uppercase tracking-[0.2em] underline text-[var(--color-dust)] hover:text-[var(--color-ink)] cursor-pointer mt-4"
            >
              sign again
            </button>
          </motion.div>
        )}

        {/* Entries (Only visible after unlock) */}
        {!isLocked && entries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-dust)] text-center mb-6">
              Guest Signatures
            </h2>
            <div className="space-y-4">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)]"
                  style={{
                    transform: `rotate(${-0.5 + (i * 0.3) % 1}deg)`,
                  }}
                >
                  <p
                    className="text-base leading-relaxed text-[var(--color-ink)] font-light italic font-[family-name:var(--font-display)]"
                  >
                    "{entry.message}"
                  </p>
                  <div className="flex items-center justify-between mt-4 text-[var(--color-dust)] border-t border-[var(--color-dust)]/10 pt-3 text-[10px] uppercase tracking-[0.1em]">
                    <span>
                      — {entry.guest_name || 'Anonymous'}
                    </span>
                    <span className="tabular-nums">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
