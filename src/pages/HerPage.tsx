import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import PageWrapper from '../components/layout/PageWrapper';
import { useNavigate } from 'react-router-dom';

// Import local photos for the blurred collage background
import babyImg from '../assets/baby.jpg';
import angydonImg from '../assets/angydon.jpg';
import kidImg from '../assets/kid.jpg';
import landerImg from '../assets/lander.jpg';
import presentImg from '../assets/present.jpg';
import latestImg from '../assets/latest.jpg';

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
          // Select only count, head true to prevent fetching raw data
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
          // Fallback mock counts
          setStats({
            notes: 12,
            words: 24,
            photos: 18,
            videos: 4,
            guestbook: 8,
          });
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLocked) {
    return (
      <div className="relative min-h-[100dvh] w-full bg-[#1A1614] overflow-hidden flex items-center justify-center select-none">
        {/* Film grain */}
        <div className="film-grain pointer-events-none fixed inset-0 z-40" />

        {/* Blurred breathing collage background */}
        <div className="absolute inset-0 z-10 grid grid-cols-3 gap-2 p-2 opacity-30 scale-110 pointer-events-none animate-blur-breathe">
          <img src={babyImg} alt="Collage Frame 1" className="w-full h-full object-cover sepia brightness-50" />
          <img src={angydonImg} alt="Collage Frame 2" className="w-full h-full object-cover sepia brightness-50" />
          <img src={kidImg} alt="Collage Frame 3" className="w-full h-full object-cover sepia brightness-50" />
          <img src={landerImg} alt="Collage Frame 4" className="w-full h-full object-cover sepia brightness-50" />
          <img src={presentImg} alt="Collage Frame 5" className="w-full h-full object-cover sepia brightness-50" />
          <img src={latestImg} alt="Collage Frame 6" className="w-full h-full object-cover sepia brightness-50" />
        </div>

        {/* Dark Vignette Overlay */}
        <div className="ink-vignette absolute inset-0 z-20" />

        {/* Frosted Glass Overlay Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-30 w-full max-w-md mx-6 p-8 rounded-[4px] border border-[#FAF7F2]/10 flex flex-col items-center text-center text-[#FAF7F2]"
          style={{
            background: 'rgba(26, 22, 20, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <span className="text-xs uppercase tracking-[0.2em] text-[#FAF7F2]/50 font-medium mb-1">
            Birthday Capsule
          </span>
          <h1 className="text-3xl font-light text-[#FAF7F2] font-[family-name:var(--font-display)] mb-8">
            sealed until the morning
          </h1>

          {/* Counts Grid */}
          <div className="w-full grid grid-cols-2 gap-4 mb-8 text-left">
            {[
              { label: 'notes collected', count: stats.notes },
              { label: 'words submitted', count: stats.words },
              { label: 'photos shared', count: stats.photos },
              { label: 'videos recorded', count: stats.videos },
            ].map((item, idx) => (
              <div key={idx} className="border-l border-[#FAF7F2]/20 pl-4 py-1">
                <span className="block text-[10px] uppercase tracking-[0.1em] text-[#FAF7F2]/40">
                  {item.label}
                </span>
                <span className="text-2xl font-light font-[family-name:var(--font-display)] text-[#C9897A] tabular-nums">
                  {isLoading ? '...' : item.count}
                </span>
              </div>
            ))}
          </div>

          <p className="text-lg italic text-[#C9897A] font-[family-name:var(--font-display)] font-light">
            Locked until July 5
          </p>
        </motion.div>
      </div>
    );
  }

  // Unlocked State view
  return (
    <PageWrapper className="bg-[#FAF7F2]">
      <div className="film-grain pointer-events-none fixed inset-0 z-40" />

      <div className="px-6 pt-24 pb-12 max-w-[860px] mx-auto flex flex-col items-center justify-center min-h-[80vh] space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-md"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
            Capsule Status
          </span>
          <h1
            className="text-4xl md:text-5xl font-light leading-tight text-[var(--color-ink)] font-[family-name:var(--font-display)]"
          >
            your capsule is unlocked
          </h1>
          <p className="text-base text-[var(--color-dust)] font-[family-name:var(--font-body)]">
            Everything your friends and family have left for you is waiting inside.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => navigate('/capsule')}
            className="px-10 py-4 rounded-[4px] text-xs font-medium uppercase tracking-[0.2em] cursor-pointer bg-[var(--color-ink)] text-[var(--color-cream)] hover:bg-[var(--color-ink)]/90 transition-colors"
          >
            open the capsule
          </button>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
