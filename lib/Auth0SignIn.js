import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import { getCurrentUser } from '../lib/appwrite';

const auth0ClientId = "ssviZhtv1BxUdFX0kNTlPhR37PUuM5EM";
const auth0Domain = "dev-txsc1yccyhk88eeb.eu.auth0.com";

const Auth0SignIn = ({ setUser, setIsLogged }) => {
  const handleAuth0SignIn = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "betty",
        useProxy: true,
      });
      console.log("Redirect URI:", redirectUri);

      const authUrl = `https://${auth0Domain}/authorize?client_id=${auth0ClientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email`;
      console.log("Auth URL:", authUrl);

      const result = await AuthSession.startAsync({ authUrl });
      console.log("AuthSession Result:", result);

      if (result.type === 'success' && result.params && result.params.access_token) {
        const user = await getCurrentUser();
        setUser(user);
        setIsLogged(true);
        router.replace("/galleries");
      } else {
        throw new Error(`Authentication failed with result type: ${result.type}`);
      }
    } catch (error) {
      console.error("Auth0 Sign-In Error:", error);
      Alert.alert("Error", `Failed to sign in with Auth0. Details: ${error.message}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleAuth0SignIn}
      style={{
        marginTop: 20,
        backgroundColor: '#DB4437',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Sign in with Auth0</Text>
    </TouchableOpacity>
  );
};

export default Auth0SignIn;
