import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GuestProvider, useGuest } from './hooks/useGuest';
import EventGate from './components/guest/EventGate';
import FilmGrain from './components/layout/FilmGrain';
import Navigation from './components/layout/Navigation';
import GuestRegistration from './components/guest/GuestRegistration';
import LandingPage from './pages/LandingPage';
import GuestDashboardPage from './pages/GuestDashboardPage';
import HerPage from './pages/HerPage';
import AdminPage from './pages/AdminPage';
import OneWordPage from './pages/OneWordPage';
import MessagesPage from './pages/MessagesPage';
import CameraPage from './pages/CameraPage';
import CapsulePage from './pages/CapsulePage';
import GamesPage from './pages/GamesPage';
import MafiaPage from './pages/MafiaPage';
import GuestbookPage from './pages/GuestbookPage';
import { useEffect } from 'react';

/* Auto-prompt for name if not registered yet */
function AutoPromptGuest({ children }: { children: React.ReactNode }) {
  const { isRegistered, setShowRegistration } = useGuest();

  useEffect(() => {
    if (!isRegistered) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setShowRegistration(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isRegistered, setShowRegistration]);

  return <>{children}</>;
}

function AppContent() {
  return (
    <>
      <FilmGrain />
      <GuestRegistration />
      <AutoPromptGuest>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/guest" element={<GuestDashboardPage />} />
            <Route path="/her" element={<HerPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/one-word" element={<OneWordPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/capsule" element={<CapsulePage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/mafia" element={<MafiaPage />} />
            <Route path="/guestbook" element={<GuestbookPage />} />
          </Routes>
        </AnimatePresence>
        <Navigation />
      </AutoPromptGuest>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <EventGate>
        <GuestProvider>
          <AppContent />
        </GuestProvider>
      </EventGate>
    </BrowserRouter>
  );
}
