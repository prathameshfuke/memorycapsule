import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { isCapsuleUnlocked } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { OneWord } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';

/* ─── Word Cloud Component (reusable for CapsulePage) ─── */
export function WordCloud({ words }: { words: OneWord[] }) {
  if (words.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)]">
          Be the first to add a word
        </p>
      </div>
    );
  }

  const wordColors = [
    'var(--color-ink)',
    'var(--color-red)',
    'var(--color-charcoal)',
  ];

  // Count duplicates for size weighting
  const wordCounts: Record<string, number> = {};
  words.forEach(w => {
    const key = w.word.toLowerCase();
    wordCounts[key] = (wordCounts[key] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(wordCounts));

  const getSizeClass = (word: string) => {
    const count = wordCounts[word.toLowerCase()] || 1;
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'text-3xl md:text-4xl';
    if (ratio > 0.4) return 'text-2xl md:text-3xl';
    if (ratio > 0.2) return 'text-xl md:text-2xl';
    return 'text-lg md:text-xl';
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="relative flex flex-wrap items-center justify-center gap-4 md:gap-6 px-4 py-8 min-h-[280px]">
      {words.map((word, i) => {
        const size = getSizeClass(word.word);
        const color = wordColors[i % wordColors.length];
        const driftX = -8 + (i * 3) % 16;
        const driftY = -8 + (i * 4) % 16;

        return (
          <motion.div
            key={word.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`${size} font-light cursor-default select-none px-2 py-1`}
            style={{
              fontFamily: 'var(--font-display)',
              color,
              animation: prefersReducedMotion ? 'none' : `wordDrift ${6 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i % 5) * 0.4}s`,
              ['--drift-x' as string]: `${driftX}px`,
              ['--drift-y' as string]: `${driftY}px`,
              ['--word-rotate' as string]: `0deg`,
            }}
            title={`— ${word.guest_name || 'anonymous'}`}
          >
            {word.word}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function OneWordPage() {
  const { guestName, isRegistered, setShowRegistration } = useGuest();
  const { isLocked } = useBirthdayLock();
  const [words, setWords] = useState<OneWord[]>([]);
  const [inputWord, setInputWord] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fetchWords = useCallback(async () => {
    const mode = localStorage.getItem('mode');
    const unlocked = isCapsuleUnlocked();
    if (mode !== 'admin' && !unlocked) return;
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('one_word')
          .select('*')
          .order('created_at', { ascending: true });
        if (data) setWords(data as unknown as OneWord[]);
      } catch (err) {
        console.error('Failed to fetch words:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const mode = localStorage.getItem('mode');

  /* ─── Birthday Girl View ─── */
  if (mode === 'birthday_girl') {
    if (isLocked) {
      return (
        <PageWrapper className="bg-[var(--color-ink)]">
          <div className="ink-vignette absolute inset-0 z-10 pointer-events-none" />
          <div className="sealed-state sealed-state-dark relative z-20 text-[var(--color-cream)]">
            <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)]">
              Sealed
            </span>
            <h1 className="text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-cream)]">
              sealed words
            </h1>
            <p className="text-sm text-[var(--color-dust)] font-[family-name:var(--font-body)] leading-relaxed">
              A cloud of words is forming for you. You'll see how everyone describes you on your birthday.
            </p>
            <p className="text-sm uppercase tracking-[0.2em] font-bold text-red mt-2">
              Locked until July 5
            </p>
          </div>
        </PageWrapper>
      );
    } else {
      return (
        /* ─── Unlocked State (Admin / Birthday Girl) ─── */
        <PageWrapper className="bg-[var(--color-parchment)]">
          <div className="page-container">
            <div className="text-center mb-16">
              <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
                Revealed
              </span>
              <h1 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
                in their words
              </h1>
            </div>
            <div className="rounded-[4px] border border-blush bg-paper">
              <WordCloud words={words} />
            </div>
          </div>
        </PageWrapper>
      );
    }
  }

  /* ─── Guest/Admin: Input Mode ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWord.trim()) return;
    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }
    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('one_word').insert([{
          guest_name: guestName,
          word: inputWord.trim(),
        }]);
        if (error) throw error;
      } else {
        setWords(prev => [...prev, {
          id: crypto.randomUUID(),
          guest_name: guestName || 'Anonymous',
          word: inputWord.trim(),
          created_at: new Date().toISOString(),
        }]);
      }
      setInputWord('');
      setHasSubmitted(true);
      fetchWords();
    } catch (err) {
      console.error('Error submitting word:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="relative bg-[var(--color-ink)] overflow-hidden">
      {/* Vignette */}
      <div className="ink-vignette absolute inset-0 z-10 pointer-events-none" />

      {/* Centered input — calc height to account for nav */}
      <div
        className="relative z-20 flex flex-col justify-center page-container min-h-[calc(100dvh-80px)]"
      >
        <AnimatePresence mode="wait">
          {hasSubmitted ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 flex flex-col items-center justify-center"
            >
              <h1 className="text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-cream)]">
                added to capsule
              </h1>
              <p className="text-sm text-[var(--color-dust)] max-w-xs">
                Your word has been stored in the birthday capsule.
              </p>
              <button
                onClick={() => setHasSubmitted(false)}
                className="text-xs uppercase tracking-[0.2em] underline text-[var(--color-dust)] hover:text-[var(--color-cream)] cursor-pointer mt-4"
              >
                add another word
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <form onSubmit={handleSubmit} className="text-center w-full flex flex-col items-center justify-center">
                <input
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  placeholder={isSubmitting ? "adding..." : "one word"}
                  maxLength={20}
                  autoFocus
                  autoComplete="off"
                  className="w-full bg-transparent text-center border-none outline-none caret-red"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2.5rem, 8vw, 6.5rem)',
                    color: 'var(--color-red)',
                    letterSpacing: '0.02em',
                  }}
                />
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-dust)] mt-8">
                  press enter to save
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Word Cloud display (after unlock) */}
      {!isLocked && words.length > 0 && (
        <div className="relative z-20 bg-[var(--color-parchment)] border-t border-[var(--color-dust)]/10 py-16 px-6 md:px-8">
        <div className="page-container">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] text-center mb-8">
              Word Cloud
            </h2>
            <div className="rounded-[4px] border border-blush bg-paper">
              <WordCloud words={words} />
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
