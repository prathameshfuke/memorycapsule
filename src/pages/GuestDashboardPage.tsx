import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';

export default function GuestDashboardPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Authenticate guest
    const isAuth = localStorage.getItem('guest_authorized');
    if (isAuth !== 'true') {
      const pass = prompt('Enter Guest Access Code:');
      if (pass === 'oneword') {
        localStorage.setItem('guest_authorized', 'true');
      } else {
        alert('Access denied!');
        navigate('/');
      }
    }
  }, [navigate]);

  const guestFeatures = [
    { title: '💬 Describe her in one word', desc: 'Add a single descriptive word to her cloud.', route: '/one-word' },
    { title: '💌 Leave a secret message', desc: 'Seal a message she will open on her birthday.', route: '/messages' },
    { title: '📸 Add to the album', desc: 'Take or upload vintage photos and videos.', route: '/camera' },
    { title: '📖 Sign the guestbook', desc: 'Sign the guest registry book with a public note.', route: '/guestbook' },
    { title: '🧠 Play the quiz', desc: 'Test how well you know her in a trivia game.', route: '/quiz' },
  ];

  return (
    <PageWrapper>
      <div className="film-grain pointer-events-none fixed inset-0 z-40 opacity-[0.03]" />

      <div className="px-6 pt-20 pb-12 max-w-lg mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-5xl block">✍️</span>
          <h1
            className="text-3xl md:text-4xl font-light"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
          >
            Ab Tumhari Baari
          </h1>
          <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Everyone here knows her differently. Leave a memory, a thought, or just one word.
          </p>
        </div>

        {/* Feature choices */}
        <div className="space-y-4">
          {guestFeatures.map((feat, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(feat.route)}
              className="w-full text-left p-5 bg-white rounded-2xl flex items-center justify-between shadow-sm cursor-pointer group transition-all"
              style={{
                border: '1px solid rgba(93, 64, 55, 0.05)',
              }}
            >
              <div className="space-y-1">
                <h2 className="text-sm font-semibold group-hover:text-[var(--color-accent-dark)] transition-colors" style={{ color: 'var(--color-brown)' }}>
                  {feat.title}
                </h2>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {feat.desc}
                </p>
              </div>
              <span className="text-lg text-[var(--color-accent)] group-hover:translate-x-1 transition-transform">→</span>
            </motion.button>
          ))}
        </div>

        {/* Back link */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer"
            style={{
              background: 'var(--color-cream)',
              color: 'var(--color-brown)',
              border: '1px solid rgba(93, 64, 55, 0.08)',
            }}
          >
            ← Home
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
