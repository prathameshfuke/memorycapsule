import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { isCapsuleUnlocked } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Message } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/shared/Card';

export default function MessagesPage() {
  const { guestName, isRegistered, setShowRegistration } = useGuest();
  const { isLocked } = useBirthdayLock();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [targetCapsule, setTargetCapsule] = useState<'this-year' | 'next-year'>('this-year');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fetchMessages = useCallback(async () => {
    const mode = localStorage.getItem('mode');
    const unlocked = isCapsuleUnlocked();
    if (mode !== 'admin' && !unlocked) return;
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true });
        if (data) setMessages(data as unknown as Message[]);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const mode = localStorage.getItem('mode');

  /* ─── Birthday Girl View ─── */
  if (mode === 'birthday_girl') {
    if (isLocked) {
      return (
        <PageWrapper className="bg-[var(--color-parchment)]">
          <div className="px-6 md:px-8 pt-16 md:pt-24 pb-8 max-w-md mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
            <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)]">
              Sealed
            </span>
            <h1 className="text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
              sealed messages
            </h1>
            <p className="text-sm text-[var(--color-dust)] font-[family-name:var(--font-body)] leading-relaxed">
              This journal is filling up with messages from your favorite people. Everything will be revealed here on your birthday morning.
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-blush)]">
              Locked until July 5
            </p>
          </div>
        </PageWrapper>
      );
    } else {
      return (
        <PageWrapper className="bg-[var(--color-parchment)]">
          {/* ─── Unlocked Viewer State ─── */}
          <div className="page-container">
            <div className="text-center mb-16">
              <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
                Notes collected
              </span>
              <h1 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
                notes for you
              </h1>
            </div>

            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
            >
              {messages.map((msg) => (
                <Card key={msg.id}>
                  <p className="text-base leading-relaxed text-[var(--color-ink)] font-light italic font-[family-name:var(--font-display)]">
                    "{msg.message}"
                  </p>
                  <p className="text-xs mt-4 text-right text-[var(--color-dust)] uppercase tracking-[0.05em]">
                    — {msg.guest_name || 'Anonymous'}
                  </p>
                </Card>
              ))}
            </div>
            {messages.length === 0 && (
              <p className="text-center text-sm text-[var(--color-dust)] mt-16">No notes found.</p>
            )}
          </div>
        </PageWrapper>
      );
    }
  }

  /* ─── Guest/Admin: Submission + Viewer ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || messageText.trim().length < 10) return;
    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const table = targetCapsule === 'this-year' ? 'messages' : 'future_letters';
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from(table).insert([{
          guest_name: guestName,
          message: messageText.trim(),
        }]);
        if (error) throw error;
      } else {
        if (table === 'messages') {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            guest_name: guestName || 'Anonymous',
            message: messageText.trim(),
            created_at: new Date().toISOString(),
          }]);
        }
      }
      setMessageText('');
      setHasSubmitted(true);
      fetchMessages();
    } catch (err) {
      console.error('Error submitting message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = messageText.trim().length;
  const isValidLength = charCount >= 10 && charCount <= 500;

  return (
    <PageWrapper className="bg-[var(--color-cream)]">
      {/* Full viewport journal */}
      <div className="min-h-[100dvh] flex flex-col">
        {/* Header area */}
      <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
              Write a letter
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
              for her
            </h1>
          </motion.div>

          {/* Capsule Target Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-8 mb-8"
          >
            <button
              onClick={() => setTargetCapsule('this-year')}
              className="text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer py-1.5 border-b-2"
              style={{
                borderColor: targetCapsule === 'this-year' ? 'var(--color-blush)' : 'transparent',
                color: targetCapsule === 'this-year' ? 'var(--color-ink)' : 'var(--color-dust)',
              }}
            >
              for this year
            </button>
            <button
              onClick={() => setTargetCapsule('next-year')}
              className="text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer py-1.5 border-b-2"
              style={{
                borderColor: targetCapsule === 'next-year' ? 'var(--color-blush)' : 'transparent',
                color: targetCapsule === 'next-year' ? 'var(--color-ink)' : 'var(--color-dust)',
              }}
            >
              for next year
            </button>
          </motion.div>
        </div>

        {/* Journal editor area */}
      <div className="flex-1 flex flex-col page-container">
          <AnimatePresence mode="wait">
            {hasSubmitted ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
              >
                <Card className="py-16 px-8 text-center w-full max-w-md">
                  <h3 className="text-2xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-4">
                    Added to capsule
                  </h3>
                  <p className="text-sm text-[var(--color-dust)] max-w-xs mx-auto">
                    Your letter has been sealed and will be revealed on July 5{targetCapsule === 'next-year' ? ', 2027' : ''}.
                  </p>
                  <button
                    onClick={() => setHasSubmitted(false)}
                    className="text-xs uppercase tracking-[0.2em] underline text-[var(--color-dust)] hover:text-[var(--color-ink)] cursor-pointer mt-6 block mx-auto"
                  >
                    Write another note
                  </button>
                </Card>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex-1 flex flex-col"
              >
                <div
                  className="relative flex-1 rounded-[4px] border border-[var(--color-dust)] p-6 flex flex-col"
                  style={{
                    background: 'var(--color-cream)',
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(140, 123, 110, 0.12) 31px, rgba(140, 123, 110, 0.12) 32px)',
                  }}
                >
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={targetCapsule === 'this-year' ? "What would you like her to remember forever?" : "Write a letter to her future self (opens July 5, 2027)..."}
                    maxLength={500}
                    rows={10}
                    className="w-full flex-1 bg-transparent outline-none resize-none focus:ring-0 focus:border-none border-none caret-[var(--color-blush)]"
                    style={{
                      lineHeight: '32px',
                      border: 'none',
                      boxShadow: 'none',
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.4rem',
                      color: 'var(--color-ink)',
                    }}
                    autoFocus
                  />

                  <div className="flex items-center justify-between mt-4 text-[var(--color-dust)] text-[10px] uppercase tracking-[0.1em] border-t border-[var(--color-dust)]/10 pt-4">
                    <span>
                      {charCount > 0 && charCount < 10 ? 'needs 10 characters' : ''}
                    </span>
                    <span className="tabular-nums">
                      {charCount}/500
                    </span>
                  </div>
                </div>

                {/* Bottom-right submit link, 24px margin */}
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={!isValidLength || isSubmitting}
                    className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] hover:text-[var(--color-ink)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    {isSubmitting ? 'sealing note...' : 'leave this note →'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Viewer mode: note cards grid (after unlock) */}
        {!isLocked && messages.length > 0 && (
          <div className="bg-[var(--color-parchment)] py-16 px-6 md:px-8">
            <div className="page-container">
              <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] text-center mb-8">
                Shared Letters
              </h2>
              <div
                className="grid gap-6"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
              >
                {messages.map((msg) => (
                  <Card key={msg.id}>
                    <p className="text-base leading-relaxed text-[var(--color-ink)] font-light italic font-[family-name:var(--font-display)]">
                      "{msg.message}"
                    </p>
                    <p className="text-xs mt-4 text-right text-[var(--color-dust)] uppercase tracking-[0.05em]">
                      — {msg.guest_name || 'Anonymous'}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
