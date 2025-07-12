import { getItemAsync, setItemAsync } from 'expo-secure-store';

export type Session = {
  tenant: { id: number; slug: string };
  auth: { refreshToken: string; accessToken?: string };
};

export const storeSessions = (sessions: Session[]) =>
  setItemAsync('lotta-session', JSON.stringify(sessions));

export const getStoredSessions = async (): Promise<Session[]> =>
  getItemAsync('lotta-session')
    .then((value) => JSON.parse(value || '[]').map(validateSession))
    .catch((error) => {
      console.error('Failed to get sessions:', error);
      return [];
    });

export const validateSession = <T extends unknown>(
  session: T
): T extends Session ? T : null => {
  // TODO: zod?
  if (!session || typeof session !== 'object') {
    return null as any;
  }
  const { tenant, auth } = session as unknown as Session;
  if (!tenant?.id || !tenant?.slug || !auth?.refreshToken) {
    return null as any;
  }
  // TODO: Validate refreshToken validity period
  // const { refreshToken } = auth;
  // if (getRefreshTokenValidityPeriod(refreshToken) < 0) { return null as any; } oder so
  return session as any;
};
