import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { images } from "../../constants";
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { getCurrentUser, signIn, checkActiveSession, deleteSessions } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";
import { StatusBar } from 'expo-status-bar';
import * as AuthSession from 'expo-auth-session';

// Auth0 credentials
const auth0ClientId = "ssviZhtv1BxUdFX0kNTlPhR37PUuM5EM";
const auth0Domain = "dev-txsc1yccyhk88eeb.eu.auth0.com";

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
  
    setSubmitting(true);

    try {
      const activeSession = await checkActiveSession();

      if (activeSession) {
        await deleteSessions();
      }
  
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);
  
      router.replace("/galleries");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Function for handling Auth0 sign-in
  const handleAuth0SignIn = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "betty",
        useProxy: true
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

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };
  
  return (
    <SafeAreaView style={{ backgroundColor: '#161622', flex: 1 }}>
      <StatusBar style="light" backgroundColor="#161622" />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        enableOnAndroid={true}
        extraHeight={300}
      >
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Image
            source={images.bettylogo4}
            resizeMode="contain"
            style={{ width: 155, height: 155 }}
          />
          <Text style={{ fontSize: 24, color: 'white', fontWeight: '600', textAlign: 'center', marginVertical: 20 }}>
            Log in to Betty
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, flex: 1 }}>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="marginTop: 10px"
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="marginTop: 10px"
          />

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles={{ marginTop: 30 }}
            isLoading={isSubmitting}
          />

          {/* Auth0 Sign-In Button */}
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

          {/* Sign-Up and Forgot Password Links */}
          <View style={{ justifyContent: 'center', flexDirection: 'row', marginTop: 20 }}>
            <Text style={{ color: '#aaa' }}>Don't have an account?</Text>
            <Link href="/sign-up" style={{ marginLeft: 5, color: '#6200EE', fontWeight: 'bold' }}>
              Sign Up
            </Link>
          </View>
          <TouchableOpacity onPress={handleForgotPassword} style={{ marginTop: 15, alignSelf: 'center' }}>
            <Text style={{ color: '#6200EE', fontWeight: 'bold' }}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
