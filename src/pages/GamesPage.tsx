import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CHARADES_PROMPTS, NEVER_HAVE_I_EVER, MEET_PROMPTS, GUESTS, getGuestInfo } from '../lib/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useGuest } from '../hooks/useGuest';
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
    <div className="game-view-container">
      <button
        onClick={onBack}
        className="text-xs uppercase tracking-[0.2em] mb-10 cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)] transition-colors"
      >
        ← Back to Games
      </button>

      <div className="text-centered" style={{ marginBottom: '40px' }}>
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
            <Card key={cat} onClick={() => generatePrompt(cat)} className="group text-centered">
              <span className="text-xs uppercase tracking-[0.1em] text-[var(--color-ink)] group-hover:text-[var(--color-blush)] transition-colors">
                {cat}
              </span>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-centered space-y-8">
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
    <div className="game-view-container">
      <button
        onClick={onBack}
        className="text-xs uppercase tracking-[0.2em] mb-10 cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)] transition-colors"
      >
        ← Back to Games
      </button>

      <div className="text-centered" style={{ marginBottom: '40px' }}>
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
        <Card className="py-16 px-8 text-centered mb-8">
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
    <div className="game-view-container">
      <button
        onClick={onBack}
        className="text-xs uppercase tracking-[0.2em] mb-10 cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)] transition-colors"
      >
        ← Back to Games
      </button>

      <div className="text-centered" style={{ marginBottom: '40px' }}>
        <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)]" style={{ marginBottom: '8px' }}>
          Mingle
        </span>
        <h2 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
          meet someone new
        </h2>
        <p className="text-centered" style={{ fontSize: '14px', color: 'var(--color-dust)', maxWidth: '384px', margin: '16px auto 0' }}>
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
              <Card key={idx} className="flex-1 text-centered">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-dust)] mb-1">Guest</p>
                <p className="text-sm text-[var(--color-ink)]">{g.name}</p>
              </Card>
            ))}
          </div>

          <Card className="text-centered space-y-2">
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

/* ─── Guess Who & Most Likely To Voting Component ─── */
const GUESS_WHO_QUESTIONS = [
  { id: 'late', text: 'Who is most likely to arrive late?' },
  { id: 'foodie', text: 'Who is the biggest foodie?' },
  { id: 'laugh', text: 'Who has the loudest, most recognizable laugh?' },
  { id: 'lost', text: 'Who is most likely to get lost in a straight street?' },
  { id: 'dramatic', text: 'Who is the most dramatic in the group?' },
  { id: 'parent', text: 'Who acts as the "mom" or "dad" of the group?' },
  { id: 'shopaholic', text: 'Who is the secret shopaholic?' },
];

const MOST_LIKELY_QUESTIONS = [
  { id: 'earthquake', text: 'Most likely to sleep through an earthquake?' },
  { id: 'cry', text: 'Most likely to cry at a happy/romantic movie?' },
  { id: 'dare', text: 'Most likely to get a tattoo on a random dare?' },
  { id: 'billionaire', text: 'Most likely to become a billionaire first?' },
  { id: 'spend', text: 'Most likely to spend all their money in a single day?' },
  { id: 'stranger', text: 'Most likely to start a deep conversation with a random stranger?' },
  { id: 'trip', text: 'Most likely to trip over absolutely nothing?' },
];

function InteractiveVotingGame({
  gameType,
  title,
  eyebrow,
  questions,
  onBack,
}: {
  gameType: 'guess_who' | 'most_likely';
  title: string;
  eyebrow: string;
  questions: { id: string; text: string }[];
  onBack: () => void;
}) {
  const { guestName, isRegistered, setShowRegistration } = useGuest();
  const [qIndex, setQIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [myVote, setMyVote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const question = questions[qIndex];

  // Fetch votes from Supabase or Fallback
  const fetchVotes = useCallback(async () => {
    if (!question) return;

    if (!isSupabaseConfigured()) {
      // Mock Local Simulation
      const mockVotes: Record<string, number> = {};
      let total = 0;
      GUESTS.forEach((g) => {
        // Hash based mock distribution to keep it stable per question
        let hash = 0;
        const comb = g.name + question.id;
        for (let i = 0; i < comb.length; i++) {
          hash = comb.charCodeAt(i) + ((hash << 5) - hash);
        }
        const amt = (Math.abs(hash) % 5) + 1;
        mockVotes[g.name] = amt;
        total += amt;
      });

      const stored = localStorage.getItem(`vote:${gameType}:${question.id}`);
      if (stored) {
        mockVotes[stored] = (mockVotes[stored] || 0) + 1;
        setMyVote(stored);
      } else {
        setMyVote(null);
      }
      setVotes(mockVotes);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('game_votes')
        .select('voter_name, target_name')
        .eq('game_type', gameType)
        .eq('question_id', question.id);

      if (error) throw error;

      if (data) {
        const counts: Record<string, number> = {};
        let mine: string | null = null;
        data.forEach((v: any) => {
          counts[v.target_name] = (counts[v.target_name] || 0) + 1;
          if (v.voter_name === guestName) {
            mine = v.target_name;
          }
        });
        setVotes(counts);
        setMyVote(mine);
      }
    } catch (err) {
      console.error('Failed to fetch game votes:', err);
    }
  }, [gameType, question, guestName]);

  useEffect(() => {
    fetchVotes();

    if (!isSupabaseConfigured() || !question) return;

    // Realtime changes listener
    const channel = supabase
      .channel(`game_votes:${gameType}:${question.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_votes',
          filter: `game_type=eq.${gameType}`,
        },
        () => {
          fetchVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [question, fetchVotes, gameType]);

  const castVote = async (targetName: string) => {
    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }

    setIsLoading(true);

    if (!isSupabaseConfigured()) {
      localStorage.setItem(`vote:${gameType}:${question.id}`, targetName);
      setMyVote(targetName);
      setVotes((prev) => ({
        ...prev,
        [targetName]: (prev[targetName] || 0) + 1,
      }));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from('game_votes').insert([
        {
          game_type: gameType,
          question_id: question.id,
          voter_name: guestName,
          target_name: targetName,
        },
      ]);

      if (error) {
        if (error.code === '23505') {
          console.log('Already voted');
        } else {
          throw error;
        }
      }
      fetchVotes();
    } catch (err) {
      console.error('Error casting vote:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setQIndex((prev) => (prev + 1) % questions.length);
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="game-view-container">
      <button
        onClick={onBack}
        className="text-xs uppercase tracking-[0.2em] mb-10 cursor-pointer text-[var(--color-dust)] hover:text-[var(--color-ink)] transition-colors"
      >
        ← Back to Games
      </button>

      <div className="text-centered" style={{ marginBottom: '40px' }}>
        <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
          {eyebrow}
        </span>
        <h2 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
          {title}
        </h2>
      </div>

      <Card className="py-8 px-6 text-centered mb-8 bg-[var(--color-cream)]">
        <p className="text-xl md:text-2xl font-light leading-relaxed font-[family-name:var(--font-display)] text-[var(--color-ink)]">
          "{question.text}"
        </p>
      </Card>

      <div className="mb-8 grid grid-cols-2 gap-4">
        {GUESTS.map((guest) => {
          const info = getGuestInfo(guest.id);
          const hasVoted = myVote !== null;
          const isMySelection = myVote === info.name;
          const voteCount = votes[info.name] || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          return (
            <Card
              key={guest.id}
              onClick={hasVoted || isLoading ? undefined : () => castVote(info.name)}
              className={`relative flex flex-col items-center justify-between p-3 border text-centered transition-all duration-300 min-h-[135px] ${
                hasVoted
                  ? isMySelection
                    ? 'border-[var(--color-crimson)] bg-[var(--color-cream)] scale-[1.02]'
                    : 'border-[var(--color-dust)]/40 opacity-75'
                  : 'border-[var(--color-dust)] hover:border-[var(--color-ember)] cursor-pointer active:scale-[0.98]'
              }`}
            >
              {/* Avatar Frame */}
              <div className="w-14 h-14 rounded-full overflow-hidden border border-[var(--color-dust)]/40 mb-2 flex items-center justify-center bg-[var(--color-cream)]">
                <img src={info.avatar} alt={info.name} className="w-full h-full object-cover" />
              </div>

              {/* Name */}
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-ink)] mb-1">
                {info.name}
              </span>

              {/* Vote result progress */}
              {hasVoted && (
                <div className="mt-2 w-full">
                  <div className="w-full bg-[var(--color-dust)]/20 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isMySelection ? 'bg-[var(--color-crimson)]' : 'bg-[var(--color-dust)]'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[9px] uppercase tracking-wider text-[var(--color-dust)]">
                    <span>
                      {voteCount} vote{voteCount !== 1 ? 's' : ''}
                    </span>
                    <span className="font-bold">{percentage}%</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Button variant="primary" fullWidth onClick={handleNext} disabled={isLoading}>
        Next Question →
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
    { id: 'cat-copy', title: 'Cat Copy Challenge', desc: 'A cat image flashes on screen. Memorize it. Recreate it. Everyone votes.' },
    { id: 'guess_who', title: 'Guess Who', desc: 'Who fits the description best? Guess and vote on guest cards!' },
    { id: 'most_likely', title: 'Most Likely To', desc: 'Vote on which guest is most likely to do outrageous things.' },
  ];

  return (
    <PageWrapper className="games-page bg-[var(--color-parchment)]">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {activeGame === 'charades' ? (
            <motion.div key="charades" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DumbCharades onBack={() => setActiveGame(null)} />
            </motion.div>
          ) : activeGame === 'nhie' ? (
            <motion.div key="nhie" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NeverHaveIEverGame onBack={() => setActiveGame(null)} />
            </motion.div>
          ) : activeGame === 'meet' ? (
            <motion.div key="meet" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MeetSomeoneGame onBack={() => setActiveGame(null)} />
            </motion.div>
          ) : activeGame === 'guess_who' ? (
            <motion.div key="guess_who" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InteractiveVotingGame
                gameType="guess_who"
                title="guess who"
                eyebrow="Suspicion"
                questions={GUESS_WHO_QUESTIONS}
                onBack={() => setActiveGame(null)}
              />
            </motion.div>
          ) : activeGame === 'most_likely' ? (
            <motion.div key="most_likely" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InteractiveVotingGame
                gameType="most_likely"
                title="most likely to"
                eyebrow="Predictions"
                questions={MOST_LIKELY_QUESTIONS}
                onBack={() => setActiveGame(null)}
              />
            </motion.div>
          ) : (
            <motion.div key="hub" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-container games-hub">
                <div className="games-heading text-centered">
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
                      onClick={() => game.id === 'mafia' ? navigate('/games/mafia') : game.id === 'cat-copy' ? navigate('/games/cat-copy') : setActiveGame(game.id)}
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
