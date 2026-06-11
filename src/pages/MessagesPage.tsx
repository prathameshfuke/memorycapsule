import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Message } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';
import Countdown from '../components/shared/Countdown';
import Confetti from '../components/shared/Confetti';

export default function MessagesPage() {
  const { guestName, isRegistered, setShowRegistration } = useGuest();
  const { isLocked } = useBirthdayLock();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setMessages(data as unknown as Message[]);
    }
  }, []);

  useEffect(() => {
    if (!isLocked) fetchMessages();
  }, [isLocked, fetchMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || messageText.trim().length < 10) return;

    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.from('messages').insert([{
          guest_name: guestName,
          message: messageText.trim(),
        }]);
      } else {
        // Local-only fallback
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          guest_name: guestName || 'Anonymous',
          message: messageText.trim(),
          created_at: new Date().toISOString(),
        }]);
      }
      setMessageText('');
      setShowConfetti(true);
      setHasSubmitted(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (err) {
      console.error('Error submitting message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = messageText.trim().length;
  const isValidLength = charCount >= 10 && charCount <= 500;

  return (
    <PageWrapper>
      {showConfetti && <Confetti />}

      <div className="px-6 pt-16 pb-8 max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1
            className="text-3xl md:text-4xl mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
          >
            For Her.
          </h1>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Write something she'll read on her birthday morning.
          </p>
          <p className="text-sm leading-relaxed mt-1" style={{ color: 'var(--color-text-muted)' }}>
            It can be a memory. A thank you. A joke.
          </p>
          <p className="text-sm leading-relaxed mt-1 italic" style={{ color: 'var(--color-brown-light)' }}>
            Or something you've never said before.
          </p>
        </motion.div>

        {/* Input Form (always visible — guests can write even before unlock) */}
        <AnimatePresence mode="wait">
          {hasSubmitted ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 rounded-2xl"
              style={{ background: 'var(--color-cream)' }}
            >
              <span className="text-4xl block mb-3">💌</span>
              <p
                className="text-xl"
                style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--color-brown)' }}
              >
                Your words are safe with us.
              </p>
              <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
                She'll read it on her birthday morning.
              </p>
              <button
                onClick={() => setHasSubmitted(false)}
                className="mt-6 text-xs underline cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Write another message
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="What would you like her to remember forever?"
                  maxLength={500}
                  rows={6}
                  className="w-full px-5 py-4 rounded-2xl text-sm outline-none resize-none leading-relaxed"
                  style={{
                    background: 'var(--color-cream)',
                    color: 'var(--color-text)',
                    border: '1px solid rgba(93, 64, 55, 0.08)',
                    fontFamily: charCount > 0 ? 'var(--font-handwritten)' : 'var(--font-body)',
                    fontSize: charCount > 0 ? '1.05rem' : '0.875rem',
                  }}
                />
                <span
                  className="absolute bottom-3 right-4 text-[10px] tabular-nums"
                  style={{
                    color: charCount > 500 ? 'var(--color-error)' : 'var(--color-text-muted)',
                  }}
                >
                  {charCount}/500
                </span>
              </div>

              {charCount > 0 && charCount < 10 && (
                <p className="text-[11px]" style={{ color: 'var(--color-accent-dark)' }}>
                  Write at least 10 characters...
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!isValidLength || isSubmitting}
                className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--color-brown)',
                  color: 'var(--color-cream)',
                  boxShadow: '0 4px 16px rgba(93, 64, 55, 0.15)',
                }}
              >
                {isSubmitting ? 'Sending...' : 'Seal This Message 💌'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Lock status / Messages display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          {isLocked ? (
            <div className="text-center py-12">
              <div className="keyhole-glow inline-block mb-4">
                <span className="text-5xl">🔒</span>
              </div>
              <h3
                className="text-lg mb-4"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
              >
                Messages are sealed
              </h3>
              <p className="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Opens on her birthday morning
              </p>
              <Countdown />
            </div>
          ) : (
            <div>
              <h3
                className="text-lg mb-6 text-center"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
              >
                Messages Revealed ✨
              </h3>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-2xl"
                    style={{
                      background: 'var(--color-cream)',
                      border: '1px solid rgba(93, 64, 55, 0.06)',
                      transform: `rotate(${-1 + Math.random() * 2}deg)`,
                    }}
                  >
                    <p
                      className="text-base leading-relaxed"
                      style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--color-brown)' }}
                    >
                      "{msg.message}"
                    </p>
                    <p className="text-xs mt-3 text-right" style={{ color: 'var(--color-text-muted)' }}>
                      — {msg.guest_name || 'Anonymous'}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
