import { graphql } from '@/api/graphql';
import { MessageListItem } from '@/components/conversation/MessageListItem';
import { MessageInputView } from '@/components/message-input/MessageInputView';
import { useQuery } from '@apollo/client';
import { useLocalSearchParams } from 'expo-router';
import { FlatList, SafeAreaView } from 'react-native';

export const GET_CONVERSATION_QUERY = graphql(`
  query GetConversation($id: ID!) {
    conversation(id: $id) {
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
        updatedAt
        content
        user {
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
        files {
          id
          filename
          filesize
          fileType
          formats(category: "PREVIEW") {
            name
            url
            type
          }
        }
      }
    }
  }
`);

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams();
  const { data } = useQuery(GET_CONVERSATION_QUERY, {
    variables: {
      id: conversationId as string,
    },
  });

  return (
    <SafeAreaView
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        marginBottom: 50,
      }}
    >
      <FlatList
        inverted
        snapToEnd
        style={{ flex: 1 }}
        data={data?.conversation?.messages || []}
        renderItem={({ item }) => (
          <MessageListItem message={item} onPress={() => {}} />
        )}
      />
      <MessageInputView onSend={async (msg) => alert(msg)} />
    </SafeAreaView>
  );
}
