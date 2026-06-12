import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Message, OneWord, Photo, GuestbookEntry } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [words, setWords] = useState<OneWord[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [futureLetters, setFutureLetters] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'words' | 'photos' | 'guestbook' | 'future'>('messages');

  useEffect(() => {
    const mode = localStorage.getItem('mode');
    if (mode === 'admin') {
      setIsAdmin(true);
    } else {
      navigate('/');
    }
    setCheckingAuth(false);
  }, [navigate]);

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const [msgRes, wordRes, photoRes, gbRes, flRes] = await Promise.all([
        supabase.from('messages').select('*').order('created_at', { ascending: false }),
        supabase.from('one_word').select('*').order('created_at', { ascending: false }),
        supabase.from('photos').select('*').order('created_at', { ascending: false }),
        supabase.from('guestbook').select('*').order('created_at', { ascending: false }),
        supabase.from('future_letters').select('*').order('created_at', { ascending: false }),
      ]);
      if (msgRes.data) setMessages(msgRes.data as Message[]);
      if (wordRes.data) setWords(wordRes.data as OneWord[]);
      if (photoRes.data) setPhotos(photoRes.data as Photo[]);
      if (gbRes.data) setGuestbook(gbRes.data as GuestbookEntry[]);
      if (flRes.data) setFutureLetters(flRes.data as Message[]);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin, fetchAll]);

  const handleDelete = async (table: string, id: string) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        fetchAll();
      }
    } catch (err) {
      alert('Delete failed: ' + (err as any).message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('event_code_verified');
    localStorage.removeItem('mode');
    localStorage.removeItem('guest_name');
    localStorage.removeItem('guest_relationship');
    localStorage.removeItem('guest_authorized');
    window.location.href = '/';
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-parchment)]">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-blush)' }} />
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs = [
    { id: 'messages' as const, label: 'notes', count: messages.length },
    { id: 'words' as const, label: 'words', count: words.length },
    { id: 'photos' as const, label: 'gallery', count: photos.length },
    { id: 'guestbook' as const, label: 'registry', count: guestbook.length },
    { id: 'future' as const, label: 'future', count: futureLetters.length },
  ];

  return (
    <PageWrapper className="bg-[var(--color-parchment)]">
      <div className="px-6 md:px-8 pt-16 md:pt-24 pb-8 max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="block text-xs uppercase tracking-[0.2em] text-[var(--color-dust)] mb-2">
              Admin
            </span>
            <h1 className="text-3xl md:text-4xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]">
              manage the capsule
            </h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-[var(--color-blush)] border-[var(--color-blush)]">
            Leave admin
          </Button>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-[4px] text-xs uppercase tracking-[0.1em] cursor-pointer whitespace-nowrap transition-colors"
              style={{
                background: activeTab === tab.id ? 'var(--color-ink)' : 'var(--color-cream)',
                color: activeTab === tab.id ? 'var(--color-cream)' : 'var(--color-dust)',
                border: `1px solid ${activeTab === tab.id ? 'var(--color-ink)' : 'var(--color-dust)'}`,
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {/* ─── Notes Tab ─── */}
          {activeTab === 'messages' && (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center justify-between gap-4 py-4 border-b border-[var(--color-dust)]/10"
                  style={{ minHeight: '64px' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-ink)] truncate">"{msg.message}"</p>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-dust)] mt-1">
                      — {msg.guest_name} · {new Date(msg.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete('messages', msg.id)}
                    className="flex-shrink-0 text-[var(--color-blush)] border-[var(--color-blush)] px-4 py-2"
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-sm py-16 text-[var(--color-dust)]">Nothing here yet</p>
              )}
            </div>
          )}

          {/* ─── Words Tab ─── */}
          {activeTab === 'words' && (
            <div className="space-y-2">
              {words.map((word) => (
                <div
                  key={word.id}
                  className="flex items-center justify-between gap-4 py-4 border-b border-[var(--color-dust)]/10"
                  style={{ minHeight: '64px' }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-sm font-light border border-[var(--color-dust)]/40 px-3 py-1.5 rounded-[4px] text-[var(--color-sepia)] font-[family-name:var(--font-display)] bg-[var(--color-cream)] flex-shrink-0">
                      {word.word}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-dust)]">
                      by {word.guest_name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete('one_word', word.id)}
                    className="flex-shrink-0 text-[var(--color-blush)] border-[var(--color-blush)] px-4 py-2"
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {words.length === 0 && (
                <p className="text-center text-sm py-16 text-[var(--color-dust)]">Nothing here yet</p>
              )}
            </div>
          )}

          {/* ─── Gallery Tab ─── */}
          {activeTab === 'photos' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="space-y-3 p-3">
                  <div className="rounded-[4px] overflow-hidden bg-[var(--color-ink)]/5" style={{ aspectRatio: '1/1' }}>
                    {photo.type === 'video' ? (
                      <video src={photo.photo_url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={photo.photo_url} alt="Memory" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--color-dust)]">
                      {photo.guest_name} ({photo.type})
                    </span>
                    <button
                      onClick={() => handleDelete('photos', photo.id)}
                      className="text-[10px] uppercase tracking-wider text-[var(--color-blush)] hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              ))}
              {photos.length === 0 && (
                <p className="text-center text-sm py-16 text-[var(--color-dust)] col-span-full">Nothing here yet</p>
              )}
            </div>
          )}

          {/* ─── Registry Tab ─── */}
          {activeTab === 'guestbook' && (
            <div className="space-y-2">
              {guestbook.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-4 py-4 border-b border-[var(--color-dust)]/10"
                  style={{ minHeight: '64px' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-ink)] truncate">"{entry.message}"</p>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-dust)] mt-1">
                      — {entry.guest_name} · {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete('guestbook', entry.id)}
                    className="flex-shrink-0 text-[var(--color-blush)] border-[var(--color-blush)] px-4 py-2"
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {guestbook.length === 0 && (
                <p className="text-center text-sm py-16 text-[var(--color-dust)]">Nothing here yet</p>
              )}
            </div>
          )}

          {/* ─── Future Letters Tab ─── */}
          {activeTab === 'future' && (
            <div className="space-y-2">
              {futureLetters.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center justify-between gap-4 py-4 border-b border-[var(--color-dust)]/10"
                  style={{ minHeight: '64px' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-ink)] truncate">"{msg.message}"</p>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-dust)] mt-1">
                      — {msg.guest_name} · {new Date(msg.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete('future_letters', msg.id)}
                    className="flex-shrink-0 text-[var(--color-blush)] border-[var(--color-blush)] px-4 py-2"
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {futureLetters.length === 0 && (
                <p className="text-center text-sm py-16 text-[var(--color-dust)]">Nothing here yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
