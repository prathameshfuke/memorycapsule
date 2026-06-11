import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Message, OneWord, Photo, GuestbookEntry } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Moderation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [words, setWords] = useState<OneWord[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'words' | 'photos' | 'guestbook'>('messages');

  useEffect(() => {
    const mode = localStorage.getItem('mode');
    if (mode === 'admin') {
      setIsAdmin(true);
    } else {
      // If not admin, redirect to landing page
      navigate('/');
    }
    setCheckingAuth(false);
  }, [navigate]);

  const fetchAll = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const [msgRes, wordRes, photoRes, gbRes] = await Promise.all([
        supabase.from('messages').select('*').order('created_at', { ascending: false }),
        supabase.from('one_word').select('*').order('created_at', { ascending: false }),
        supabase.from('photos').select('*').order('created_at', { ascending: false }),
        supabase.from('guestbook').select('*').order('created_at', { ascending: false }),
      ]);

      if (msgRes.data) setMessages(msgRes.data as Message[]);
      if (wordRes.data) setWords(wordRes.data as OneWord[]);
      if (photoRes.data) setPhotos(photoRes.data as Photo[]);
      if (gbRes.data) setGuestbook(gbRes.data as GuestbookEntry[]);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAll();
    }
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-blush)' }} />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <PageWrapper className="bg-[#FAF7F2]">
      <div className="film-grain pointer-events-none fixed inset-0 z-40" />

      <div className="px-6 pt-20 pb-12 max-w-[860px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[var(--color-dust)]/10 pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-dust)]">
              Console
            </span>
            <h1
              className="text-3xl md:text-4xl font-light text-[var(--color-ink)] font-[family-name:var(--font-display)]"
            >
              moderation desk
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-[10px] uppercase tracking-wider border border-[var(--color-blush)] text-[var(--color-blush)] px-3 py-1.5 rounded-[4px] cursor-pointer hover:bg-[var(--color-cream)] transition-colors"
          >
            Leave admin
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 pb-2 overflow-x-auto">
          {[
            { id: 'messages', label: 'notes' },
            { id: 'words', label: 'words' },
            { id: 'photos', label: 'gallery' },
            { id: 'guestbook', label: 'registry' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2 rounded-[4px] text-xs uppercase tracking-[0.1em] font-medium cursor-pointer whitespace-nowrap transition-colors"
              style={{
                background: activeTab === tab.id ? 'var(--color-ink)' : 'var(--color-cream)',
                color: activeTab === tab.id ? 'var(--color-cream)' : 'var(--color-dust)',
                border: `1px solid ${activeTab === tab.id ? 'var(--color-ink)' : 'var(--color-dust)'}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="space-y-4 min-h-[350px]">
          {activeTab === 'messages' && (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="p-4 bg-[var(--color-cream)] rounded-[4px] border border-[var(--color-dust)]/20 flex justify-between gap-4 items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-light text-[var(--color-ink)]">"{msg.message}"</p>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-dust)]">— {msg.guest_name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete('messages', msg.id)}
                    className="text-[10px] uppercase tracking-wider text-[var(--color-blush)] hover:underline cursor-pointer flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-xs py-12 text-[var(--color-dust)]">No messages found.</p>}
            </div>
          )}

          {activeTab === 'words' && (
            <div className="space-y-3">
              {words.map((word) => (
                <div key={word.id} className="p-4 bg-[var(--color-cream)] rounded-[4px] border border-[var(--color-dust)]/20 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-light border border-[var(--color-dust)]/40 px-3 py-1.5 rounded-[2px] text-[var(--color-sepia)] font-[family-name:var(--font-display)] bg-[#FAF7F2]">{word.word}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-dust)]">by {word.guest_name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete('one_word', word.id)}
                    className="text-[10px] uppercase tracking-wider text-[var(--color-blush)] hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {words.length === 0 && <p className="text-center text-xs py-12 text-[var(--color-dust)]">No words found.</p>}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="grid grid-cols-2 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="p-3 bg-[var(--color-cream)] rounded-[4px] border border-[var(--color-dust)]/20 space-y-3">
                  <div className="aspect-square rounded-[2px] overflow-hidden bg-black/5">
                    {photo.type === 'video' ? (
                      <video src={photo.photo_url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={photo.photo_url} alt="Memory" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--color-dust)]">{photo.guest_name} ({photo.type})</span>
                    <button
                      onClick={() => handleDelete('photos', photo.id)}
                      className="text-[10px] uppercase tracking-wider text-[var(--color-blush)] hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {photos.length === 0 && <p className="text-center text-xs py-12 text-[var(--color-dust)] col-span-2">No photos or videos found.</p>}
            </div>
          )}

          {activeTab === 'guestbook' && (
            <div className="space-y-3">
              {guestbook.map((entry) => (
                <div key={entry.id} className="p-4 bg-[var(--color-cream)] rounded-[4px] border border-[var(--color-dust)]/20 flex justify-between gap-4 items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-light text-[var(--color-ink)]">"{entry.message}"</p>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-dust)]">— {entry.guest_name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete('guestbook', entry.id)}
                    className="text-[10px] uppercase tracking-wider text-[var(--color-blush)] hover:underline cursor-pointer flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {guestbook.length === 0 && <p className="text-center text-xs py-12 text-[var(--color-dust)]">No guestbook entries found.</p>}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
