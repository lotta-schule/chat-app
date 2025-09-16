import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@apollo/client';
import { useApolloClient } from '@/lib/apollo/client';
import { graphql } from '@/api/graphql';
import { Session } from '@/lib/auth';

const GET_CURRENT_USER = graphql(`
  query GetCurrentUser {
    currentUser {
      id
      name
      nickname
      email
      avatarImageFile {
        id
        formats(category: "AVATAR") {
          name
          url
        }
      }
    }
  }
`);

export interface UserProfileItemProps {
  session: Session;
  onPress?: () => void;
  isLast?: boolean;
  isCurrent?: boolean;
}

export const UserProfileItem: React.FC<UserProfileItemProps> = ({
  session,
  onPress,
  isLast = false,
  isCurrent = false
}) => {
  const { client } = useApolloClient(session);
  const { data } = useQuery(GET_CURRENT_USER, {
    client: client || undefined,
    skip: !client,
  });

  const Component = onPress ? TouchableOpacity : View;
  const user = data?.currentUser;
  const userName = user?.nickname || user?.name || session.tenant.slug;
  const tenantName = session.tenant.slug;
  const avatarUrl = user?.avatarImageFile?.formats?.find(f => f.url)?.url;

  return (
    <Component
      style={[styles.item, isLast && styles.itemLast, isCurrent && styles.currentItem]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.userProfileContent}>
        <Image
          style={styles.avatar}
          source={avatarUrl ? { uri: avatarUrl } : undefined}
          contentFit="cover"
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.tenantName}>{tenantName}</Text>
        </View>
        {isCurrent && (
          <Text style={styles.currentIndicator}>✓</Text>
        )}
      </View>
    </Component>
  );
};

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  userProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dee2e6',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  tenantName: {
    fontSize: 15,
    color: '#8E8E93',
  },
  currentItem: {
    backgroundColor: '#F0F8FF',
  },
  currentIndicator: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});