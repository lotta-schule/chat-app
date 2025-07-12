import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGqlUrl } from '@/config';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { use, useMemo } from 'react';
import type { Session } from '../auth';
import type { TenantLight } from '../tenant';
import { persistCache, AsyncStorageWrapper } from 'apollo3-cache-persist';
import { PromiseOrValue } from 'graphql/jsutils/PromiseOrValue';

type CreateApolloClientOptions = {
  cache?: PromiseOrValue<InMemoryCache>;
};

export const createApolloClient = async (
  sessionOrTenant: Session | TenantLight,
  options: CreateApolloClientOptions = {}
) => {
  const session = 'tenant' in sessionOrTenant ? sessionOrTenant : null;
  const tenant =
    (session?.tenant as Pick<TenantLight, 'id' | 'slug'>) || sessionOrTenant;

  // TODO: Better HTTPLink with token handling etc
  return new ApolloClient({
    uri: apiGqlUrl,
    cache: await (options.cache || new InMemoryCache()),
    headers: {
      'User-Agent': 'Lotta-Chat App',
      tenant: `id:${tenant.id}`,
      authorization: session?.auth.accessToken
        ? `Bearer ${session?.auth.accessToken}`
        : '',
    },
  });
};

const createPersistentCache = async () => {
  const cache = new InMemoryCache();
  return persistCache({
    cache,
    storage: new AsyncStorageWrapper(AsyncStorage),
    trigger: 'background',
    maxSize: 10485760, // 10MB
  }).then(() => cache);
};

export const useApolloClient = (session?: Session | TenantLight | null) => {
  const apolloClientPromise = useMemo(() => {
    if (!session) {
      return null;
    }
    return createApolloClient(session, { cache: createPersistentCache() });
  }, [session]);

  return use(apolloClientPromise || Promise.resolve(null));
};
