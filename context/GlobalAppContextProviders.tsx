import { PropsWithChildren } from 'react';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

export const GlobalAppContextProviders = ({ children }: PropsWithChildren) => {
  return <ActionSheetProvider>{children}</ActionSheetProvider>;
};
