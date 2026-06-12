import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/shared/Button';
import { useNavigate } from 'react-router-dom';

// Import local photos for the blurred collage background
import babyImg from '../assets/baby.png';
import angydonImg from '../assets/angydon.png';
import kidImg from '../assets/kid.png';
import landerImg from '../assets/lander.png';
import presentImg from '../assets/present.png';
import latestImg from '../assets/latest.png';

export default function HerPage() {
  const { isLocked } = useBirthdayLock();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    notes: 0,
    words: 0,
    photos: 0,
    videos: 0,
    guestbook: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isSupabaseConfigured()) {
          const [msgRes, wordRes, photoRes, videoRes, gbRes] = await Promise.all([
            supabase.from('messages').select('*', { count: 'exact', head: true }),
            supabase.from('one_word').select('*', { count: 'exact', head: true }),
            supabase.from('photos').select('*', { count: 'exact', head: true }).eq('type', 'photo'),
            supabase.from('photos').select('*', { count: 'exact', head: true }).eq('type', 'video'),
            supabase.from('guestbook').select('*', { count: 'exact', head: true }),
          ]);
          setStats({
            notes: msgRes.count || 0,
            words: wordRes.count || 0,
            photos: photoRes.count || 0,
            videos: videoRes.count || 0,
            guestbook: gbRes.count || 0,
          });
        } else {
          setStats({ notes: 12, words: 24, photos: 18, videos: 4, guestbook: 8 });
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    { label: 'notes collected', count: stats.notes },
    { label: 'words submitted', count: stats.words },
    { label: 'photos shared', count: stats.photos },
    { label: 'videos recorded', count: stats.videos },
  ];

  if (isLocked) {
    return (
      <div className="relative min-h-[100dvh] w-full bg-[var(--color-ink)] overflow-hidden flex items-center justify-center select-none">
        {/* Film grain */}
        <div className="film-grain pointer-events-none fixed inset-0 z-40" />

        {/* Blurred breathing collage background */}
        <div className="absolute inset-0 z-10 grid grid-cols-3 gap-2 p-2 opacity-30 scale-110 pointer-events-none animate-blur-breathe">
          <img src={babyImg} alt="Collage 1" className="w-full h-full object-cover sepia brightness-50" />
          <img src={angydonImg} alt="Collage 2" className="w-full h-full object-cover sepia brightness-50" />
          <img src={kidImg} alt="Collage 3" className="w-full h-full object-cover sepia brightness-50" />
          <img src={landerImg} alt="Collage 4" className="w-full h-full object-cover sepia brightness-50" />
          <img src={presentImg} alt="Collage 5" className="w-full h-full object-cover sepia brightness-50" />
          <img src={latestImg} alt="Collage 6" className="w-full h-full object-cover sepia brightness-50" />
        </div>

        {/* Dark Vignette */}
        <div className="ink-vignette absolute inset-0 z-20" />

        {/* Frosted Glass Card — 40px padding, perfectly centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="locked-capsule-card relative z-30 w-full max-w-[560px] mx-4 flex flex-col items-center text-center text-[var(--color-cream)]"
          style={{
            background: 'rgba(28, 20, 16, 0.86)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(156, 138, 124, 0.65)',
            borderRadius: '4px',
            padding: '40px',
          }}
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-cream)]/50 mb-2">
            Birthday Capsule
          </span>
          <h1 className="text-3xl font-light text-[var(--color-cream)] font-[family-name:var(--font-display)] mb-8">
            sealed until the morning
          </h1>

          {/* Stats Grid: 2x2 mobile, 1x4 desktop */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            {statItems.map((item, idx) => (
              <div key={idx} className="border-l border-[var(--color-cream)]/20 pl-4 py-1 text-left">
                <span className="block text-[10px] uppercase tracking-[0.1em] text-[var(--color-cream)]/40">
                  {item.label}
                </span>
                <span className="text-2xl font-light font-[family-name:var(--font-display)] text-red tabular-nums mt-2 block">
                  {isLoading ? '...' : item.count}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xl italic text-red font-[family-name:var(--font-display)] font-bold mt-6">
            Locked until July 5
          </p>
        </motion.div>
      </div>
    );
  }

  // Unlocked State
  return (
    <PageWrapper className="bg-[var(--color-parchment)]">
      <div className="page-container flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-md mb-16"
        >
          <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
            Capsule Status
          </span>
          <h1 className="text-4xl md:text-5xl font-light leading-tight text-[var(--color-ink)] font-[family-name:var(--font-display)]">
            your capsule is unlocked
          </h1>
          <p className="text-base text-[var(--color-dust)] font-[family-name:var(--font-body)]">
            Everything your friends and family have left for you is waiting inside.
          </p>
        </motion.div>

        {/* Stats summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {statItems.map((item, idx) => (
            <div key={idx} className="border-l border-[var(--color-dust)]/20 pl-4 py-1">
              <span className="block text-[10px] uppercase tracking-[0.1em] text-[var(--color-dust)]">
                {item.label}
              </span>
              <span className="text-2xl font-light font-[family-name:var(--font-display)] text-red tabular-nums mt-2 block">
                {isLoading ? '...' : item.count}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button variant="primary" onClick={() => navigate('/capsule')}>
            open the capsule
          </Button>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
