import { ResultOf } from '@/api/graphql';
import { GET_CONVERSATION_QUERY } from '@/app/(tabs)/(conversations)/[conversationId]';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Text, TouchableHighlight, View } from 'react-native';

export type MessageListItemProps = {
  message: NonNullable<
    NonNullable<
      ResultOf<typeof GET_CONVERSATION_QUERY>['conversation']
    >['messages']
  >[number];
  onPress: () => void;
};

export const MessageListItem = memo(
  ({ message, onPress }: MessageListItemProps) => {
    console.log({ otherUser: message.user });
    console.log({ otherUserFormats: message.user?.avatarImageFile?.formats });
    console.log({
      otherUserUrl: message.user?.avatarImageFile?.formats?.find((f) => f.url),
    });
    return (
      <TouchableHighlight onPress={onPress} underlayColor="#ddd">
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
          }}
        >
          <View style={{ flex: 0, width: 50 }}>
            <Image
              style={{ width: 40, height: 40, margin: 5, borderRadius: '50%' }}
              source={
                message.user?.avatarImageFile?.formats?.find((f) => f.url)?.url
              }
            />
          </View>
          <View style={{ flex: 1, padding: 10 }}>
            <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text>{message.content}</Text>
              <Text style={{ fontSize: 12 }}>{message.updatedAt}</Text>
            </View>
          </View>
          <View style={{ flex: 0, width: 25 }}></View>
        </View>
      </TouchableHighlight>
    );
  }
);
MessageListItem.displayName = 'MessageListItem';
