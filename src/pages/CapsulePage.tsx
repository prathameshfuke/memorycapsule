import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { isCapsuleUnlocked, isFutureLettersUnlocked, CAPSULE_UNLOCK } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Message, OneWord, Photo } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';
import Countdown from '../components/shared/Countdown';

// Import local photos for the blurred collage background
import babyImg from '../assets/baby.png';
import angydonImg from '../assets/angydon.png';
import kidImg from '../assets/kid.png';
import landerImg from '../assets/lander.png';
import presentImg from '../assets/present.png';
import latestImg from '../assets/latest.png';

export default function CapsulePage() {
  const { isLocked } = useBirthdayLock();
  const [messages, setMessages] = useState<Message[]>([]);
  const [words, setWords] = useState<OneWord[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [futureLetters, setFutureLetters] = useState<Message[]>([]);
  const [stats, setStats] = useState({ notes: 0, words: 0, photos: 0, videos: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [revealStep, setRevealStep] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        const [msgRes, wordRes, photoRes, videoRes] = await Promise.all([
          supabase.from('messages').select('*', { count: 'exact', head: true }),
          supabase.from('one_word').select('*', { count: 'exact', head: true }),
          supabase.from('photos').select('*', { count: 'exact', head: true }).eq('type', 'photo'),
          supabase.from('photos').select('*', { count: 'exact', head: true }).eq('type', 'video'),
        ]);
        setStats({
          notes: msgRes.count || 0,
          words: wordRes.count || 0,
          photos: photoRes.count || 0,
          videos: videoRes.count || 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    const mode = localStorage.getItem('mode');
    const unlocked = isCapsuleUnlocked();
    const futureUnlocked = isFutureLettersUnlocked();

    // Query gate: if not admin and locked, DO NOT query at all
    if (mode !== 'admin' && !unlocked) {
      return;
    }

    if (!isSupabaseConfigured()) return;

    const queries: Promise<any>[] = [
      supabase.from('messages').select('*').order('created_at'),
      supabase.from('one_word').select('*').order('created_at'),
      supabase.from('photos').select('*').order('created_at', { ascending: false }).limit(12),
    ];

    const showFuture = mode === 'admin' || futureUnlocked;
    if (showFuture) {
      queries.push(supabase.from('future_letters').select('*').order('created_at'));
    }

    try {
      const results = await Promise.all(queries);

      if (results[0]?.data) setMessages(results[0].data as unknown as Message[]);
      if (results[1]?.data) setWords(results[1].data as unknown as OneWord[]);
      if (results[2]?.data) setPhotos(results[2].data as Photo[]);
      if (showFuture && results[3]?.data) {
        setFutureLetters(results[3].data as unknown as Message[]);
      }
    } catch (err) {
      console.error('Failed to fetch capsule data:', err);
    }
  }, []);

  useEffect(() => {
    if (isLocked) {
      fetchStats();
    } else {
      fetchAll();
      // Staggered reveal animations
      const steps = [1, 2, 3, 4];
      steps.forEach((step, i) => {
        setTimeout(() => setRevealStep(step), 800 + i * 600);
      });
    }
  }, [isLocked, fetchStats, fetchAll]);

  return (
    <PageWrapper className={isLocked ? "" : "bg-[#FAF7F2]"}>
      <div className="film-grain pointer-events-none fixed inset-0 z-40" />

      {isLocked ? (
        /* ─── Locked State (cohesive blurred illustrations & frosted card) ─── */
        <div className="relative min-h-[100dvh] w-full bg-[#1A1614] overflow-hidden flex items-center justify-center select-none">
          <div className="absolute inset-0 z-10 grid grid-cols-3 gap-2 p-2 opacity-30 scale-110 pointer-events-none animate-blur-breathe">
            <img src={babyImg} alt="Collage 1" className="w-full h-full object-cover sepia brightness-50" />
            <img src={angydonImg} alt="Collage 2" className="w-full h-full object-cover sepia brightness-50" />
            <img src={kidImg} alt="Collage 3" className="w-full h-full object-cover sepia brightness-50" />
            <img src={landerImg} alt="Collage 4" className="w-full h-full object-cover sepia brightness-50" />
            <img src={presentImg} alt="Collage 5" className="w-full h-full object-cover sepia brightness-50" />
            <img src={latestImg} alt="Collage 6" className="w-full h-full object-cover sepia brightness-50" />
          </div>

          <div className="ink-vignette absolute inset-0 z-20" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-30 w-full max-w-md mx-6 p-8 rounded-[4px] border border-[#FAF7F2]/10 flex flex-col items-center text-center text-[#FAF7F2]"
            style={{
              background: 'rgba(26, 22, 20, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-[#FAF7F2]/50 font-medium mb-1">
              Birthday Capsule
            </span>
            <h1 className="text-3xl font-light text-[#FAF7F2] font-[family-name:var(--font-display)] mb-8">
              sealed until the morning
            </h1>

            <div className="w-full grid grid-cols-2 gap-4 mb-8 text-left">
              {[
                { label: 'notes collected', count: stats.notes },
                { label: 'words submitted', count: stats.words },
                { label: 'photos shared', count: stats.photos },
                { label: 'videos recorded', count: stats.videos },
              ].map((item, idx) => (
                <div key={idx} className="border-l border-[#FAF7F2]/20 pl-4 py-1">
                  <span className="block text-[10px] uppercase tracking-[0.1em] text-[#FAF7F2]/40">
                    {item.label}
                  </span>
                  <span className="text-2xl font-light font-[family-name:var(--font-display)] text-[#C9897A] tabular-nums">
                    {isLoadingStats ? '...' : item.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-6 scale-90 text-[#FAF7F2]">
              <Countdown />
            </div>

            <p className="text-lg italic text-[#C9897A] font-[family-name:var(--font-display)] font-light">
              Locked until July 5
            </p>
          </motion.div>
        </div>
      ) : (
        /* ─── Unlocked State ─── */
        <div className="px-6 pt-24 pb-12 max-w-[860px] mx-auto space-y-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
              July 5 reveal
            </span>
            <h1
              className="text-4xl md:text-5xl font-light leading-tight text-[var(--color-ink)] font-[family-name:var(--font-display)]"
            >
              happy birthday, kashish
            </h1>
            <p className="text-sm text-[var(--color-dust)] max-w-sm mx-auto">
              your digital memory capsule is officially open.
            </p>
          </motion.div>

          {/* Messages Section */}
          {revealStep >= 1 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-medium border-b border-[var(--color-dust)]/10 pb-2 uppercase tracking-[0.1em] text-[var(--color-ink)] text-xs">
                💌 notes for you
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)]"
                    style={{
                      transform: `rotate(${-1 + Math.random() * 2}deg)`,
                    }}
                  >
                    <p
                      className="text-base leading-relaxed text-[var(--color-ink)] italic font-[family-name:var(--font-display)] font-light"
                    >
                      "{msg.message}"
                    </p>
                    <p className="text-xs mt-3 text-right text-[var(--color-dust)] uppercase tracking-[0.05em]">
                      — {msg.guest_name || 'anonymous'}
                    </p>
                  </motion.div>
                ))}
                {messages.length === 0 && (
                  <p className="text-sm text-[var(--color-dust)] italic">No notes written yet.</p>
                )}
              </div>
            </motion.section>
          )}

          {/* Words Section */}
          {revealStep >= 2 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-medium border-b border-[var(--color-dust)]/10 pb-2 uppercase tracking-[0.1em] text-[var(--color-ink)] text-xs">
                💬 in their words
              </h2>
              <div
                className="flex flex-wrap items-center justify-center gap-4 p-8 rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)]"
              >
                {words.map((word, i) => (
                  <motion.span
                    key={word.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-lg md:text-xl font-light font-[family-name:var(--font-display)] px-3 py-1 cursor-default select-none"
                    style={{
                      color: ['var(--color-ink)', 'var(--color-blush)', 'var(--color-sepia)'][i % 3],
                    }}
                    title={`— ${word.guest_name || 'anonymous'}`}
                  >
                    {word.word}
                  </motion.span>
                ))}
                {words.length === 0 && (
                  <p className="text-sm text-[var(--color-dust)] italic">No words added yet.</p>
                )}
              </div>
            </motion.section>
          )}

          {/* Photos Section */}
          {revealStep >= 3 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-medium border-b border-[var(--color-dust)]/10 pb-2 uppercase tracking-[0.1em] text-[var(--color-ink)] text-xs">
                📸 shared memories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="polaroid"
                    style={{
                      transform: `rotate(${-2 + Math.random() * 4}deg)`,
                    }}
                  >
                    {photo.type === 'video' ? (
                      <video
                        src={photo.photo_url}
                        controls
                        playsInline
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <img
                        src={photo.photo_url}
                        alt="Shared Memory"
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                      />
                    )}
                    <span className="polaroid-caption text-[10px] text-center block pt-1.5 text-[var(--color-dust)]">
                      {photo.guest_name || 'guest'}
                    </span>
                  </motion.div>
                ))}
                {photos.length === 0 && (
                  <p className="text-sm text-[var(--color-dust)] italic col-span-full">No shared memories uploaded yet.</p>
                )}
              </div>
            </motion.section>
          )}

          {/* Future Letters Section */}
          {revealStep >= 4 && (futureLetters.length > 0 || isFutureLettersUnlocked() || localStorage.getItem('mode') === 'admin') && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-medium border-b border-[var(--color-dust)]/10 pb-2 uppercase tracking-[0.1em] text-[var(--color-ink)] text-xs">
                ✉️ future letters (to open on July 5, 2027)
              </h2>
              {isFutureLettersUnlocked() || localStorage.getItem('mode') === 'admin' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {futureLetters.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)]"
                      style={{
                        transform: `rotate(${-1 + Math.random() * 2}deg)`,
                      }}
                    >
                      <p
                        className="text-base leading-relaxed text-[var(--color-ink)] italic font-[family-name:var(--font-display)] font-light"
                      >
                        "{msg.message}"
                      </p>
                      <p className="text-xs mt-3 text-right text-[var(--color-dust)] uppercase tracking-[0.05em]">
                        — {msg.guest_name || 'anonymous'}
                      </p>
                    </motion.div>
                  ))}
                  {futureLetters.length === 0 && (
                    <p className="text-sm text-[var(--color-dust)] italic">No letters for next year written yet.</p>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)] text-center space-y-2">
                  <p className="text-base font-light italic font-[family-name:var(--font-display)] text-[var(--color-ink)]">
                    There are letters sealed for your future self. They are set to unlock next year on July 5, 2027.
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-dust)]">
                    locked in future vault
                  </p>
                </div>
              )}
            </motion.section>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
