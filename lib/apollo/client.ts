import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGqlUrl, apiBaseUrl } from '@/config';
import {
  ApolloClient,
  InMemoryCache,
  from,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useEffect, useMemo, useState } from 'react';
import type { Session } from '../auth';
import type { TenantLight } from '../tenant';
import { persistCache, AsyncStorageWrapper } from 'apollo3-cache-persist';
import { storeTenantSession, removeSingleSession } from '../auth';
import { isTokenExpired } from '@/lib/jwt';

const getAuthHeader = async (session: Session | null) => {
  if (!session) return undefined;

  if (session.auth.accessToken && !isTokenExpired(session.auth.accessToken)) {
    return `Bearer ${session.auth.accessToken}`;
  }

  if (
    !session.auth.refreshToken ||
    isTokenExpired(session.auth.refreshToken, 0)
  ) {
    await removeSingleSession(session.tenant.id);
    return undefined;
  }

  const newToken = await refreshToken(session);
  if (!newToken) {
    await removeSingleSession(session.tenant.id);
    return undefined;
  }

  session.auth.accessToken = newToken;
  return `Bearer ${newToken}`;
};

const refreshToken = async (session: Session): Promise<string | null> => {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Lotta-Chat App',
        tenant: `id:${session.tenant.id}`,
      },
      body: `token=${encodeURIComponent(session.auth.refreshToken)}`,
    });

    const result = await response.json();

    if (result.accessToken && result.refreshToken) {
      const updatedSession: Session = {
        ...session,
        auth: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };

      await storeTenantSession(updatedSession);
      return result.accessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

export const createApolloClient = (
  sessionOrTenant: Session | TenantLight,
  options: {
    cache?: InMemoryCache | null;
  } = {}
) => {
  const session = 'tenant' in sessionOrTenant ? sessionOrTenant : null;
  const tenant =
    (session?.tenant as Pick<TenantLight, 'id' | 'slug'>) || sessionOrTenant;
  console.log({ sessionOrTenant, session, tenant });

  const httpLink = createHttpLink({
    uri: apiGqlUrl,
  });

  const authLink = setContext(async (_, { headers }) => {
    const authorization = await getAuthHeader(session);
    return {
      headers: {
        ...headers,
        'User-Agent': 'Lotta-Chat App',
        tenant: `id:${tenant.id}`,
        authorization,
      },
    };
  });

  const link = from([authLink, httpLink]);

  return new ApolloClient({
    link,
    cache: options.cache || new InMemoryCache(),
  });
};

const usePotentiallyPersistentCache = (
  sessionOrTenant?: Session | TenantLight | null
) => {
  const [cache, setCache] = useState<InMemoryCache | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    if (!sessionOrTenant) {
      return setIsLoaded(true);
    }

    const cache = new InMemoryCache();

    if (!('auth' in sessionOrTenant)) {
      // For non-session users, no need for persistence
      setCache(cache);
      return setIsLoaded(true);
    }

    persistCache({
      cache,
      storage: new AsyncStorageWrapper(AsyncStorage),
      trigger: 'background',
      maxSize: 10485760, // 10MB
      key: `apollo-cache-persist-${sessionOrTenant.tenant.id}`,
    }).then(() => {
      setCache(cache);
      setIsLoaded(true);
    });
  }, [sessionOrTenant]);

  return useMemo(() => ({ cache, isLoaded: isLoaded }), [cache, isLoaded]);
};

export const useApolloClient = (
  sessionOrTenant?: Session | TenantLight | null
) => {
  const { cache, isLoaded } = usePotentiallyPersistentCache(sessionOrTenant);

  return useMemo(() => {
    if (!sessionOrTenant) {
      return { client: null, isLoaded: true };
    }

    if (!isLoaded) {
      return { client: null, isLoaded };
    }

    return { client: createApolloClient(sessionOrTenant, { cache }), isLoaded };
  }, [sessionOrTenant, isLoaded, cache]);
};
