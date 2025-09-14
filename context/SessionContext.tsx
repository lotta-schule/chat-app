import {
  ContextType,
  createContext,
  PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getStoredSessions, Session, storeSessions } from '@/lib/auth';

export const SessionContext = createContext<{
  sessions: Session[];
  currentSession: Session | null;
  currentTenantId: number;
  addSession: (session: Session) => void;
}>({
  sessions: [],
  currentSession: null,
  currentTenantId: 0,
  addSession: () => {},
});

export const SessionContextProvider = ({ children }: PropsWithChildren) => {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<number>(0);

  const sessionsRef = useRef(sessions);

  const currentSession = useMemo(
    () =>
      sessions?.find((session) => session.tenant.id === currentTenantId) ||
      null,
    [sessions, currentTenantId]
  );

  const addSession = useCallback((session: Session) => {
    setSessions((prevSessions) => {
      if (!prevSessions) {
        return [session];
      }
      const existingIndex = prevSessions.findIndex(
        (s) => s.tenant.id === session.tenant.id
      );
      if (existingIndex !== -1) {
        const updatedSessions = [...prevSessions];
        updatedSessions[existingIndex] = session;
        storeSessions(updatedSessions);
        return updatedSessions;
      }
      return [...prevSessions, session];
    });
    setCurrentTenantId(session.tenant.id);
  }, []);

  useEffect(() => {
    getStoredSessions().then((storedSessions) => {
      if (sessionsRef.current?.length) {
        // Someone may have logged in very very fast???
        setSessions([...sessionsRef.current, ...storedSessions]);
        return;
      }
      setSessions(storedSessions);
    });
  }, []);

  const value = useMemo(
    () => ({
      sessions,
      currentSession,
      currentTenantId,
      addSession,
    }),
    [sessions, currentSession, currentTenantId, addSession]
  );

  if (value.sessions === null) {
    // still loading
    return null;
  }

  return (
    <SessionContext.Provider
      value={value as ContextType<typeof SessionContext>}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useCurrentSession = () => {
  const context = use(SessionContext);
  return context?.currentSession || null;
};
