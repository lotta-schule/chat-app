import { useCurrentSession } from '@/context/SessionContext';
import { graphql } from '@/api/graphql';
import { useQuery } from '@apollo/client';

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

export const useCurrentUser = () => {
  const session = useCurrentSession();
  const { data } = useQuery(GET_CURRENT_USER, {
    skip: !session?.auth?.accessToken,
  });

  return data?.currentUser || null;
};
