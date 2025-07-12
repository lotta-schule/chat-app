import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client';
import { graphql } from 'api/graphql';
import { ConversationListItem } from '@/components/conversation/ConversationListItem';

export const GET_CONVERSATIONS_QUERY = graphql(`
  query GetConversations {
    conversations {
      id
      updatedAt
      unreadMessages
      groups {
        id
        name
      }
      users {
        id
        name
        nickname
        avatarImageFile {
          id
          formats(category: "AVATAR") {
            name
            availability {
              status
            }
            url
            type
          }
        }
      }
      messages {
        id
      }
    }
  }
`);

export default function ConversationsScreen() {
  const router = useRouter();

  const { data } = useQuery(GET_CONVERSATIONS_QUERY, {});

  return (
    <View style={styles.rootView}>
      <FlatList
        data={data?.conversations || []}
        renderItem={({ item }) => (
          <ConversationListItem
            conversation={item}
            onPress={() => {
              router.push(`/${item?.id}`);
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
});
