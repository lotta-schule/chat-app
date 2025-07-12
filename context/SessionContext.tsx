import {
  createContext,
  PropsWithChildren,
  use,
  useCallback,
  useMemo,
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
  const storedSessions = use(getStoredSessions());
  const [sessions, setSessions] = useState(storedSessions);
  const [currentTenantId, setCurrentTenantId] = useState<number>(0);

  const currentSession = useMemo(
    () =>
      sessions.find((session) => session.tenant.id === currentTenantId) || null,
    [sessions, currentTenantId]
  );

  const addSession = useCallback((session: Session) => {
    setSessions((prevSessions) => {
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

  const value = useMemo(
    () => ({
      sessions,
      currentSession,
      currentTenantId,
      addSession,
    }),
    [sessions, currentSession, currentTenantId, addSession]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useCurrentSession = () => {
  const context = use(SessionContext);
  return context?.currentSession || null;
};
