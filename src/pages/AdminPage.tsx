import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGuest } from '../hooks/useGuest';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Message, OneWord, Photo, GuestbookEntry } from '../types/database';
import PageWrapper from '../components/layout/PageWrapper';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Moderation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [words, setWords] = useState<OneWord[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'words' | 'photos' | 'guestbook'>('messages');

  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  useEffect(() => {
    const isAuthed = sessionStorage.getItem('admin_authorized');
    if (isAuthed === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      sessionStorage.setItem('admin_authorized', 'true');
      setIsAdmin(true);
      setError('');
    } else {
      setError('Incorrect password!');
    }
  };

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

  if (!isAdmin) {
    return (
      <PageWrapper>
        <div className="min-h-[80vh] flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center space-y-6">
            <span className="text-5xl">🔐</span>
            <h1
              className="text-2xl font-light"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
            >
              Admin Moderation
            </h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Admin Password"
                className="w-full px-4 py-3 rounded-xl text-center text-sm outline-none"
                style={{
                  background: 'var(--color-cream)',
                  color: 'var(--color-text)',
                  border: '1px solid rgba(93, 64, 55, 0.08)',
                }}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer"
                style={{
                  background: 'var(--color-brown)',
                  color: 'var(--color-cream)',
                }}
              >
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="film-grain pointer-events-none fixed inset-0 z-40 opacity-[0.03]" />

      <div className="px-6 pt-20 pb-12 max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1
              className="text-2xl font-light"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
            >
              Moderation Desk
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Manage all surprises and memory assets
            </p>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_authorized');
              setIsAdmin(false);
            }}
            className="text-[10px] uppercase tracking-wider border border-red-200 text-red-500 px-3 py-1 rounded-md"
          >
            Logout
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 border-b border-gray-100 pb-2 overflow-x-auto">
          {[
            { id: 'messages', label: 'Notes 💌' },
            { id: 'words', label: 'Words ✨' },
            { id: 'photos', label: 'Gallery 📸' },
            { id: 'guestbook', label: 'Registry 📝' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
              style={{
                background: activeTab === tab.id ? 'var(--color-brown)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-cream)' : 'var(--color-text-muted)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="space-y-3 min-h-[350px]">
          {activeTab === 'messages' && (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="p-4 bg-white rounded-xl shadow-sm border border-gray-50 flex justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-brown)' }}>"{msg.message}"</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>— {msg.guest_name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete('messages', msg.id)}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-xs py-10" style={{ color: 'var(--color-text-muted)' }}>No messages found.</p>}
            </div>
          )}

          {activeTab === 'words' && (
            <div className="space-y-3">
              {words.map((word) => (
                <div key={word.id} className="p-4 bg-white rounded-xl shadow-sm border border-gray-50 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold bg-[var(--color-cream)] px-3 py-1.5 rounded-lg text-[var(--color-accent-dark)]">{word.word}</span>
                    <span className="text-xs ml-3" style={{ color: 'var(--color-text-muted)' }}>by {word.guest_name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete('one_word', word.id)}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {words.length === 0 && <p className="text-center text-xs py-10" style={{ color: 'var(--color-text-muted)' }}>No words found.</p>}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="p-3 bg-white rounded-xl shadow-sm border border-gray-50 space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {photo.type === 'video' ? (
                      <video src={photo.photo_url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={photo.photo_url} alt="Memory" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>{photo.guest_name} ({photo.type})</span>
                    <button
                      onClick={() => handleDelete('photos', photo.id)}
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {photos.length === 0 && <p className="text-center text-xs py-10 col-span-2" style={{ color: 'var(--color-text-muted)' }}>No photos or videos found.</p>}
            </div>
          )}

          {activeTab === 'guestbook' && (
            <div className="space-y-3">
              {guestbook.map((entry) => (
                <div key={entry.id} className="p-4 bg-white rounded-xl shadow-sm border border-gray-50 flex justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-brown)' }}>"{entry.message}"</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>— {entry.guest_name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete('guestbook', entry.id)}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {guestbook.length === 0 && <p className="text-center text-xs py-10" style={{ color: 'var(--color-text-muted)' }}>No guestbook entries found.</p>}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
