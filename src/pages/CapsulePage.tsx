import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Message, OneWord, Photo } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';
import Countdown from '../components/shared/Countdown';
import Confetti from '../components/shared/Confetti';

export default function CapsulePage() {
  const { isLocked } = useBirthdayLock();
  const [messages, setMessages] = useState<Message[]>([]);
  const [words, setWords] = useState<OneWord[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealStep, setRevealStep] = useState(0);

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    const [msgRes, wordRes, photoRes] = await Promise.all([
      supabase.from('messages').select('*').order('created_at'),
      supabase.from('one_word').select('*').order('created_at'),
      supabase.from('photos').select('*').order('created_at', { ascending: false }).limit(12),
    ]);

    if (msgRes.data) setMessages(msgRes.data as unknown as Message[]);
    if (wordRes.data) setWords(wordRes.data as unknown as OneWord[]);
    if (photoRes.data) setPhotos(photoRes.data as Photo[]);
  }, []);

  useEffect(() => {
    if (!isLocked) {
      fetchAll();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      // Reveal animation steps
      const steps = [1, 2, 3];
      steps.forEach((step, i) => {
        setTimeout(() => setRevealStep(step), 1000 + i * 800);
      });
    }
  }, [isLocked, fetchAll]);

  return (
    <PageWrapper>
      {showConfetti && <Confetti duration={5000} />}

      <div className="px-6 pt-16 pb-8 max-w-lg mx-auto">
        {isLocked ? (
          /* ─── Locked State ─── */
          <div className="text-center min-h-[60vh] flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1
                className="text-3xl md:text-4xl mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
              >
                Ek Chhota Sa Surprise.
              </h1>
              <p className="text-sm mb-10" style={{ color: 'var(--color-text-muted)' }}>
                Some things are worth waiting for.
              </p>
            </motion.div>

            {/* Animated lock */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative mb-10"
            >
              <div className="keyhole-glow">
                <div
                  className="w-32 h-32 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'var(--color-cream)',
                    border: '2px solid rgba(212, 163, 115, 0.2)',
                    boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)',
                  }}
                >
                  <span className="text-5xl">🔒</span>
                </div>
              </div>
              {/* Decorative ring */}
              <div
                className="absolute inset-[-12px] rounded-3xl border border-dashed pointer-events-none"
                style={{ borderColor: 'rgba(212, 163, 115, 0.15)' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs mb-6 uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                Unlocks on July 5th
              </p>
              <Countdown />
            </motion.div>
          </div>
        ) : (
          /* ─── Unlocked State ─── */
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <span className="text-5xl block mb-4">🎉</span>
              <h1
                className="text-3xl md:text-4xl mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
              >
                Happy Birthday!
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Your capsule has been opened.
              </p>
            </motion.div>

            {/* Messages Section */}
            {revealStep >= 1 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <h2
                  className="text-xl mb-4 text-center"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
                >
                  💌 Messages For You
                </h2>
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'var(--color-cream)',
                        transform: `rotate(${-1 + Math.random() * 2}deg)`,
                      }}
                    >
                      <p
                        className="text-base leading-relaxed"
                        style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--color-brown)' }}
                      >
                        "{msg.message}"
                      </p>
                      <p className="text-xs mt-2 text-right" style={{ color: 'var(--color-text-muted)' }}>
                        — {msg.guest_name || 'Anonymous'}
                      </p>
                    </motion.div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      No messages yet.
                    </p>
                  )}
                </div>
              </motion.section>
            )}

            {/* Words Section */}
            {revealStep >= 2 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <h2
                  className="text-xl mb-4 text-center"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
                >
                  💬 In Their Words
                </h2>
                <div
                  className="flex flex-wrap items-center justify-center gap-3 p-6 rounded-2xl"
                  style={{ background: 'var(--color-cream)' }}
                >
                  {words.map((word, i) => (
                    <motion.span
                      key={word.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                      className="text-lg md:text-xl font-medium px-3 py-1"
                      style={{
                        fontFamily: 'var(--font-display)',
                        color: ['var(--color-brown)', 'var(--color-accent-dark)', 'var(--color-brown-light)'][i % 3],
                      }}
                    >
                      {word.word}
                    </motion.span>
                  ))}
                  {words.length === 0 && (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No words yet.</p>
                  )}
                </div>
              </motion.section>
            )}

            {/* Photos Section */}
            {revealStep >= 3 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2
                  className="text-xl mb-4 text-center"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
                >
                  📸 Shared Memories
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo, i) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, rotate: -5 + Math.random() * 10 }}
                      animate={{ opacity: 1, rotate: -3 + Math.random() * 6 }}
                      transition={{ delay: i * 0.08 }}
                      className="polaroid"
                    >
                      <img
                        src={photo.photo_url}
                        alt="Memory"
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>
                {photos.length === 0 && (
                  <p className="text-center text-sm mt-4" style={{ color: 'var(--color-text-muted)' }}>
                    No photos yet.
                  </p>
                )}
              </motion.section>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
