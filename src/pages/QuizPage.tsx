import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { QUIZ_QUESTIONS } from '../lib/constants';
import type { QuizScore } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';
import Confetti from '../components/shared/Confetti';

export default function QuizPage() {
  const { guestName, isRegistered, setShowRegistration } = useGuest();
  const { isLocked } = useBirthdayLock();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [leaderboard, setLeaderboard] = useState<QuizScore[]>([]);
  const [started, setStarted] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    if (isSupabaseConfigured() && !isLocked) {
      const { data } = await supabase
        .from('quiz_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
      if (data) setLeaderboard(data as QuizScore[]);
    }
  }, [isLocked]);

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
        if (finalScore >= QUIZ_QUESTIONS.length * 0.7) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }
        // Save score
        if (isRegistered) {
          if (isSupabaseConfigured()) {
            supabase.from('quiz_scores').insert([{
              guest_name: guestName,
              score: finalScore,
              total: QUIZ_QUESTIONS.length,
            }]).then(() => fetchLeaderboard());
          } else {
            // Local-only mode leaderboard append
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
    <PageWrapper>
      {showConfetti && <Confetti />}

      <div className="px-6 pt-16 pb-8 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <span className="text-5xl block mb-4">🧠</span>
              <h1
                className="text-3xl md:text-4xl mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
              >
                Who Knows Her Best?
              </h1>
              <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
                {QUIZ_QUESTIONS.length} questions. Let's see how well you really know her.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="px-8 py-3.5 rounded-xl text-sm font-medium cursor-pointer"
                style={{
                  background: 'var(--color-brown)',
                  color: 'var(--color-cream)',
                  boxShadow: '0 4px 16px rgba(93, 64, 55, 0.15)',
                }}
              >
                Start Quiz ✨
              </motion.button>

              {/* Leaderboard (Only visible after unlock) */}
              {!isLocked && leaderboard.length > 0 && (
                <div className="mt-12">
                  <h3
                    className="text-lg mb-4"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
                  >
                    🏆 Leaderboard
                  </h3>
                  <div className="space-y-2">
                    {leaderboard.map((entry, i) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: i === 0 ? 'rgba(212, 163, 115, 0.1)' : 'var(--color-cream)' }}
                      >
                        <span className="text-lg w-8 text-center">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                        </span>
                        <span className="flex-1 text-sm font-medium" style={{ color: 'var(--color-brown)' }}>
                          {entry.guest_name || 'Anonymous'}
                        </span>
                        <span className="text-sm tabular-nums" style={{ color: 'var(--color-accent-dark)' }}>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <span className="text-5xl block mb-4">
                {score >= QUIZ_QUESTIONS.length * 0.8 ? '🎉' : score >= QUIZ_QUESTIONS.length * 0.5 ? '👏' : '😅'}
              </span>
              <h2
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
              >
                {score >= QUIZ_QUESTIONS.length * 0.8
                  ? 'You really know her!'
                  : score >= QUIZ_QUESTIONS.length * 0.5
                  ? 'Not bad at all!'
                  : 'Room for improvement 😄'}
              </h2>
              <p className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-dark)' }}>
                {score}/{QUIZ_QUESTIONS.length}
              </p>
              <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
                correct answers
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setCurrentQ(0);
                    setScore(0);
                    setAnswered(null);
                    setIsFinished(false);
                    setStarted(false);
                  }}
                  className="flex-1 py-3 rounded-xl text-sm cursor-pointer"
                  style={{ background: 'var(--color-cream)', color: 'var(--color-brown)' }}
                >
                  Play Again
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              {/* Progress */}
              <div className="flex items-center gap-2 mb-8">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-cream)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--color-accent)' }}
                    initial={{ width: `${(currentQ / QUIZ_QUESTIONS.length) * 100}%` }}
                    animate={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                  {currentQ + 1}/{QUIZ_QUESTIONS.length}
                </span>
              </div>

              {/* Question */}
              <h2
                className="text-xl mb-6"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
              >
                {question.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((option, i) => {
                  const isSelected = answered === i;
                  const isCorrect = i === question.answer;
                  const showResult = answered !== null;

                  let bg = 'var(--color-cream)';
                  let border = '1px solid rgba(93, 64, 55, 0.08)';
                  if (showResult && isCorrect) {
                    bg = 'rgba(107, 143, 113, 0.12)';
                    border = '1px solid rgba(107, 143, 113, 0.3)';
                  } else if (showResult && isSelected && !isCorrect) {
                    bg = 'rgba(192, 57, 43, 0.08)';
                    border = '1px solid rgba(192, 57, 43, 0.2)';
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={answered === null ? { scale: 1.02 } : {}}
                      whileTap={answered === null ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(i)}
                      disabled={answered !== null}
                      className="w-full p-4 rounded-xl text-left text-sm transition-all cursor-pointer disabled:cursor-default"
                      style={{ background: bg, border }}
                    >
                      {option}
                      {showResult && isCorrect && <span className="float-right">✓</span>}
                      {showResult && isSelected && !isCorrect && <span className="float-right">✗</span>}
                    </motion.button>
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
