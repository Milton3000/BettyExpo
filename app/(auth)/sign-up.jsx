import { View, Text, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; // New Import
import { images } from "../../constants";
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { createUser } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";
import { StatusBar } from 'expo-status-bar';  // For status bar

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  const submit = async () => {
    if (form.username === "" || form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all the fields.");
      return;  // Prevent further execution if fields are empty
    }
    setSubmitting(true);

    try {
      const result = await createUser(form.email, form.password, form.username);
      setUser(result);
      setIsLogged(true);

      router.replace("/create");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#161622', flex: 1 }}>
      <StatusBar style="light" backgroundColor="#161622" />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        enableOnAndroid={true}  // Enables keyboard scrolling on Android
        extraHeight={300}  // Adjusts the height to move content when the keyboard opens
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
          <View style={{ justifyContent: 'center', flexDirection: 'row', marginTop: 20 }}>
            <Text style={{ color: '#aaa' }}>Already have an account?</Text>
            <Link href="/sign-in" style={{ marginLeft: 5, color: '#6200EE', fontWeight: 'bold' }}>
              Sign In
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
