import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { OneWord } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';

const WORD_COLORS = [
  'var(--color-brown)',
  'var(--color-accent-dark)',
  'var(--color-brown-light)',
  'var(--color-accent)',
  '#8b6f47',
  '#a07850',
];

const WORD_SIZES = ['text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'];

function WordCloud({ words }: { words: OneWord[] }) {
  if (words.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Be the first to add a word...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[300px] flex flex-wrap items-center justify-center gap-4 px-4 py-8">
      {words.map((word, i) => {
        const size = WORD_SIZES[Math.min(Math.floor(Math.random() * WORD_SIZES.length), WORD_SIZES.length - 1)];
        const color = WORD_COLORS[i % WORD_COLORS.length];
        const rotation = -8 + Math.random() * 16;
        const driftX = -10 + Math.random() * 20;
        const driftY = -10 + Math.random() * 20;

        return (
          <motion.div
            key={word.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.5, type: 'spring', stiffness: 200 }}
            className={`${size} font-medium cursor-default select-none`}
            style={{
              fontFamily: 'var(--font-display)',
              color,
              transform: `rotate(${rotation}deg)`,
              animation: `wordDrift ${6 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              ['--drift-x' as string]: `${driftX}px`,
              ['--drift-y' as string]: `${driftY}px`,
              ['--word-rotate' as string]: `${rotation}deg`,
            }}
            title={`— ${word.guest_name || 'Anonymous'}`}
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
    if (isSupabaseConfigured() && !isLocked) {
      const { data } = await supabase
        .from('one_word')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setWords(data as unknown as OneWord[]);
    }
  }, [isLocked]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

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
        await supabase.from('one_word').insert([{
          guest_name: guestName,
          word: inputWord.trim(),
        }]);
      } else {
        // Local-only mode
        setWords(prev => [...prev, {
          id: crypto.randomUUID(),
          guest_name: guestName || 'Anonymous',
          word: inputWord.trim(),
          created_at: new Date().toISOString(),
        }]);
      }
      setInputWord('');
      setHasSubmitted(true);
    } catch (err) {
      console.error('Error submitting word:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
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
            Ek Shabd.
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            If you had to describe her in one word, what would it be?
          </p>
        </motion.div>

        {/* Word Cloud (Only visible after unlock) */}
        {!isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="rounded-2xl p-4 mb-8"
            style={{
              background: 'var(--color-cream)',
              border: '1px solid rgba(93, 64, 55, 0.06)',
              minHeight: '250px',
            }}
          >
            <WordCloud words={words} />
          </motion.div>
        )}

        {/* Input */}
        <AnimatePresence mode="wait">
          {hasSubmitted ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 rounded-2xl"
              style={{
                background: 'var(--color-cream)',
                border: '1px solid rgba(93, 64, 55, 0.08)',
              }}
            >
              <span className="text-3xl block mb-2">✨</span>
              <h3 className="text-lg font-medium mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}>
                Added to Birthday Capsule
              </h3>
              <p className="text-xs max-w-xs mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Your contribution has been safely stored and will be revealed on July 5.
              </p>
              <button
                onClick={() => setHasSubmitted(false)}
                className="text-xs underline cursor-pointer"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Add another word
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              className="flex gap-3"
            >
              <input
                type="text"
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value)}
                placeholder="One word..."
                maxLength={30}
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--color-cream)',
                  color: 'var(--color-text)',
                  border: '1px solid rgba(93, 64, 55, 0.08)',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!inputWord.trim() || isSubmitting}
                className="px-6 py-3 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--color-brown)',
                  color: 'var(--color-cream)',
                }}
              >
                {isSubmitting ? '...' : 'Add'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
