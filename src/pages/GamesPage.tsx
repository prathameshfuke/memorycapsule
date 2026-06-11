import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../hooks/useGuest';
import { CHARADES_PROMPTS, NEVER_HAVE_I_EVER, MEET_PROMPTS } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import PageWrapper from '../components/layout/PageWrapper';

/* ─── Dumb Charades ─── */
function DumbCharades({ onBack }: { onBack: () => void }) {
  const categories = Object.keys(CHARADES_PROMPTS);
  const [category, setCategory] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const generatePrompt = (cat: string) => {
    const prompts = CHARADES_PROMPTS[cat];
    const random = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(random);
    setRevealed(false);
    setCategory(cat);
  };

  const nextPrompt = () => {
    if (category) generatePrompt(category);
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm mb-6 cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
        ← Back to Games
      </button>

      <h2 className="text-2xl mb-6 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}>
        🎭 Dumb Charades
      </h2>

      {!prompt ? (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => generatePrompt(cat)}
              className="py-6 rounded-2xl text-sm font-medium cursor-pointer"
              style={{
                background: 'var(--color-cream)',
                color: 'var(--color-brown)',
                border: '1px solid rgba(93, 64, 55, 0.08)',
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {category}
          </p>

          <motion.div
            key={prompt}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 px-6 rounded-2xl mb-6 min-h-[180px] flex items-center justify-center cursor-pointer"
            style={{
              background: revealed ? 'var(--color-cream)' : 'var(--color-brown)',
              border: '1px solid rgba(93, 64, 55, 0.1)',
            }}
            onClick={() => setRevealed(!revealed)}
          >
            {revealed ? (
              <p className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}>
                {prompt}
              </p>
            ) : (
              <div className="text-center">
                <span className="text-4xl block mb-2">🤫</span>
                <p className="text-sm" style={{ color: 'var(--color-cream)' }}>
                  Tap to reveal
                </p>
              </div>
            )}
          </motion.div>

          <div className="flex gap-3">
            <button
              onClick={() => { setPrompt(null); setCategory(null); }}
              className="flex-1 py-3 rounded-xl text-sm cursor-pointer"
              style={{ background: 'var(--color-cream)', color: 'var(--color-text)' }}
            >
              Change Category
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={nextPrompt}
              className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer"
              style={{ background: 'var(--color-brown)', color: 'var(--color-cream)' }}
            >
              Next →
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Never Have I Ever ─── */
function NeverHaveIEverGame({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * NEVER_HAVE_I_EVER.length));

  const next = () => {
    setCurrentIndex(Math.floor(Math.random() * NEVER_HAVE_I_EVER.length));
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm mb-6 cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
        ← Back to Games
      </button>

      <h2 className="text-2xl mb-8 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}>
        🙈 Never Have I Ever
      </h2>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="py-16 px-8 rounded-2xl text-center mb-8"
        style={{
          background: 'var(--color-cream)',
          border: '1px solid rgba(93, 64, 55, 0.06)',
        }}
      >
        <p
          className="text-xl leading-relaxed"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
        >
          {NEVER_HAVE_I_EVER[currentIndex]}
        </p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={next}
        className="w-full py-4 rounded-xl text-sm font-medium cursor-pointer"
        style={{
          background: 'var(--color-brown)',
          color: 'var(--color-cream)',
          boxShadow: '0 4px 16px rgba(93, 64, 55, 0.15)',
        }}
      >
        Next Prompt 🎲
      </motion.button>
    </div>
  );
}

/* ─── Meet Someone New ─── */
interface MatchedGuest {
  name: string;
}

function MeetSomeoneGame({ onBack }: { onBack: () => void }) {
  const [matchedGuests, setMatchedGuests] = useState<MatchedGuest[]>([]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const matchMe = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data } = await supabase.from('one_word').select('guest_name');
        if (data && data.length > 0) {
          const names = Array.from(new Set(data.map(item => item.guest_name).filter(Boolean)));
          if (names.length >= 2) {
            const shuffled = [...names].sort(() => Math.random() - 0.5);
            setMatchedGuests([{ name: shuffled[0] }, { name: shuffled[1] }]);
          } else {
            // Only 1 person has submitted so far
            setMatchedGuests([
              { name: names[0] },
              { name: 'the next person who joins' },
            ]);
          }
        } else {
          // No submissions yet
          setMatchedGuests([
            { name: 'First Guest' },
            { name: 'Second Guest' },
          ]);
        }
      } else {
        setMatchedGuests([
          { name: 'Pratik' },
          { name: 'Kashish' },
        ]);
      }
      setPrompt(MEET_PROMPTS[Math.floor(Math.random() * MEET_PROMPTS.length)]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm mb-6 cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
        ← Back to Games
      </button>

      <h2 className="text-2xl mb-4 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}>
        🤝 Meet Someone New
      </h2>
      <p className="text-sm text-center mb-8" style={{ color: 'var(--color-text-muted)' }}>
        Get randomly paired with another guest and start a conversation!
      </p>

      {matchedGuests.length > 0 && prompt ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 mb-6"
        >
          <div className="flex gap-3 justify-center">
            {matchedGuests.map((g, idx) => (
              <div
                key={idx}
                className="flex-1 p-4 rounded-2xl text-center"
                style={{ background: 'var(--color-cream)' }}
              >
                <span className="text-2xl block mb-1">👤</span>
                <p className="text-sm font-medium" style={{ color: 'var(--color-brown)' }}>{g.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Matched Guest</p>
              </div>
            ))}
          </div>

          <div
            className="p-6 rounded-2xl text-center"
            style={{ background: 'var(--color-cream)', border: '1px solid rgba(93, 64, 55, 0.06)' }}
          >
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Your Conversation Starter
            </p>
            <p
              className="text-lg italic"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
            >
              "{prompt}"
            </p>
          </div>
        </motion.div>
      ) : null}

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={matchMe}
        disabled={isLoading}
        className="w-full py-4 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
        style={{
          background: 'var(--color-brown)',
          color: 'var(--color-cream)',
          boxShadow: '0 4px 16px rgba(93, 64, 55, 0.15)',
        }}
      >
        {isLoading ? 'Matching...' : matchedGuests.length > 0 ? 'Match Again 🎲' : 'Match Me ✨'}
      </motion.button>
    </div>
  );
}

/* ─── Games Hub ─── */
export default function GamesPage() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    { id: 'quiz', emoji: '🧠', title: 'Who Knows Her Best?', desc: 'Test your knowledge', route: '/quiz' },
    { id: 'charades', emoji: '🎭', title: 'Dumb Charades', desc: 'Act it out!', route: null },
    { id: 'nhie', emoji: '🙈', title: 'Never Have I Ever', desc: 'Party-safe edition', route: null },
    { id: 'meet', emoji: '🤝', title: 'Meet Someone New', desc: 'Make a new friend', route: null },
    { id: 'guestbook', emoji: '📖', title: 'Guest Book', desc: 'Sign the book', route: '/guestbook' },
  ];

  const handleGameSelect = (game: typeof games[0]) => {
    if (game.route) {
      navigate(game.route);
    } else {
      setActiveGame(game.id);
    }
  };

  return (
    <PageWrapper>
      <div className="px-6 pt-16 pb-8 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {activeGame === 'charades' ? (
            <motion.div key="charades" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DumbCharades onBack={() => setActiveGame(null)} />
            </motion.div>
          ) : activeGame === 'nhie' ? (
            <motion.div key="nhie" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NeverHaveIEverGame onBack={() => setActiveGame(null)} />
            </motion.div>
          ) : activeGame === 'meet' ? (
            <motion.div key="meet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MeetSomeoneGame onBack={() => setActiveGame(null)} />
            </motion.div>
          ) : (
            <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h1
                  className="text-3xl md:text-4xl mb-2"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
                >
                  Party Games 🎉
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Pick a game and let the fun begin.
                </p>
              </motion.div>

              <div className="space-y-3">
                {games.map((game, i) => (
                  <motion.button
                    key={game.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGameSelect(game)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left cursor-pointer transition-shadow"
                    style={{
                      background: 'var(--color-cream)',
                      border: '1px solid rgba(93, 64, 55, 0.06)',
                    }}
                  >
                    <span className="text-3xl flex-shrink-0">{game.emoji}</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-brown)' }}>
                        {game.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {game.desc}
                      </p>
                    </div>
                    <span className="ml-auto text-sm" style={{ color: 'var(--color-accent)' }}>→</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
