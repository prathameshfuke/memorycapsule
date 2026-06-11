import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { isCapsuleUnlocked } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { QUIZ_QUESTIONS } from '../lib/constants';
import type { QuizScore } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';

export default function QuizPage() {
  const { guestName, isRegistered, setShowRegistration } = useGuest();
  const { isLocked } = useBirthdayLock();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState<QuizScore[]>([]);
  const [started, setStarted] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    const mode = localStorage.getItem('mode');
    const unlocked = isCapsuleUnlocked();

    // Query gate: if not admin and locked, DO NOT query
    if (mode !== 'admin' && !unlocked) {
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('quiz_scores')
          .select('*')
          .order('score', { ascending: false })
          .limit(10);
        if (data) setLeaderboard(data as QuizScore[]);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleAnswer = (optionIndex: number) => {
    if (answered !== null) return;
    setAnswered(optionIndex);

    const isCorrect = optionIndex === QUIZ_QUESTIONS[currentQ].answer;
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (currentQ + 1 < QUIZ_QUESTIONS.length) {
        setCurrentQ(q => q + 1);
        setAnswered(null);
      } else {
        setIsFinished(true);
        const finalScore = isCorrect ? score + 1 : score;
        
        if (isRegistered) {
          if (isSupabaseConfigured()) {
            supabase.from('quiz_scores').insert([{
              guest_name: guestName,
              score: finalScore,
              total: QUIZ_QUESTIONS.length,
            }]).then(() => fetchLeaderboard());
          } else {
            // Local fallback
            setLeaderboard(prev => [...prev, {
              id: crypto.randomUUID(),
              guest_name: guestName || 'Anonymous',
              score: finalScore,
              total: QUIZ_QUESTIONS.length,
              created_at: new Date().toISOString(),
            }].sort((a, b) => b.score - a.score).slice(0, 10));
          }
        }
      }
    }, 1200);
  };

  const handleStart = () => {
    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }
    setStarted(true);
  };

  const question = QUIZ_QUESTIONS[currentQ];

  return (
    <PageWrapper className="bg-[#FAF7F2]">
      <div className="px-6 pt-20 pb-8 max-w-[860px] mx-auto">
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
                  Trivia activity
                </span>
                <h1
                  className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]"
                >
                  who knows her best?
                </h1>
                <p className="text-sm text-[var(--color-dust)] max-w-sm mx-auto">
                  {QUIZ_QUESTIONS.length} questions. Let's see how well you really know her.
                </p>
              </div>

              <button
                onClick={handleStart}
                className="px-8 py-3.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-[4px] text-xs uppercase tracking-[0.2em] font-medium cursor-pointer hover:bg-[var(--color-ink)]/90 transition-colors"
              >
                start quiz
              </button>

              {/* Leaderboard (Only visible after unlock) */}
              {!isLocked && leaderboard.length > 0 && (
                <div className="pt-10 max-w-md mx-auto space-y-4 text-left">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--color-dust)] text-center">
                    Leaderboard
                  </h3>
                  <div className="space-y-2">
                    {leaderboard.map((entry, i) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-4 p-3 rounded-[4px] border border-[var(--color-dust)]/25 bg-[var(--color-cream)]"
                      >
                        <span className="text-xs font-medium text-[var(--color-dust)] w-6 text-center">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm text-[var(--color-ink)] font-[family-name:var(--font-body)]">
                          {entry.guest_name || 'Anonymous'}
                        </span>
                        <span className="text-sm font-light font-[family-name:var(--font-display)] text-[var(--color-sepia)] tabular-nums">
                          {entry.score}/{entry.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : isFinished ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
                  Quiz complete
                </span>
                <h2
                  className="text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]"
                >
                  {score >= QUIZ_QUESTIONS.length * 0.8
                    ? 'You really know her'
                    : score >= QUIZ_QUESTIONS.length * 0.5
                    ? 'Not bad at all'
                    : 'Room for improvement'}
                </h2>
                <p className="text-5xl font-light font-[family-name:var(--font-display)] text-[var(--color-sepia)] pt-4 tabular-nums">
                  {score}/{QUIZ_QUESTIONS.length}
                </p>
                <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-dust)]">
                  correct answers
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <button
                  onClick={() => {
                    setCurrentQ(0);
                    setScore(0);
                    setAnswered(null);
                    setIsFinished(false);
                    setStarted(false);
                  }}
                  className="w-full py-3.5 border border-[var(--color-dust)] text-[var(--color-ink)] rounded-[4px] text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-[var(--color-cream)] transition-colors"
                >
                  play again
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-lg mx-auto"
            >
              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1 rounded-full overflow-hidden bg-[var(--color-cream)] border border-[var(--color-dust)]/20">
                  <motion.div
                    className="h-full bg-[var(--color-blush)]"
                    initial={{ width: `${(currentQ / QUIZ_QUESTIONS.length) * 100}%` }}
                    animate={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs text-[var(--color-dust)] tabular-nums">
                  {currentQ + 1}/{QUIZ_QUESTIONS.length}
                </span>
              </div>

              {/* Question */}
              <h2
                className="text-2xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)] pt-4"
              >
                {question.question}
              </h2>

              {/* Options */}
              <div className="space-y-3 pt-4">
                {question.options.map((option, i) => {
                  const isSelected = answered === i;
                  const isCorrect = i === question.answer;
                  const showResult = answered !== null;

                  let bg = 'var(--color-cream)';
                  let border = '1px solid var(--color-dust)';
                  let color = 'var(--color-ink)';
                  
                  if (showResult && isCorrect) {
                    bg = 'rgba(201, 137, 122, 0.1)';
                    border = '1px solid var(--color-blush)';
                    color = 'var(--color-blush)';
                  } else if (showResult && isSelected && !isCorrect) {
                    bg = 'rgba(26, 22, 20, 0.05)';
                    border = '1px solid var(--color-dust)';
                    color = 'var(--color-dust)';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={answered !== null}
                      className="w-full p-4 rounded-[4px] text-left text-sm transition-colors cursor-pointer disabled:cursor-default"
                      style={{ background: bg, border, color }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showResult && isCorrect && <span className="text-xs uppercase tracking-[0.1em]">correct</span>}
                        {showResult && isSelected && !isCorrect && <span className="text-xs uppercase tracking-[0.1em]">incorrect</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
