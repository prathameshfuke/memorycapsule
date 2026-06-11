import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { isCapsuleUnlocked } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { OneWord } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';

function WordCloud({ words }: { words: OneWord[] }) {
  if (words.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)]">
          Be the first to add a word
        </p>
      </div>
    );
  }

  const wordColors = [
    'var(--color-ink)',
    'var(--color-blush)',
    'var(--color-sepia)',
    'var(--color-dust)',
  ];

  const wordSizes = ['text-lg', 'text-xl', 'text-2xl', 'text-3xl'];

  return (
    <div className="relative min-h-[300px] flex flex-wrap items-center justify-center gap-4 px-4 py-8">
      {words.map((word, i) => {
        const size = wordSizes[i % wordSizes.length];
        const color = wordColors[i % wordColors.length];
        const rotation = -8 + (i * 7) % 16;
        const driftX = -10 + (i * 3) % 20;
        const driftY = -10 + (i * 4) % 20;

        return (
          <motion.div
            key={word.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`${size} font-light cursor-default select-none`}
            style={{
              fontFamily: 'var(--font-display)',
              color,
              transform: `rotate(${rotation}deg)`,
              animation: `wordDrift ${6 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i % 3) * 0.5}s`,
              ['--drift-x' as string]: `${driftX}px`,
              ['--drift-y' as string]: `${driftY}px`,
              ['--word-rotate' as string]: `${rotation}deg`,
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

    // Query gate: if not admin and locked, DO NOT query
    if (mode !== 'admin' && !unlocked) {
      return;
    }

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

  if (mode === 'birthday_girl') {
    if (isLocked) {
      return (
        <PageWrapper className="bg-[#1A1614]">
          <div className="film-grain pointer-events-none fixed inset-0 z-40" />
          <div className="ink-vignette absolute inset-0 z-10 pointer-events-none" />
          <div className="relative z-20 px-6 pt-24 pb-12 max-w-md mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center space-y-6 text-[#FAF7F2]">
            <h1 className="text-3xl font-light font-[family-name:var(--font-display)] text-[#FAF7F2]">
              sealed words
            </h1>
            <p className="text-sm text-[var(--color-dust)] font-[family-name:var(--font-body)] leading-relaxed">
              A cloud of words is forming for you. You'll see how everyone describes you on your birthday.
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-blush)] font-medium">
              Locked until July 5
            </p>
          </div>
        </PageWrapper>
      );
    } else {
      return (
        <PageWrapper className="bg-[#FAF7F2]">
          <div className="film-grain pointer-events-none fixed inset-0 z-40" />
          <div className="px-6 pt-24 pb-12 max-w-[860px] mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
                Revealed
              </span>
              <h1 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
                in their words
              </h1>
            </div>
            
            <div className="rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)] pt-8">
              <WordCloud words={words} />
            </div>
          </div>
        </PageWrapper>
      );
    }
  }

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
        // Local fallback
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
    <PageWrapper className="relative min-h-[100dvh] flex flex-col justify-between bg-[#1A1614] overflow-hidden">
      {/* Film grain */}
      <div className="film-grain pointer-events-none fixed inset-0 z-40" />

      {/* Dark Vignette Overlay */}
      <div className="ink-vignette absolute inset-0 z-10 pointer-events-none" />

      <div className="relative z-20 flex-1 flex flex-col justify-center px-6 max-w-[860px] mx-auto w-full">
        <AnimatePresence mode="wait">
          {hasSubmitted ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 flex flex-col items-center justify-center flex-1"
            >
              <h1 className="text-3xl font-light font-[family-name:var(--font-display)] text-[#FAF7F2]">
                added to capsule
              </h1>
              <p className="text-sm text-[var(--color-dust)] max-w-xs">
                Your word has been stored in the birthday capsule.
              </p>
              <button
                onClick={() => setHasSubmitted(false)}
                className="text-xs uppercase tracking-[0.2em] underline text-[var(--color-dust)] hover:text-[#FAF7F2] cursor-pointer mt-4"
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
              className="flex-1 flex flex-col justify-center"
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
                  className="w-full bg-transparent text-center border-none outline-none caret-[var(--color-blush)]"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2.5rem, 8vw, 6.5rem)',
                    color: 'var(--color-blush)',
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

      {/* Word Cloud display at the bottom (Only visible after unlock, rendered in light context) */}
      {!isLocked && words.length > 0 && (
        <div className="relative z-20 bg-[#FAF7F2] border-t border-[var(--color-dust)]/10 py-12 px-6">
          <div className="max-w-[860px] mx-auto space-y-6">
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-dust)] text-center">
              Word Cloud
            </h2>
            <div className="rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)]">
              <WordCloud words={words} />
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
