import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/shared/Card';

export default function GuestDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem('event_code_verified');
    if (isAuth !== 'true') {
      navigate('/');
    }
  }, [navigate]);

  const guestFeatures = [
    {
      title: 'describe her in one word',
      desc: 'Add a single descriptive word to her cloud.',
      action: 'Add a word →',
      route: '/one-word',
    },
    {
      title: 'leave a secret message',
      desc: 'Seal a message she will open on her birthday.',
      action: 'Write a note →',
      route: '/messages',
    },
    {
      title: 'add to the album',
      desc: 'Take or upload vintage photos and videos.',
      action: 'Upload media →',
      route: '/camera',
    },
    {
      title: 'sign the guestbook',
      desc: 'Sign the guest registry book with a public note.',
      action: 'Sign the book →',
      route: '/guestbook',
    },
  ];

  return (
    <PageWrapper className="bg-[var(--color-parchment)]">
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
            Your contribution
          </span>
          <h1 className="text-4xl md:text-5xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
            what would you like to leave her?
          </h1>
          <p className="text-sm max-w-md mx-auto text-[var(--color-dust)] mt-4">
            Everyone here knows her differently. Leave a memory, a thought, or just one word.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
        >
          {guestFeatures.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="h-full"
            >
              <Card
                onClick={() => navigate(feat.route)}
                className="group h-full flex flex-col justify-between transition-colors hover:bg-[var(--color-cream)]/80"
              >
                <div>
                  <h2 className="text-lg font-light font-[family-name:var(--font-display)] text-[var(--color-ink)] group-hover:text-[var(--color-blush)] transition-colors mb-2">
                    {feat.title}
                  </h2>
                  <p className="text-xs text-[var(--color-dust)] leading-relaxed font-[family-name:var(--font-body)]">
                    {feat.desc}
                  </p>
                </div>
                <span className="block mt-6 text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] group-hover:text-[var(--color-blush)] transition-colors">
                  {feat.action}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Back link */}
        <div className="text-center mt-16">
          <button
            onClick={() => navigate('/')}
            className="text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
          >
            ← back to home
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
