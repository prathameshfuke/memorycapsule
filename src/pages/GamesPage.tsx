import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
    <div className="space-y-6">
      <button onClick={onBack} className="text-xs uppercase tracking-[0.2em] mb-4 cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)]">
        ← Back to Games
      </button>

      <h2 className="text-3xl font-light text-center text-[var(--color-ink)] font-[family-name:var(--font-display)]">
        Dumb Charades
      </h2>

      {!prompt ? (
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => generatePrompt(cat)}
              className="py-6 rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)] text-[var(--color-ink)] text-xs uppercase tracking-[0.1em] font-medium cursor-pointer hover:bg-[var(--color-cream)]/80 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center space-y-6">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-dust)]">
            Category: {category}
          </p>

          <div
            className="py-16 px-6 rounded-[4px] border border-[var(--color-dust)] min-h-[180px] flex flex-col items-center justify-center cursor-pointer transition-colors"
            style={{
              background: revealed ? 'var(--color-cream)' : 'var(--color-ink)',
            }}
            onClick={() => setRevealed(!revealed)}
          >
            {revealed ? (
              <p className="text-2xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
                {prompt}
              </p>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-cream)]">
                  Tap to reveal
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => { setPrompt(null); setCategory(null); }}
              className="flex-1 py-3.5 border border-[var(--color-dust)] text-[var(--color-ink)] rounded-[4px] text-xs uppercase tracking-[0.15em] cursor-pointer hover:bg-[var(--color-cream)]"
            >
              Change Category
            </button>
            <button
              onClick={nextPrompt}
              className="flex-1 py-3.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-[4px] text-xs uppercase tracking-[0.15em] cursor-pointer hover:bg-[var(--color-ink)]/90"
            >
              Next Prompt →
            </button>
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
    <div className="space-y-6">
      <button onClick={onBack} className="text-xs uppercase tracking-[0.2em] mb-4 cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)]">
        ← Back to Games
      </button>

      <h2 className="text-3xl font-light text-center text-[var(--color-ink)] font-[family-name:var(--font-display)]">
        Never Have I Ever
      </h2>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="py-16 px-8 rounded-[4px] border border-[var(--color-dust)] text-center bg-[var(--color-cream)]"
      >
        <p
          className="text-xl font-light leading-relaxed font-[family-name:var(--font-display)] text-[var(--color-ink)]"
        >
          {NEVER_HAVE_I_EVER[currentIndex]}
        </p>
      </motion.div>

      <button
        onClick={next}
        className="w-full py-4 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-[4px] text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-[var(--color-ink)]/90 transition-colors"
      >
        Next Prompt
      </button>
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
          const typedData = data as { guest_name: string }[];
          const names = Array.from(new Set(typedData.map(item => item.guest_name).filter(Boolean)));
          if (names.length >= 2) {
            const shuffled = [...names].sort(() => Math.random() - 0.5);
            setMatchedGuests([{ name: shuffled[0] }, { name: shuffled[1] }]);
          } else {
            setMatchedGuests([
              { name: names[0] },
              { name: 'the next person who joins' },
            ]);
          }
        } else {
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
    <div className="space-y-6">
      <button onClick={onBack} className="text-xs uppercase tracking-[0.2em] mb-4 cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)]">
        ← Back to Games
      </button>

      <h2 className="text-3xl font-light text-center text-[var(--color-ink)] font-[family-name:var(--font-display)]">
        Meet Someone New
      </h2>
      <p className="text-sm text-center text-[var(--color-dust)] max-w-sm mx-auto">
        Get randomly paired with another guest and start a conversation.
      </p>

      {matchedGuests.length > 0 && prompt ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex gap-4 justify-center">
            {matchedGuests.map((g, idx) => (
              <div
                key={idx}
                className="flex-1 p-5 border border-[var(--color-dust)] rounded-[4px] text-center bg-[var(--color-cream)]"
              >
                <p className="text-xs uppercase tracking-wider text-[var(--color-dust)] mb-1">Guest</p>
                <p className="text-sm font-medium text-[var(--color-ink)]">{g.name}</p>
              </div>
            ))}
          </div>

          <div
            className="p-6 rounded-[4px] border border-[var(--color-dust)] bg-[var(--color-cream)] text-center space-y-2"
          >
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-dust)]">
              Conversation Starter
            </p>
            <p
              className="text-lg italic font-[family-name:var(--font-display)] text-[var(--color-ink)] font-light"
            >
              "{prompt}"
            </p>
          </div>
        </motion.div>
      ) : null}

      <button
        onClick={matchMe}
        disabled={isLoading}
        className="w-full py-4 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-[4px] text-xs uppercase tracking-[0.2em] cursor-pointer hover:bg-[var(--color-ink)]/90 transition-colors disabled:opacity-40"
      >
        {isLoading ? 'matching...' : matchedGuests.length > 0 ? 'match again' : 'match me'}
      </button>
    </div>
  );
}

/* ─── Games Hub ─── */
export default function GamesPage() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    { id: 'quiz', title: 'Who Knows Her Best?', desc: 'Test your knowledge of the birthday girl.', route: '/quiz' },
    { id: 'charades', title: 'Dumb Charades', desc: 'Act out Bollywood/Hollywood prompts.', route: null },
    { id: 'nhie', title: 'Never Have I Ever', desc: 'Read party-safe conversation prompts.', route: null },
    { id: 'meet', title: 'Meet Someone New', desc: 'Match randomly with other guests.', route: null },
    { id: 'guestbook', title: 'Guest Book', desc: 'Leave a public signature and note.', route: '/guestbook' },
  ];

  const handleGameSelect = (game: typeof games[0]) => {
    if (game.route) {
      navigate(game.route);
    } else {
      setActiveGame(game.id);
    }
  };

  return (
    <PageWrapper className="bg-[#FAF7F2]">
      <div className="px-6 pt-20 pb-8 max-w-[860px] mx-auto">
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
            <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
                  Party activities
                </span>
                <h1
                  className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]"
                >
                  party games
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handleGameSelect(game)}
                    className="group w-full flex flex-col text-left p-5 bg-[var(--color-cream)] border-l-[4px] border-[var(--color-sepia)] border-t border-r border-b border-[var(--color-dust)]/20 rounded-[4px] cursor-pointer hover:bg-[var(--color-cream)]/80 transition-colors"
                  >
                    <div className="w-full flex items-center justify-between">
                      <p className="text-base font-light font-[family-name:var(--font-display)] text-[var(--color-ink)] group-hover:text-[var(--color-blush)] transition-colors">
                        {game.title}
                      </p>
                      <span className="text-sm text-[var(--color-dust)] group-hover:translate-x-1 group-hover:text-[var(--color-blush)] transition-transform">→</span>
                    </div>
                    <p className="text-xs text-[var(--color-dust)] mt-1 font-[family-name:var(--font-body)]">
                      {game.desc}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
