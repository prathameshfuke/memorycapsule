import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { isCapsuleUnlocked } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { GuestbookEntry } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';

/* ─── Entries Grid (reusable for CapsulePage) ─── */
export function GuestbookEntries({ entries }: { entries: GuestbookEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-center text-sm text-[var(--color-dust)]">No signatures found.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {entries.map((entry, i) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="h-full"
        >
          <Card className="h-full flex flex-col justify-between">
            <div>
              <p className="text-base leading-relaxed text-[var(--color-ink)] font-light italic font-[family-name:var(--font-display)]">
                "{entry.message}"
              </p>
            </div>
            <div className="flex items-center justify-between mt-6 text-[var(--color-dust)] border-t border-[var(--color-dust)]/10 pt-4 text-[10px] uppercase tracking-[0.1em]">
              <span>— {entry.guest_name || 'Anonymous'}</span>
              <span className="tabular-nums">{new Date(entry.created_at).toLocaleDateString()}</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

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
    if (mode !== 'admin' && !unlocked) return;
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

  const mode = localStorage.getItem('mode');

  /* ─── Birthday Girl View ─── */
  if (mode === 'birthday_girl') {
    if (isLocked) {
      return (
        <PageWrapper className="bg-[var(--color-parchment)]">
          <div className="sealed-state">
            <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)]">Sealed</span>
            <h1 className="text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
              sealed guestbook
            </h1>
            <p className="text-sm text-[var(--color-dust)] font-[family-name:var(--font-body)] leading-relaxed">
              The guest registry is sealed until your birthday morning.
            </p>
            <p className="text-sm uppercase tracking-[0.2em] font-bold text-red mt-2">
              Locked until July 5
            </p>
          </div>
        </PageWrapper>
      );
    } else {
      return (
        <PageWrapper className="bg-[var(--color-parchment)]">
        <div className="page-container">
            <div className="text-center mb-16">
              <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
                Signed by
              </span>
              <h1 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
                {entries.length} signature{entries.length !== 1 ? 's' : ''} so far
              </h1>
            </div>
            <GuestbookEntries entries={entries} />
          </div>
        </PageWrapper>
      );
    }
  }

  /* ─── Guest/Admin: Form + Entries ─── */
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
    <PageWrapper className="bg-[var(--color-parchment)]">
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
            Leave your mark
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
            sign the guestbook
          </h1>
          <p className="text-sm text-[var(--color-dust)] mt-4">
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
            className="space-y-4 max-w-lg mx-auto"
          >
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a public note..."
              rows={4}
              className="w-full px-0 py-4 text-sm outline-none resize-none leading-relaxed caret-red bg-transparent border-b border-[var(--color-dust)] focus:border-[var(--color-blush)] transition-colors"
              style={{
                color: 'var(--color-ink)',
                fontFamily: message ? 'var(--font-display)' : 'var(--font-body)',
                fontStyle: message ? 'italic' : 'normal',
                fontSize: message ? '1.1rem' : '0.875rem',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderRadius: 0,
              }}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={!message.trim() || isSubmitting}
              >
                {isSubmitting ? 'signing registry...' : 'sign the guestbook'}
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center py-16 max-w-lg mx-auto">
              <h3 className="text-2xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-4">
                signature recorded
              </h3>
              <p className="text-sm text-[var(--color-dust)] max-w-xs mx-auto">
                Thank you for signing the guestbook.
              </p>
              <button
                onClick={() => setHasSubmitted(false)}
                className="text-xs uppercase tracking-[0.2em] underline text-[var(--color-dust)] hover:text-[var(--color-ink)] cursor-pointer mt-6 block mx-auto"
              >
                sign again
              </button>
            </Card>
          </motion.div>
        )}

        {/* 64px gap before entries */}
        {!isLocked && entries.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] text-center mb-8">
              Signed by — {entries.length} signature{entries.length !== 1 ? 's' : ''}
            </h2>
            <GuestbookEntries entries={entries} />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
