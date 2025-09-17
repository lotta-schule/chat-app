import { Stack } from 'expo-router';
import React from 'react';
import { Button, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function ConversationsLayout() {
  const currentUser = useCurrentUser();
  const avatarUrl = currentUser?.avatarImageFile?.formats?.find(
    (f) => f.url
  )?.url;
  return (
    <Stack
      screenOptions={{
        headerLeft: ({ canGoBack }) =>
          canGoBack ? undefined : (
            <Image
              style={styles.avatar}
              source={avatarUrl ? { uri: avatarUrl } : undefined}
              placeholder={require('@/assets/images/logo_s.png')}
              contentFit="cover"
            />
          ),
        headerRight: () => (
          <Button
            title="+"
            onPress={() => {
              alert('TODO');
            }}
          />
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Nachrichten' }} />
      <Stack.Screen name="[conversationId]" options={{ title: 'Chat' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 16,
  },
  headerRight: {
    width: 32,
  },
});
