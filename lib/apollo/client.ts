import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGqlUrl } from '@/config';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import type { Session } from '../auth';
import type { TenantLight } from '../tenant';
import { persistCache, AsyncStorageWrapper } from 'apollo3-cache-persist';

export const createApolloClient = (
  sessionOrTenant: Session | TenantLight,
  options: {
    cache?: InMemoryCache | null;
  } = {}
) => {
  const session = 'tenant' in sessionOrTenant ? sessionOrTenant : null;
  const tenant =
    (session?.tenant as Pick<TenantLight, 'id' | 'slug'>) || sessionOrTenant;

  // TODO: Better HTTPLink with token handling etc
  return new ApolloClient({
    uri: apiGqlUrl,
    cache: options.cache || new InMemoryCache(),
    headers: {
      'User-Agent': 'Lotta-Chat App',
      tenant: `id:${tenant.id}`,
      authorization: session?.auth.accessToken
        ? `Bearer ${session?.auth.accessToken}`
        : '',
    },
  });
};

const usePotentiallyPersistentCache = (
  sessionOrTenant?: Session | TenantLight | null
) => {
  const [cache, setCache] = useState<InMemoryCache | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
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
