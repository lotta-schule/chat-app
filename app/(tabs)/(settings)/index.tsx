import React, { useCallback, useMemo, useState, useContext } from 'react';
import { ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';
import {
  SettingsSection,
  SettingsItem,
} from '@/components/ui/SettingsSection';
import { UserProfileItem } from '@/components/ui/UserProfileItem';
import { useCurrentSession, SessionContext } from '@/context/SessionContext';
import { apiUrl } from '@/config';
import { LoginView } from '@/components/auth/LoginView';

const APP_VERSION = '1.0.0'; // From app.json
const GITHUB_URL = 'https://github.com/lotta-schule/chat-app';

export default function SettingsScreen() {
  const currentSession = useCurrentSession();
  const { sessions, addSession, switchToSession } = useContext(SessionContext);
  const [isShowLoginModal, setIsShowLoginModal] = useState(false);

  const apiHost = useMemo(() => {
    try {
      return new URL(apiUrl).host;
    } catch {
      return apiUrl; // Fallback to original if URL parsing fails
    }
  }, []);
  const handleSendFeedback = useCallback(() => {
    Alert.alert('Send Feedback', 'This feature will be implemented soon.', [
      { text: 'OK' },
    ]);
  }, []);

  const handleShowSourceCode = useCallback(async () => {
    try {
      await openBrowserAsync(GITHUB_URL);
    } catch (error: any) {
      Alert.alert('Error', 'Could not open the GitHub repository.', [
        { text: 'OK' },
      ]);
    }
  }, []);

  const handleAddAccount = useCallback(() => {
    setIsShowLoginModal(true);
  }, []);

  const onCloseModal = useCallback(
    (session?: any) => {
      if (session) {
        addSession(session);
      }
      setIsShowLoginModal(false);
    },
    [addSession]
  );

  const handleSessionSwitch = useCallback(
    (tenantId: number) => {
      if (tenantId !== currentSession?.tenant.id) {
        switchToSession(tenantId);
      }
    },
    [currentSession?.tenant.id, switchToSession]
  );

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
    >
      <SettingsSection title="angemeldet als">
        {sessions?.map((session) => {
          const isCurrentSession =
            session.tenant.id === currentSession?.tenant.id;

          return (
            <UserProfileItem
              key={session.tenant.id}
              session={session}
              onPress={() => handleSessionSwitch(session.tenant.id)}
              isCurrent={isCurrentSession}
            />
          );
        })}
        <SettingsItem
          title="Benutzerkonto hinzufügen"
          onPress={handleAddAccount}
          showChevron
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

      <Modal
        visible={isShowLoginModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => onCloseModal()}
      >
        <LoginView onLoginSuccess={onCloseModal} />
      </Modal>
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
