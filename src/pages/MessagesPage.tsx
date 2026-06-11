import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { isCapsuleUnlocked } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Message } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';

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

    // Query gate: if not admin and locked, DO NOT query
    if (mode !== 'admin' && !unlocked) {
      return;
    }

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
        // Local fallback
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
    <PageWrapper className="bg-[#FAF7F2]">
      {/* Film grain */}
      <div className="film-grain pointer-events-none fixed inset-0 z-40" />

      <div className="px-6 pt-20 pb-8 max-w-[860px] mx-auto min-h-[100dvh] flex flex-col justify-between">
        <div className="space-y-8 flex-1 flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
              Write a letter
            </span>
            <h1
              className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]"
            >
              for her
            </h1>
          </motion.div>

          {/* Capsule Target Toggle - for this year vs next year */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-6"
          >
            <button
              onClick={() => setTargetCapsule('this-year')}
              className="text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer py-1.5 border-b-2"
              style={{
                borderColor: targetCapsule === 'this-year' ? 'var(--color-blush)' : 'transparent',
                color: targetCapsule === 'this-year' ? 'var(--color-ink)' : 'var(--color-dust)',
              }}
            >
              for this year
            </button>
            <button
              onClick={() => setTargetCapsule('next-year')}
              className="text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer py-1.5 border-b-2"
              style={{
                borderColor: targetCapsule === 'next-year' ? 'var(--color-blush)' : 'transparent',
                color: targetCapsule === 'next-year' ? 'var(--color-ink)' : 'var(--color-dust)',
              }}
            >
              for next year
            </button>
          </motion.div>

          {/* Blank Ruled Journal Page Editor */}
          <div className="flex-1 flex flex-col pt-6">
            <AnimatePresence mode="wait">
              {hasSubmitted ? (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20 px-6 border border-[var(--color-dust)] rounded-[4px] bg-[var(--color-cream)] flex flex-col items-center justify-center space-y-4 flex-1"
                >
                  <h3 className="text-2xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
                    Added to capsule
                  </h3>
                  <p className="text-sm max-w-xs text-[var(--color-dust)]">
                    Your letter has been sealed and will be revealed on July 5{targetCapsule === 'next-year' ? ', 2027' : ''}.
                  </p>
                  <button
                    onClick={() => setHasSubmitted(false)}
                    className="text-xs uppercase tracking-[0.2em] underline text-[var(--color-dust)] hover:text-[var(--color-ink)] cursor-pointer mt-4"
                  >
                    Write another note
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex-1 flex flex-col justify-between"
                >
                  <div className="relative flex-1 bg-[var(--color-cream)] border border-[var(--color-dust)] rounded-[4px] p-6 flex flex-col">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={targetCapsule === 'this-year' ? "What would you like her to remember forever?" : "Write a letter to her future self (opens July 5, 2027)..."}
                      maxLength={500}
                      rows={10}
                      className="w-full flex-1 bg-transparent outline-none resize-none leading-[28px] focus:ring-0 focus:border-none border-none caret-[var(--color-blush)]"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 96%, rgba(140, 123, 110, 0.15) 96%, rgba(140, 123, 110, 0.15) 100%)',
                        backgroundSize: '100% 28px',
                        lineHeight: '28px',
                        border: 'none',
                        boxShadow: 'none',
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.4rem',
                        color: 'var(--color-ink)',
                      }}
                      autoFocus
                    />
                    
                    <div className="flex items-center justify-between mt-4 text-[var(--color-dust)] text-[10px] uppercase tracking-[0.1em] border-t border-[var(--color-dust)]/10 pt-3">
                      <span>
                        {charCount > 0 && charCount < 10 ? 'needs 10 characters' : ''}
                      </span>
                      <span className="tabular-nums">
                        {charCount}/500
                      </span>
                    </div>
                  </div>

                  {/* Ruled submission link line */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={!isValidLength || isSubmitting}
                      className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)] hover:text-[var(--color-ink)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      {isSubmitting ? 'sealing note...' : 'leave this note →'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Locked lists view (only visible after unlock) */}
        {!isLocked && messages.length > 0 && (
          <div className="mt-16 space-y-6">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-dust)] text-center">
              Shared Letters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className="p-5 rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)]"
                  style={{ transform: `rotate(${-1 + Math.random() * 2}deg)` }}
                >
                  <p className="text-base leading-relaxed text-[var(--color-ink)] font-light italic font-[family-name:var(--font-display)]">
                    "{msg.message}"
                  </p>
                  <p className="text-xs mt-3 text-right text-[var(--color-dust)] uppercase tracking-[0.05em]">
                    — {msg.guest_name || 'Anonymous'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
