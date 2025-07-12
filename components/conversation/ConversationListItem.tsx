import { ResultOf } from '@/api/graphql';
import { GET_CONVERSATIONS_QUERY } from '@/app/(tabs)/(conversations)/index';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ConversationHelper } from '@/lib/ConversationHelper';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Text, TouchableHighlight, View } from 'react-native';

export type ConversationListItemProps = {
  conversation: NonNullable<
    ResultOf<typeof GET_CONVERSATIONS_QUERY>['conversations']
  >[number];
  onPress: () => void;
};

export const ConversationListItem = memo(
  ({ conversation, onPress }: ConversationListItemProps) => {
    const currentUser = useCurrentUser();
    const otherUser =
      ConversationHelper.getOtherUsers(
        conversation as any,
        currentUser as any
      ).at(0) || (null as typeof currentUser | null);
    console.log(otherUser);
    return (
      <TouchableHighlight onPress={onPress} underlayColor="#ddd">
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <View style={{ flex: 0, width: 50 }}>
            <Image
              style={{ width: 50, height: 50, borderRadius: '50%' }}
              source={otherUser?.avatarImageFile?.formats?.find((f) => f.url)}
              contentFit="cover"
            />
          </View>
          <View style={{ flex: 1, padding: 10 }}>
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text style={{ fontWeight: 'bold' }}>
                {ConversationHelper.getTitle(conversation)}
              </Text>
              <Text style={{ fontSize: 12 }}>{conversation?.updatedAt}</Text>
            </View>
          </View>
          <View style={{ flex: 0, width: 25 }}>
            {conversation?.unreadMessages && (
              <View style={{ width: 25, height: 25, borderRadius: '50%' }}>
                <Text>{conversation?.unreadMessages}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableHighlight>
    );
  }
);
ConversationListItem.displayName = 'ConversationListItem';
