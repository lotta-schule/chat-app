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
import { getStoredSessions, Session, addSingleSession, removeSingleSession, storeCurrentTenantId, getCurrentTenantId } from '@/lib/auth';

export const SessionContext = createContext<{
  sessions: Session[];
  currentSession: Session | null;
  currentTenantId: number;
  addSession: (session: Session) => void;
  switchToSession: (tenantId: number) => void;
  removeSession: (tenantId: number) => void;
}>({
  sessions: [],
  currentSession: null,
  currentTenantId: 0,
  addSession: () => {},
  switchToSession: () => {},
  removeSession: () => {},
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

  const addSession = useCallback(async (session: Session) => {
    try {
      // Store session in encrypted storage
      await addSingleSession(session);

      // Update local state
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
          return updatedSessions;
        }
        return [...prevSessions, session];
      });

      // Update current tenant
      setCurrentTenantId(session.tenant.id);
      storeCurrentTenantId(session.tenant.id);
    } catch (error) {
      console.error('Failed to add session:', error);
    }
  }, []);

  const switchToSession = useCallback((tenantId: number) => {
    setCurrentTenantId(tenantId);
    storeCurrentTenantId(tenantId);
  }, []);

  const removeSession = useCallback(async (tenantId: number) => {
    try {
      // Remove from encrypted storage
      await removeSingleSession(tenantId);

      // Update local state
      setSessions((prevSessions) => {
        if (!prevSessions) return prevSessions;

        const updatedSessions = prevSessions.filter(session => session.tenant.id !== tenantId);

        // If we're removing the current session, switch to another one or reset
        if (tenantId === currentTenantId) {
          if (updatedSessions.length > 0) {
            const newCurrentId = updatedSessions[0].tenant.id;
            setCurrentTenantId(newCurrentId);
            storeCurrentTenantId(newCurrentId);
          } else {
            setCurrentTenantId(0);
            storeCurrentTenantId(0);
          }
        }

        return updatedSessions;
      });
    } catch (error) {
      console.error('Failed to remove session:', error);
    }
  }, [currentTenantId]);

  useEffect(() => {
    Promise.all([getStoredSessions(), getCurrentTenantId()]).then(([storedSessions, savedTenantId]) => {
      if (sessionsRef.current?.length) {
        // Someone may have logged in very very fast???
        setSessions([...sessionsRef.current, ...storedSessions]);
        return;
      }
      setSessions(storedSessions);

      // Restore the last selected tenant if it exists in the stored sessions
      if (savedTenantId && storedSessions.some(session => session.tenant.id === savedTenantId)) {
        setCurrentTenantId(savedTenantId);
      } else if (storedSessions.length > 0) {
        // If no saved tenant or saved tenant doesn't exist, use the first available session
        const firstTenantId = storedSessions[0].tenant.id;
        setCurrentTenantId(firstTenantId);
        storeCurrentTenantId(firstTenantId);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      sessions,
      currentSession,
      currentTenantId,
      addSession,
      switchToSession,
      removeSession,
    }),
    [sessions, currentSession, currentTenantId, addSession, switchToSession, removeSession]
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
