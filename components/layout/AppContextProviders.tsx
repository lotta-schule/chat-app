import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { SessionContextProvider, useCurrentSession } from '@/context';
import { useApolloClient } from '@/lib/apollo';

export const AppContextProviders = React.memo(
  ({ children }: React.PropsWithChildren) => {
    const currentSession = useCurrentSession();
    console.log({ currentSession });
    const client = useApolloClient(currentSession);

    if (!client) {
      return null;
    }

    return (
      <ActionSheetProvider>
        <ThemeProvider value={DefaultTheme}>
          <ApolloProvider client={client}>
            <SessionContextProvider>{children}</SessionContextProvider>
          </ApolloProvider>
        </ThemeProvider>
      </ActionSheetProvider>
    );
  }
);
AppContextProviders.displayName = 'TenantContextProviders';
