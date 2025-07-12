import React from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppContextProviders } from '@/components/layout';
import { LoginView } from '@/components/auth/LoginView';
import { SessionContext } from '@/context/SessionContext';

import 'react-native-reanimated';

export const MainLayout = () => {
  const { currentSession, addSession } = React.use(SessionContext);

  if (!currentSession) {
    // If no tenant is selected, redirect to the login view.
    return <LoginView onLoginSuccess={addSession} />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AppContextProviders>
      <MainLayout />
      <StatusBar style="auto" />
    </AppContextProviders>
  );
}
