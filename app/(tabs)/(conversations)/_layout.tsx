import { Stack } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserToolbar } from '@/components/ui/UserToolbar';
import { IconSymbol } from '@/components/ui/IconSymbol';

const ExtendedHeader = ({
  title,
  navigation,
  back,
}: {
  title: string;
  navigation: any;
  back?: any;
}) => (
  <View style={styles.extendedHeaderContainer}>
    <UserToolbar />
    <View style={styles.defaultHeaderContainer}>
      <View style={styles.headerContent}>
        {back && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <IconSymbol name="chevron.left" size={18} color="#007AFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRight} />
      </View>
    </View>
  </View>
);

export default function ConversationsLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options, navigation, back }) => (
          <ExtendedHeader
            title={options.title || 'Chat'}
            navigation={navigation}
            back={back}
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
  extendedHeaderContainer: {
    paddingTop: 44, // Account for status bar on iOS
    backgroundColor: '#f8f9fa',
  },
  defaultHeaderContainer: {
    height: 44,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  headerRight: {
    width: 34, // Balance the back button space (padding + icon width)
  },
});
