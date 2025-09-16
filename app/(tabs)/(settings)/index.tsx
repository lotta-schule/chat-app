import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';
import { SettingsSection, SettingsItem, UserProfileItem } from '@/components/ui/SettingsSection';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCurrentSession } from '@/context/SessionContext';
import { apiUrl } from '@/config';

const APP_VERSION = '1.0.0'; // From app.json
const GITHUB_URL = 'https://github.com/lotta-schule/chat-app';

export default function SettingsScreen() {
  const currentUser = useCurrentUser();
  const currentSession = useCurrentSession();

  const apiHost = useMemo(() => {
    try {
      return new URL(apiUrl).host;
    } catch {
      return apiUrl; // Fallback to original if URL parsing fails
    }
  }, []);

  const userAvatarUrl = useMemo(() => {
    return currentUser?.avatarImageFile?.formats?.find(f => f.url)?.url;
  }, [currentUser]);

  const userName = currentUser?.nickname || currentUser?.name || 'Unbekannter Benutzer';
  const tenantName = currentSession?.tenant?.slug || 'Unbekannter Tenant';
  const handleSendFeedback = useCallback(() => {
    Alert.alert(
      'Send Feedback',
      'This feature will be implemented soon.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleShowSourceCode = useCallback(async () => {
    try {
      await openBrowserAsync(GITHUB_URL);
    } catch (error) {
      Alert.alert(
        'Error',
        'Could not open the GitHub repository.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
      <SettingsSection title="angemeldet als">
        <UserProfileItem
          userName={userName}
          tenantName={tenantName}
          avatarUrl={userAvatarUrl}
        />
      </SettingsSection>

      <SettingsSection title="Lotta">
        <SettingsItem title="App Version" value={APP_VERSION} />
        <SettingsItem title="API Endpoint" value={apiHost} />
        <SettingsItem
          title="Send Feedback"
          onPress={handleSendFeedback}
          showChevron
        />
        <SettingsItem
          title="Show source code"
          onPress={handleShowSourceCode}
          showChevron
        />
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: 20,
  },
});
