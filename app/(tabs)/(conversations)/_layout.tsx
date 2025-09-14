import { Stack } from 'expo-router';

export default function ConversationsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Nachrichten' }}
      />
      <Stack.Screen
        name="[conversationId]"
        options={{ title: 'Chat' }}
      />
    </Stack>
  );
}
