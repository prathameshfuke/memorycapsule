import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';

export default function GuestDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem('event_code_verified');
    if (isAuth !== 'true') {
      navigate('/');
    }
  }, [navigate]);

  const guestFeatures = [
    { title: 'describe her in one word', desc: 'Add a single descriptive word to her cloud.', route: '/one-word' },
    { title: 'leave a secret message', desc: 'Seal a message she will open on her birthday.', route: '/messages' },
    { title: 'add to the album', desc: 'Take or upload vintage photos and videos.', route: '/camera' },
    { title: 'sign the guestbook', desc: 'Sign the guest registry book with a public note.', route: '/guestbook' },
    { title: 'play the quiz', desc: 'Test how well you know her in a trivia game.', route: '/quiz' },
  ];

  return (
    <PageWrapper className="bg-[#FAF7F2]">
      <div className="film-grain pointer-events-none fixed inset-0 z-40" />

      <div className="px-6 pt-20 pb-12 max-w-[860px] mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
            your turn
          </span>
          <h1
            className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]"
          >
            contribute
          </h1>
          <p className="text-sm max-w-md mx-auto text-[var(--color-dust)]">
            Everyone here knows her differently. Leave a memory, a thought, or just one word.
          </p>
        </div>

        {/* Feature choices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guestFeatures.map((feat, idx) => (
            <button
              key={idx}
              onClick={() => navigate(feat.route)}
              className="w-full text-left p-6 bg-[var(--color-cream)] border border-[var(--color-dust)] rounded-[4px] flex items-center justify-between cursor-pointer group hover:bg-[var(--color-cream)]/80 transition-colors"
            >
              <div className="space-y-1 pr-4">
                <h2 className="text-sm uppercase tracking-[0.1em] font-medium text-[var(--color-ink)] group-hover:text-[var(--color-blush)] transition-colors">
                  {feat.title}
                </h2>
                <p className="text-xs text-[var(--color-dust)] leading-relaxed font-[family-name:var(--font-body)]">
                  {feat.desc}
                </p>
              </div>
              <span className="text-lg text-[var(--color-dust)] group-hover:translate-x-1 group-hover:text-[var(--color-blush)] transition-transform">→</span>
            </button>
          ))}
        </div>

        {/* Back link */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider cursor-pointer border border-[var(--color-dust)] text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors"
          >
            ← Home
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
