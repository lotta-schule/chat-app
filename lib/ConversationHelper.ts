import { ResultOf } from '@/api/graphql';
import { GET_CONVERSATIONS_QUERY } from '@/app/(tabs)/(conversations)/index';

export const ConversationHelper = {
  getOtherUsers<T extends { id: string | null } | null>(
    conversation: { users?: T[] } | null,
    currentUser: { id: string | null } | null
  ): Exclude<T, null>[] {
    return (conversation?.users?.filter(
      (user) => user?.id !== currentUser?.id
    ) || []) as Exclude<T, null>[];
  },
  isGroupChat(conversation: { groups?: any[] }) {
    return !!conversation.groups?.length;
  },
  getTitle(
    conversation: NonNullable<
      ResultOf<typeof GET_CONVERSATIONS_QUERY>['conversations']
    >[number],
    currentUser: { id: string | null } | null = null
  ) {
    if (!conversation) {
      return '?';
    }
    if (ConversationHelper.isGroupChat(conversation as any)) {
      return conversation?.groups?.[0]?.name || 'Group Chat';
    }
    const otherUser = ConversationHelper.getOtherUsers(
      conversation as any,
      currentUser as any
    );

    return (otherUser?.at(0) as any)?.nickname || '?';
  },
} as const;
