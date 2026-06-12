import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { isCapsuleUnlocked, isFutureLettersUnlocked, CAPSULE_UNLOCK } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Message, OneWord, Photo, GuestbookEntry } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/shared/Card';
import Countdown from '../components/shared/Countdown';
import { WordCloud } from './OneWordPage';
import { MediaGallery } from './CameraPage';
import { GuestbookEntries } from './GuestbookPage';

// Import local photos for locked collage
import babyImg from '../assets/baby.png';
import angydonImg from '../assets/angydon.png';
import kidImg from '../assets/kid.png';
import landerImg from '../assets/lander.png';
import presentImg from '../assets/present.png';
import latestImg from '../assets/latest.png';

/* ─── Section Divider ─── */
function SectionDivider({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center py-4">
      <div className="w-[40%] h-px bg-[var(--color-dust)]/20 mx-auto mb-6" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-dust)]">
        {number} — {label}
      </span>
    </div>
  );
}

export default function CapsulePage() {
  const { isLocked } = useBirthdayLock();
  const [messages, setMessages] = useState<Message[]>([]);
  const [words, setWords] = useState<OneWord[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [futureLetters, setFutureLetters] = useState<Message[]>([]);
  const [stats, setStats] = useState({ notes: 0, words: 0, photos: 0, videos: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

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
    if (mode !== 'admin' && !unlocked) return;
    if (!isSupabaseConfigured()) return;

    const queries: Promise<any>[] = [
      supabase.from('messages').select('*').order('created_at'),
      supabase.from('one_word').select('*').order('created_at'),
      supabase.from('photos').select('*').order('created_at', { ascending: false }),
      supabase.from('guestbook').select('*').order('created_at'),
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
      if (results[3]?.data) setGuestbook(results[3].data as unknown as GuestbookEntry[]);
      if (showFuture && results[4]?.data) {
        setFutureLetters(results[4].data as unknown as Message[]);
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
      // Show celebration on first visit after unlock
      const hasSeenCelebration = sessionStorage.getItem('capsule_celebrated');
      if (!hasSeenCelebration) {
        setShowCelebration(true);
        sessionStorage.setItem('capsule_celebrated', 'true');
        setTimeout(() => setShowCelebration(false), 4000);
      }
    }
  }, [isLocked, fetchStats, fetchAll]);

  const totalMemories = messages.length + words.length + photos.length + guestbook.length;

  return (
    <PageWrapper className={isLocked ? '' : 'bg-[var(--color-parchment)]'}>
      {/* Celebration Overlay (first visit after unlock) */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-ink)]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-center"
            >
              <h1
                className="font-[family-name:var(--font-display)] italic font-light text-[var(--color-cream)]"
                style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
              >
                It's time
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mt-4">
                the capsule is open
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLocked ? (
        /* ─── Locked State ─── */
        <div className="relative min-h-[100dvh] w-full bg-[var(--color-ink)] overflow-hidden flex items-center justify-center select-none">
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
            className="relative z-30 w-full max-w-[480px] mx-6 flex flex-col items-center text-center text-[var(--color-cream)]"
            style={{
              background: 'rgba(26, 22, 20, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(250, 247, 242, 0.1)',
              borderRadius: '4px',
              padding: '40px',
            }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-cream)]/50 mb-2">
              Birthday Capsule
            </span>
            <h1 className="text-3xl font-light text-[var(--color-cream)] font-[family-name:var(--font-display)] mb-8">
              sealed until the morning
            </h1>

            <div className="w-full grid grid-cols-2 gap-4 mb-6 text-left">
              {[
                { label: 'notes collected', count: stats.notes },
                { label: 'words submitted', count: stats.words },
                { label: 'photos shared', count: stats.photos },
                { label: 'videos recorded', count: stats.videos },
              ].map((item, idx) => (
                <div key={idx} className="border-l border-[var(--color-cream)]/20 pl-4 py-1">
                  <span className="block text-[10px] uppercase tracking-[0.1em] text-[var(--color-cream)]/40">
                    {item.label}
                  </span>
                  <span className="text-2xl font-light font-[family-name:var(--font-display)] text-[var(--color-crimson)] tabular-nums mt-2 block">
                    {isLoadingStats ? '...' : item.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-6 text-[var(--color-cream)]">
              <Countdown />
            </div>

            <p className="text-lg italic text-[var(--color-crimson)] font-[family-name:var(--font-display)] font-light mt-6">
              Locked until July 5
            </p>
          </motion.div>
        </div>
      ) : (
        /* ─── Unlocked State: Sectioned Reveal ─── */
        <div className="page-container">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
          >
            <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
              The capsule
            </span>
            <h1 className="text-4xl md:text-5xl font-light leading-[1.1] text-[var(--color-ink)] font-[family-name:var(--font-display)]">
              {totalMemories} memories, waiting no longer
            </h1>
            <p className="text-sm text-[var(--color-dust)] max-w-sm mx-auto mt-4">
              your digital memory capsule is officially open.
            </p>
          </motion.div>

          {/* Section 1: Words */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SectionDivider number="01" label="Words" />
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
                in their words
              </h2>
            </div>
            <div className="rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)]">
              <WordCloud words={words} />
            </div>
          </motion.section>

          {/* Section 2: Notes */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-24"
          >
            <SectionDivider number="02" label="Notes" />
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
                notes for you
              </h2>
            </div>
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
            >
              {messages.map((msg) => (
                <Card key={msg.id}>
                  <p className="text-base leading-relaxed text-[var(--color-ink)] italic font-[family-name:var(--font-display)] font-light">
                    "{msg.message}"
                  </p>
                  <p className="text-xs mt-4 text-right text-[var(--color-dust)] uppercase tracking-[0.05em]">
                    — {msg.guest_name || 'anonymous'}
                  </p>
                </Card>
              ))}
              {messages.length === 0 && (
                <p className="text-sm text-[var(--color-dust)] col-span-full text-center">No notes written yet.</p>
              )}
            </div>
          </motion.section>

          {/* Section 3: Photos & Videos */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-24"
          >
            <SectionDivider number="03" label="Photos & Videos" />
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
                shared memories
              </h2>
            </div>
            <MediaGallery photos={photos} />
          </motion.section>

          {/* Section 4: Guestbook */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-24"
          >
            <SectionDivider number="04" label="Guestbook" />
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
                signed by {guestbook.length}
              </h2>
            </div>
            <GuestbookEntries entries={guestbook} />
          </motion.section>

          {/* Section 5: Future Letters */}
          {(futureLetters.length > 0 || isFutureLettersUnlocked() || localStorage.getItem('mode') === 'admin') && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="mt-24"
            >
              <SectionDivider number="05" label="Future Letters" />
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
                  letters for next year
                </h2>
              </div>
              {isFutureLettersUnlocked() || localStorage.getItem('mode') === 'admin' ? (
                <div
                  className="grid gap-6"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
                >
                  {futureLetters.map((msg) => (
                    <Card key={msg.id}>
                      <p className="text-base leading-relaxed text-[var(--color-ink)] italic font-[family-name:var(--font-display)] font-light">
                        "{msg.message}"
                      </p>
                      <p className="text-xs mt-4 text-right text-[var(--color-dust)] uppercase tracking-[0.05em]">
                        — {msg.guest_name || 'anonymous'}
                      </p>
                    </Card>
                  ))}
                  {futureLetters.length === 0 && (
                    <p className="text-sm text-[var(--color-dust)] col-span-full text-center">No letters for next year yet.</p>
                  )}
                </div>
              ) : (
                <Card className="text-center py-16" frosted={false}>
                  <p className="text-base font-light italic font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-4">
                    There are letters sealed for your future self.
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-dust)]">
                    opens July 5, 2027
                  </p>
                </Card>
              )}
            </motion.section>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
