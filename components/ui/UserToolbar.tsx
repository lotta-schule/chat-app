import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export interface UserToolbarProps {
  children?: React.ReactNode;
}

export const UserToolbar = React.memo(({ children }: UserToolbarProps) => {
  const currentUser = useCurrentUser();
  const avatarUrl = currentUser?.avatarImageFile?.formats?.find(f => f.url)?.url;

  return (
    <View style={styles.toolbar}>
      <View style={styles.leftSection}>
        <Image
          style={styles.avatar}
          source={avatarUrl ? { uri: avatarUrl } : undefined}
          placeholder={require('@/assets/images/logo_s.png')}
          contentFit="cover"
        />
      </View>
      <View style={styles.centerSection}>
        {children}
      </View>
      <View style={styles.rightSection}>
        {/* Reserved for future actions */}
      </View>
    </View>
  );
});

UserToolbar.displayName = 'UserToolbar';

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerSection: {
    flex: 1,
    marginLeft: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dee2e6',
  },
});