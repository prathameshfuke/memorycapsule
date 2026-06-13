import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CHARADES_PROMPTS, NEVER_HAVE_I_EVER, MEET_PROMPTS } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';

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
    <div className="max-w-[860px] mx-auto px-6 md:px-8">
      <button
        onClick={onBack}
        className="text-xs uppercase tracking-[0.2em] mb-10 cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)] transition-colors"
      >
        ← Back to Games
      </button>

      <div className="text-center mb-10">
        <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
          Act it out
        </span>
        <h2 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
          dumb charades
        </h2>
      </div>

      {!prompt ? (
        <div className="grid grid-cols-2 gap-6">
          {categories.map((cat) => (
            <Card key={cat} onClick={() => generatePrompt(cat)} className="group text-center">
              <span className="text-xs uppercase tracking-[0.1em] text-[var(--color-ink)] group-hover:text-[var(--color-blush)] transition-colors">
                {cat}
              </span>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center space-y-8">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-dust)]">
            Category: {category}
          </p>

          <div
            className="py-16 px-8 rounded-[4px] border border-[var(--color-dust)] min-h-[180px] flex flex-col items-center justify-center cursor-pointer transition-colors"
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
              <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-cream)]">
                Tap to reveal
              </p>
            )}
          </div>

          <div className="flex gap-6">
            <Button
              variant="ghost"
              onClick={() => { setPrompt(null); setCategory(null); }}
              className="flex-1"
            >
              Change Category
            </Button>
            <Button
              variant="primary"
              onClick={nextPrompt}
              className="flex-1"
            >
              Next Prompt →
            </Button>
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
    <div className="max-w-[860px] mx-auto px-6 md:px-8">
      <button
        onClick={onBack}
        className="text-xs uppercase tracking-[0.2em] mb-10 cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)] transition-colors"
      >
        ← Back to Games
      </button>

      <div className="text-center mb-10">
        <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
          Read aloud
        </span>
        <h2 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
          never have I ever
        </h2>
      </div>

      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
      >
        <Card className="py-16 px-8 text-center mb-8">
          <p className="text-xl font-light leading-relaxed font-[family-name:var(--font-display)] text-[var(--color-ink)]">
            {NEVER_HAVE_I_EVER[currentIndex]}
          </p>
        </Card>
      </motion.div>

      <Button variant="primary" fullWidth onClick={next}>
        Next Prompt
      </Button>
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
    <div className="max-w-[860px] mx-auto px-6 md:px-8">
      <button
        onClick={onBack}
        className="text-xs uppercase tracking-[0.2em] mb-10 cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)] transition-colors"
      >
        ← Back to Games
      </button>

      <div className="text-center mb-10">
        <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
          Mingle
        </span>
        <h2 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
          meet someone new
        </h2>
        <p className="text-sm text-[var(--color-dust)] max-w-sm mx-auto mt-4">
          Get randomly paired with another guest and start a conversation.
        </p>
      </div>

      {matchedGuests.length > 0 && prompt ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-6"
        >
          <div className="flex gap-6 justify-center">
            {matchedGuests.map((g, idx) => (
              <Card key={idx} className="flex-1 text-center">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-dust)] mb-1">Guest</p>
                <p className="text-sm text-[var(--color-ink)]">{g.name}</p>
              </Card>
            ))}
          </div>

          <Card className="text-center space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-dust)]">
              Conversation Starter
            </p>
            <p className="text-lg italic font-[family-name:var(--font-display)] text-[var(--color-ink)] font-light">
              "{prompt}"
            </p>
          </Card>
        </motion.div>
      ) : null}

      <Button variant="primary" fullWidth onClick={matchMe} disabled={isLoading}>
        {isLoading ? 'matching...' : matchedGuests.length > 0 ? 'match again' : 'match me'}
      </Button>
    </div>
  );
}

/* ─── Games Hub ─── */
export default function GamesPage() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    { id: 'charades', title: 'Dumb Charades', desc: 'Act out Bollywood and Hollywood prompts for your team.' },
    { id: 'nhie', title: 'Never Have I Ever', desc: 'Read party-safe conversation prompts aloud.' },
    { id: 'meet', title: 'Meet Someone New', desc: 'Match randomly with another guest and start talking.' },
    { id: 'mafia', title: 'Mafia', desc: 'A game of secrets and suspicion. Find the Mafia before they find you.' },
  ];

  return (
    <PageWrapper className="games-page bg-[var(--color-parchment)]">
      <div className="w-full">
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
              <div className="page-container games-hub">
                <div className="games-heading text-center">
                  <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
                    Play together
                  </span>
                  <h1 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
                    games
                  </h1>
                </div>

                <div className="games-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {games.map((game) => (
                    <Card
                      key={game.id}
                      leftBorder
                      onClick={() => game.id === 'mafia' ? navigate('/games/mafia') : setActiveGame(game.id)}
                      className="game-card group h-full flex flex-col justify-between transition-colors"
                    >
                      <div>
                        <h2 className="text-lg font-light font-[family-name:var(--font-display)] text-[var(--color-ink)] group-hover:text-[var(--color-crimson)] transition-colors mb-2">
                          {game.title}
                        </h2>
                        <p className="text-xs text-[var(--color-dust)] leading-relaxed font-[family-name:var(--font-body)]">
                          {game.desc}
                        </p>
                      </div>
                      <span className="block mt-6 text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] group-hover:text-[var(--color-crimson)] transition-colors">
                        Play →
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
