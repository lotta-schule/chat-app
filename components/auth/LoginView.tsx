import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground } from 'expo-image';
import {
  TextInput,
  View,
  StyleSheet,
  Button,
  KeyboardAvoidingView,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import logoPlaceholder from '@/assets/images/logo_s.png';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { MutationOptions, OperationVariables } from '@apollo/client';
import { GET_TENANT_QUERY } from '@/hooks/useTenant';
import { apiUrl, baseProtocol, baseUrl } from '@/config';
import { Session, TenantLight } from '@/lib';
import { graphql, VariablesOf } from '@/api/graphql';
import { createApolloClient } from '@/lib/apollo';

export type LoginViewProps = {
  onLoginSuccess?: (session: Session) => void;
};

type GetTenantResponse =
  | {
      success: true;
      tenants: TenantLight[];
    }
  | {
      success: false;
      error: string;
    };

export const LOGIN_MUTATION = graphql(`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
      refreshToken
    }
  }
`);

export const LoginView = React.memo(({ onLoginSuccess }: LoginViewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [tenants, setTenants] = useState<TenantLight[]>([]);
  const [password, setPassword] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<TenantLight | null>(
    null
  );
  const [theme, setTheme] = useState<any>(null);
  console.log({ theme });

  const client = useMemo(
    () => selectedTenant && createApolloClient(selectedTenant),
    [selectedTenant]
  );

  const login = useCallback(
    (
      args: Omit<
        MutationOptions<
          any,
          VariablesOf<typeof LOGIN_MUTATION>,
          OperationVariables
        >,
        'mutation'
      >
    ) => client?.mutate({ mutation: LOGIN_MUTATION, ...args }),
    [client]
  );

  useEffect(() => {
    const thisClient = client;
    thisClient?.query({ query: GET_TENANT_QUERY }).then((response) => {
      const theme = response.data?.tenant?.configuration?.customTheme;
      if (thisClient === client && theme) {
        setTheme(theme);
      }
    });
  }, [client]);

  const searchTenants = useCallback(() => {
    setIsLoading(true);
    console.log(`${apiUrl}/public/user-tenants?username=${username}`);
    fetch(`${apiUrl}/public/user-tenants?username=${username}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Lotta-Chat App',
      },
    })
      .then((response) => response.json())
      .then((data: GetTenantResponse) => {
        console.log({ data });
        setPassword('');
        if ('error' in data) {
          alert(data.error);
          setTenants([]);
        } else {
          setTenants(data.tenants || []);
          if (data.tenants.length > 0) {
            setSelectedTenant(data.tenants[0]);
          }
        }
      })
      .catch((error) => {
        alert('Fehler beim Laden der Daten: ' + error.message);
        setTenants([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username]);

  const tenantLogo = React.useMemo(() => {
    if (selectedTenant && selectedTenant.logoImageFileId) {
      const path = `data/storage/f/${selectedTenant.logoImageFileId}/logo_600`;
      return {
        uri: `${baseProtocol}://${selectedTenant.slug}.${baseUrl}/${path}`,
      };
    }
    return undefined;
  }, [selectedTenant]);
  const tenantBg = React.useMemo(() => {
    if (selectedTenant && selectedTenant.backgroundImageFileId) {
      const path = `data/storage/f/${selectedTenant.backgroundImageFileId}/logo_600`;
      return {
        uri: `${baseProtocol}://${selectedTenant.slug}.${baseUrl}/${path}`,
      };
    }
    return undefined;
  }, [selectedTenant]);

  const { showActionSheetWithOptions } = useActionSheet();

  const onPressTenant = useCallback(() => {
    const options = ['', ...tenants.map((tenant) => tenant.title), 'Abbrechen'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: 0,
        disabledButtonIndices: [0],
      },
      (selectedIndex) => {
        if (!selectedIndex) {
          return;
        }
        const selection = tenants.at(selectedIndex - 1);
        if (selection) {
          setSelectedTenant(selection);
        }
      }
    );
  }, [showActionSheetWithOptions, tenants]);

  const loginWithPW = useCallback(() => {
    if (!selectedTenant) {
      return;
    }
    setIsLoading(true);
    return login({
      variables: {
        username: username.toLowerCase(),
        password,
      },
      context: {
        headers: {
          'User-Agent': 'Lotta-Chat App',
          tenant: `slug:${selectedTenant.slug}`,
        },
      },
    })
      ?.then((response) => {
        if (response.data?.login) {
          const auth = response.data.login as Required<
            typeof response.data.login
          > as any; // TODO: Fix types
          // Handle successful login, e.g., store tokens, navigate to the main app
          onLoginSuccess?.({
            tenant: selectedTenant,
            auth,
          });
          console.log({ auth, selectedTenant });
        } else {
          alert(
            'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.'
          );
        }
      })
      .catch((error) => {
        console.error('Login error:', error);
        alert('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [login, onLoginSuccess, password, selectedTenant, username]);

  return (
    <View style={styles.wrapper}>
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: (theme as any)?.backgroundColor?.replace(
              /^#/,
              '#'
            ),
          },
        ]}
      >
        <ImageBackground source={tenantBg} />
        <Image
          style={styles.logo}
          source={tenantLogo}
          placeholder={logoPlaceholder}
          contentFit="contain"
          transition={1000}
        />
        <KeyboardAvoidingView
          behavior="padding"
          style={{ display: 'flex', flexGrow: 1 }}
        >
          <View style={styles.formSection}>
            <View style={styles.inputLabelWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder="Username"
                style={styles.inputField}
                onChangeText={(newUsername) => {
                  setUsername(newUsername);
                  if (newUsername !== username) {
                    setPassword('');
                    setTenants([]);
                    setSelectedTenant(null);
                  }
                }}
                defaultValue={username}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={() => {
                  if (username && !isLoading) {
                    searchTenants();
                  }
                }}
                onBlur={() => {
                  if (username && !isLoading) {
                    searchTenants();
                  }
                }}
              />
            </View>
            {tenants.length && tenants.length > 1 ? (
              <Button
                title={`${selectedTenant?.title || 'Lotta wählen'}`}
                onPress={onPressTenant}
                disabled={isLoading}
                accessibilityState={{ disabled: isLoading }}
              />
            ) : undefined}
            {selectedTenant && (
              <View style={styles.inputLabelWrapper}>
                <Text style={styles.inputLabel}>Passwort</Text>
                <TextInput
                  autoFocus
                  style={styles.inputField}
                  placeholder="Passwort"
                  secureTextEntry
                  onChangeText={setPassword}
                  defaultValue={password}
                  onSubmitEditing={() => {
                    if (username && password && !isLoading) {
                      loginWithPW();
                    }
                  }}
                />
              </View>
            )}
          </View>
          <View style={styles.submitSection}>
            <Button
              title="weiter"
              onPress={selectedTenant ? loginWithPW : searchTenants}
              disabled={!username}
              accessibilityState={{ disabled: isLoading }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
});
LoginView.displayName = 'LoginView';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    maxWidth: 600,
    maxHeight: 900,
  },
  container: {
    flex: 1,
  },
  logo: {
    width: 300,
    height: 200,
    alignSelf: 'center',
    marginBlockStart: '25%',
    marginBlockEnd: 40,
  },
  inputField: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 150,
  },
  inputLabelWrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginBottom: 5,
  },
  inputLabel: {
    flexShrink: 0,
    width: '40%',
    marginInlineStart: 20,
    minWidth: 100,
  },
  formSection: {
    flex: 0,
  },
  submitSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    paddingTop: 10,
  },
  submitButton: {
    marginBlockStart: 50,
  },
});
