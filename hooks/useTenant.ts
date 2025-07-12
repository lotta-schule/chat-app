import * as React from 'react';
import { graphql, ResultOf } from '@/api/graphql';

export const GET_TENANT_QUERY = graphql(`
  query GetTenant {
    tenant {
      id
      title
      slug
      host
      identifier
      backgroundImageFile {
        id
        formats(category: "BACKGROUND") {
          name
          url
          type
          availability {
            status
          }
        }
      }
      logoImageFile {
        id
        formats(category: "LOGO") {
          name
          url
          type
          availability {
            status
          }
        }
      }
      configuration {
        customTheme
        userMaxStorageConfig
      }
    }
  }
`);

export type Tenant = NonNullable<ResultOf<typeof GET_TENANT_QUERY>['tenant']>;

export const useTenant = () => {
  const tenant: Tenant = React.useMemo(
    () => ({
      id: '123',
      title: 'Test',
      slug: 'test',
      host: '',
      identifier: '',
      backgroundImageFile: null,
      logoImageFile: null,
      configuration: {
        customTheme: null,
        userMaxStorageConfig: null,
      },
    }),
    []
  );

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  return tenant;
};
