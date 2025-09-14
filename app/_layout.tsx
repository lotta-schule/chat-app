import React, { Suspense } from 'react';
import { GlobalAppContextProviders, SessionContextProvider } from '@/context';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { AuthenticatedTenantRoot } from '@/components/layout';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';

import 'react-native-reanimated';

if (__DEV__) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GlobalAppContextProviders>
      <Suspense fallback={null}>
        <SessionContextProvider>
          <AuthenticatedTenantRoot />
          <StatusBar style="auto" />
        </SessionContextProvider>
      </Suspense>
    </GlobalAppContextProviders>
  );
}
