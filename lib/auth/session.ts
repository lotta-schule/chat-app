import {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  AFTER_FIRST_UNLOCK,
} from 'expo-secure-store';

export type Session = {
  tenant: { id: number; slug: string };
  auth: { refreshToken: string; accessToken?: string };
};

export const storeTenantIds = (tenantIds: number[]) =>
  setItemAsync('lotta-tenants', JSON.stringify(tenantIds), {
    keychainAccessible: AFTER_FIRST_UNLOCK,
  });

export const getTenantIds = async (): Promise<number[]> =>
  getItemAsync('lotta-tenants', { keychainAccessible: AFTER_FIRST_UNLOCK })
    .then((value) => JSON.parse(value || '[]'))
    .catch(() => []);

export const storeCurrentTenantId = (tenantId: number) =>
  setItemAsync('lotta-current-tenant', tenantId.toString(), {
    keychainAccessible: AFTER_FIRST_UNLOCK,
  });

export const getCurrentTenantId = async (): Promise<number> =>
  getItemAsync('lotta-current-tenant', {
    keychainAccessible: AFTER_FIRST_UNLOCK,
  })
    .then((value) => parseInt(value || '0', 10) || 0)
    .catch(() => 0);

export const storeSessions = async (sessions: Session[]) => {
  await Promise.all(sessions.map((session) => storeTenantSession(session)));

  const tenantIds = sessions.map((session) => session.tenant.id);
  await storeTenantIds(tenantIds);
};

export const addSingleSession = async (session: Session) => {
  await storeTenantSession(session);

  const currentTenantIds = await getTenantIds();
  if (!currentTenantIds.includes(session.tenant.id)) {
    const updatedTenantIds = [...currentTenantIds, session.tenant.id];
    await storeTenantIds(updatedTenantIds);
  }
};

export const removeSingleSession = async (tenantId: number) => {
  await removeTenantSession(tenantId);

  const currentTenantIds = await getTenantIds();
  const updatedTenantIds = currentTenantIds.filter((id) => id !== tenantId);
  await storeTenantIds(updatedTenantIds);

  await clearAllTenantData(tenantId);
};

const getTenantStorageKey = (tenantId: number, dataType: string) =>
  `lotta-tenant-${tenantId}-${dataType}`;

export const storeTenantSession = async (session: Session) => {
  const key = getTenantStorageKey(session.tenant.id, 'session');
  return setItemAsync(key, JSON.stringify(session), {
    keychainAccessible: AFTER_FIRST_UNLOCK,
  });
};

export const getTenantSession = async (tenantId: number) => {
  try {
    const key = getTenantStorageKey(tenantId, 'session');
    const value = await getItemAsync(key, {
      keychainAccessible: AFTER_FIRST_UNLOCK,
    });
    if (!value) return null;

    const session: Session = JSON.parse(value);
    return validateSession(session);
  } catch (error) {
    console.error('Failed to get tenant session:', error);
    return null;
  }
};

export const removeTenantSession = async (tenantId: number) => {
  const key = getTenantStorageKey(tenantId, 'session');
  return deleteItemAsync(key, { keychainAccessible: AFTER_FIRST_UNLOCK });
};

export const clearAllTenantData = async (tenantId: number) => {
  try {
    // Remove session data for this tenant
    const sessionKey = getTenantStorageKey(tenantId, 'session');
    await deleteItemAsync(sessionKey, {
      keychainAccessible: AFTER_FIRST_UNLOCK,
    });

    // Future: Add removal of other tenant data types as needed
    // const chatKey = getTenantStorageKey(tenantId, 'chats');
    // await deleteItemAsync(chatKey, { keychainAccessibility: AFTER_FIRST_UNLOCK });
  } catch (error) {
    console.error('Failed to clear tenant data:', error);
    // Don't throw - allow cleanup to continue even if some data removal fails
  }
};

export const getStoredSessions = async () => {
  try {
    const tenantIds = await getTenantIds();

    // Get all sessions from encrypted storage
    const sessionPromises = tenantIds.map(async (tenantId) => {
      const session = await getTenantSession(tenantId);
      return session;
    });

    const sessions = await Promise.all(sessionPromises);

    // Filter out null sessions and validate
    return sessions
      .filter((session): session is Session => session !== null)
      .map(validateSession)
      .filter((session): session is Session => session !== null);
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return [];
  }
};

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
