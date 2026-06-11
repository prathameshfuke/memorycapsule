import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { GuestbookEntry } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';

export default function GuestbookPage() {
  const { guestName, isRegistered, setShowRegistration } = useGuest();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setEntries(data as unknown as GuestbookEntry[]);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.from('guestbook').insert([{
          guest_name: guestName,
          message: message.trim(),
        }]);
        fetchEntries();
      } else {
        setEntries(prev => [...prev, {
          id: crypto.randomUUID(),
          guest_name: guestName || 'Anonymous',
          message: message.trim(),
          created_at: new Date().toISOString(),
        }]);
      }
      setMessage('');
      setHasSubmitted(true);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="px-6 pt-16 pb-8 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1
            className="text-3xl md:text-4xl mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
          >
            📖 Guest Book
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Leave your mark. Sign the book.
          </p>
        </motion.div>

        {/* Form */}
        {!hasSubmitted ? (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="mb-10 space-y-4"
          >
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write something memorable..."
              rows={4}
              className="w-full px-5 py-4 rounded-2xl text-sm outline-none resize-none leading-relaxed"
              style={{
                background: 'var(--color-cream)',
                color: 'var(--color-text)',
                border: '1px solid rgba(93, 64, 55, 0.08)',
                fontFamily: message ? 'var(--font-handwritten)' : 'var(--font-body)',
                fontSize: message ? '1.05rem' : '0.875rem',
              }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className="w-full py-3.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
              style={{
                background: 'var(--color-brown)',
                color: 'var(--color-cream)',
              }}
            >
              {isSubmitting ? 'Signing...' : 'Sign the Book ✍️'}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 mb-10 rounded-2xl"
            style={{ background: 'var(--color-cream)' }}
          >
            <span className="text-3xl block mb-2">✨</span>
            <p
              className="text-lg"
              style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--color-brown)' }}
            >
              Signed!
            </p>
            <button
              onClick={() => setHasSubmitted(false)}
              className="mt-3 text-xs underline cursor-pointer"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Write another entry
            </button>
          </motion.div>
        )}

        {/* Entries */}
        <div className="space-y-4">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl"
              style={{
                background: 'var(--color-cream)',
                border: '1px solid rgba(93, 64, 55, 0.04)',
                transform: `rotate(${-0.5 + Math.random()}deg)`,
              }}
            >
              <p
                className="text-base leading-relaxed"
                style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--color-brown)' }}
              >
                "{entry.message}"
              </p>
              <div className="flex items-center justify-between mt-3">
                <p
                  className="text-lg"
                  style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--color-accent-dark)' }}
                >
                  — {entry.guest_name || 'Anonymous'}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
