import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface GuestContextType {
  guestId: string | null;
  guestName: string | null;
  guestAvatar: string | null;
  guestRelationship: string | null;
  isRegistered: boolean;
  registerGuest: (id: string, name: string, avatar?: string) => void;
  showRegistration: boolean;
  setShowRegistration: (show: boolean) => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

const GUEST_ID_KEY = 'guest_id';
const GUEST_NAME_KEY = 'guest_name';
const GUEST_AVATAR_KEY = 'guest_avatar';
const GUEST_REL_KEY = 'guest_relationship';

export function GuestProvider({ children }: { children: ReactNode }) {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [guestAvatar, setGuestAvatar] = useState<string | null>(null);
  const [guestRelationship, setGuestRelationship] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem(GUEST_ID_KEY);
    const storedName = localStorage.getItem(GUEST_NAME_KEY);
    const storedAvatar = localStorage.getItem(GUEST_AVATAR_KEY);
    const storedRel = localStorage.getItem(GUEST_REL_KEY);
    if (storedId || storedName) {
      setGuestId(storedId || storedName?.toLowerCase() || null);
      setGuestName(storedName);
      setGuestAvatar(storedAvatar);
      setGuestRelationship(storedRel || 'Friend');
    }
  }, []);

  const registerGuest = useCallback((id: string, name: string, avatar?: string) => {
    const trimmedId = id.trim();
    const trimmedName = name.trim();
    if (!trimmedId || !trimmedName) return;

    localStorage.setItem(GUEST_ID_KEY, trimmedId);
    localStorage.setItem(GUEST_NAME_KEY, trimmedName);
    if (avatar) {
      localStorage.setItem(GUEST_AVATAR_KEY, avatar);
    } else {
      localStorage.removeItem(GUEST_AVATAR_KEY);
    }
    localStorage.setItem(GUEST_REL_KEY, 'Friend');

    setGuestId(trimmedId);
    setGuestName(trimmedName);
    setGuestAvatar(avatar || null);
    setGuestRelationship('Friend');
    setShowRegistration(false);
  }, []);

  return (
    <GuestContext.Provider value={{
      guestId,
      guestName,
      guestAvatar,
      guestRelationship,
      isRegistered: !!guestId || !!guestName,
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

