import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface GuestSession {
  name: string;
  relationship: string;
}

interface GuestContextType {
  guestName: string | null;
  guestRelationship: string | null;
  isRegistered: boolean;
  registerGuest: (name: string, relationship: string) => void;
  showRegistration: boolean;
  setShowRegistration: (show: boolean) => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

const GUEST_NAME_KEY = 'guest_name';
const GUEST_REL_KEY = 'guest_relationship';

export function GuestProvider({ children }: { children: ReactNode }) {
  const [guestName, setGuestName] = useState<string | null>(null);
  const [guestRelationship, setGuestRelationship] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedName = localStorage.getItem(GUEST_NAME_KEY);
    const storedRel = localStorage.getItem(GUEST_REL_KEY);
    if (storedName) {
      setGuestName(storedName);
      setGuestRelationship(storedRel);
    }
  }, []);

  const registerGuest = useCallback((name: string, relationship: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    localStorage.setItem(GUEST_NAME_KEY, trimmed);
    localStorage.setItem(GUEST_REL_KEY, relationship);
    setGuestName(trimmed);
    setGuestRelationship(relationship);
    setShowRegistration(false);
  }, []);

  return (
    <GuestContext.Provider value={{
      guestName,
      guestRelationship,
      isRegistered: !!guestName,
      registerGuest,
      showRegistration,
      setShowRegistration,
    }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
}
