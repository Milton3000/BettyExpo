import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { images } from "../../constants";
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router, useRouter } from 'expo-router';
import { createUser, account } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Detect if app is running in Expo Go or as standalone build
const isExpoGo = Constants.appOwnership === 'expo';

// Set the appropriate redirect URI
const redirectUri = isExpoGo
  ? 'https://auth.expo.io/@mk3000/bettyexpo'
  : makeRedirectUri({ useProxy: false });

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const expoRouter = useRouter();

  const submit = async () => {
    if (form.username === "" || form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all the fields.");
      return;
    }
    setSubmitting(true);

    try {
      const result = await createUser(form.email, form.password, form.username);
      setUser(result);
      setIsLogged(true);
      router.replace("/galleries");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Google OAuth config
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: '400085962760-s71a3n41ujcqmumtmjg7p33lucpu2ae8.apps.googleusercontent.com',
      redirectUri,
      responseType: ResponseType.Token,
      scopes: ['openid', 'profile', 'email'],
      usePKCE: false,
    },
    discovery
  );

  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync({ useProxy: isExpoGo });

      if (result.type === 'success') {
        const user = await account.get();
        setUser(user);
        setIsLogged(true);
        router.replace('/galleries');
      } else {
        throw new Error('Google login cancelled or failed');
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      Alert.alert("Login Error", error.message || "Something went wrong.");
    }
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
            Sign up to Betty
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, flex: 1 }}>
          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="marginTop: 10px"
          />
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
            title="Sign Up"
            handlePress={submit}
            containerStyles={{ marginTop: 30 }}
            isLoading={isSubmitting}
          />

          {/* Google Login Button */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            style={{
              marginTop: 20,
              backgroundColor: '#DB4437',
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
              width: '100%',
            }}
            disabled={!request}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Sign in with Google
            </Text>
          </TouchableOpacity>

          <View style={{ justifyContent: 'center', flexDirection: 'row', marginTop: 20 }}>
            <Text style={{ color: '#aaa' }}>Already have an account?</Text>
            <Link href="/sign-in" style={{ marginLeft: 5, color: "#6200EE", fontWeight: "bold" }}>
              Sign In
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUp;