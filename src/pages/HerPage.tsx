import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import PageWrapper from '../components/layout/PageWrapper';
import Countdown from '../components/shared/Countdown';
import { useNavigate } from 'react-router-dom';

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
          // Placeholder mock counts for local/demo mode
          setStats({
            notes: 34,
            words: 18,
            photos: 92,
            videos: 11,
            guestbook: 15,
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

  return (
    <PageWrapper>
      {/* Film grain texture */}
      <div className="film-grain pointer-events-none fixed inset-0 z-40 opacity-[0.03]" />

      <div className="px-6 pt-20 pb-12 max-w-lg mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-5xl block">🎁</span>
          <h1
            className="text-3xl md:text-4xl font-light"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
          >
            Your Birthday Capsule
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            A space built for you. Previews are sealed, but the anticipation is yours.
          </p>
        </div>

        {/* Locked Countdown area */}
        <div
          className="p-8 rounded-2xl text-center space-y-6"
          style={{
            background: 'var(--color-cream)',
            border: '1px solid rgba(93, 64, 55, 0.06)',
            boxShadow: '0 10px 30px rgba(93, 64, 55, 0.05)',
          }}
        >
          {isLocked ? (
            <>
              <div className="inline-block p-4 bg-white rounded-full shadow-sm">
                <span className="text-3xl">🔒</span>
              </div>
              <h2
                className="text-xl font-medium"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
              >
                Memories are waiting...
              </h2>
              <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                Your friends and family have left surprises for you. Everything will automatically unlock on your birthday morning.
              </p>
              <div className="pt-2">
                <Countdown />
              </div>
            </>
          ) : (
            <>
              <div className="inline-block p-4 bg-[var(--color-accent-light)] rounded-full shadow-sm animate-bounce">
                <span className="text-3xl">🔑</span>
              </div>
              <h2
                className="text-xl font-medium"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
              >
                Your capsule is unlocked!
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Head to the capsule page to view all notes, photos, and messages!
              </p>
              <button
                onClick={() => navigate('/capsule')}
                className="mt-4 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer"
                style={{
                  background: 'var(--color-brown)',
                  color: 'var(--color-cream)',
                }}
              >
                Open Capsule 🌟
              </button>
            </>
          )}
        </div>

        {/* Memory stats */}
        <div className="space-y-4">
          <h3
            className="text-xs uppercase tracking-[0.2em] font-semibold text-center"
            style={{ color: 'var(--color-accent-dark)' }}
          >
            Sealed Surprises Count
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--color-accent)' }} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: '💌 Notes Collected', count: stats.notes },
                { label: '✨ Words Submitted', count: stats.words },
                { label: '📸 Photos Shared', count: stats.photos },
                { label: '🎥 Videos Recorded', count: stats.videos },
                { label: '📝 Guestbook Signs', count: stats.guestbook },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-white rounded-xl"
                  style={{
                    border: '1px solid rgba(93, 64, 55, 0.04)',
                    boxShadow: '0 2px 8px rgba(93, 64, 55, 0.02)',
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--color-brown)' }}>
                    {item.label}
                  </span>
                  <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--color-accent-dark)' }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Play games link */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/games')}
            className="px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer"
            style={{
              background: 'var(--color-cream)',
              color: 'var(--color-brown)',
              border: '1px solid rgba(93, 64, 55, 0.1)',
            }}
          >
            🎮 Play Party Games
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
