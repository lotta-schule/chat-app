import { memo, use } from 'react';
import { Stack } from 'expo-router';
import { LoginView } from '@/components/auth/LoginView';
import { SessionContext } from '@/context/SessionContext';
import { useApolloClient } from '@/lib/apollo';
import { ApolloProvider } from '@apollo/client';

export const AuthenticatedTenantRoot = memo(() => {
  const { currentSession, addSession } = use(SessionContext);
  const { client, isLoaded } = useApolloClient(currentSession);
  console.log({ client, isLoaded, currentSession });

  if (!isLoaded) {
    // If the Apollo client is not ready, we can return null or a loading state.
    return null; // or a loading spinner
  }

  if (!currentSession || !client) {
    // If no tenant is selected, redirect to the login view.
    return <LoginView onLoginSuccess={addSession} />;
  }

  return (
    <ApolloProvider client={client}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ApolloProvider>
  );
});
AuthenticatedTenantRoot.displayName = 'AuthenticatedTenantRoot';
