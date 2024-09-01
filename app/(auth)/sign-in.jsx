import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from "../../constants";
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { getCurrentUser, signIn } from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: ''
  })


const submit = async () => {
  try {
    // Check if there's an active session
    const currentAccount = await getAccount();
    
    if (currentAccount) {
      // Session is active, redirect to home screen
      setUser(currentAccount);
      setIsLogged(true);
      Alert.alert("Success", "User is already logged in.");
      router.replace("/home");
      return;  // Exit early if session is already active
    }
  } catch (error) {
    // Ignore the error since this might mean no session is active, continue to login
  }

  if (form.email === "" || form.password === "") {
    Alert.alert("Error", "Please fill in all the fields.");
    return;  // Prevent further execution if fields are empty
  }

  setSubmitting(true);
  try {
    await signIn(form.email, form.password);
    const result = await getCurrentUser();

    if (result) {
      setUser(result);
      setIsLogged(true);
      Alert.alert("Success", "User signed in successfully");
      router.replace("/home");
    } else {
      throw new Error("Failed to fetch user details after login.");
    }
  } catch (error) {
    console.log(error);  // Logs the error to the console
    Alert.alert("Error", error.message || "Failed to sign in.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[75vh] px-4">
          {/* my-6 and/or min-h-[80vh] for above */}
          <Image
            source={images.bettylogo4}
            resizeMode="contain"
            className="w-[155px] h-[155px]" />

          <Text className="text-2xl text-white text-semibold mt-5 font-psemibold -top-10">
            Log in to Betty
          </Text>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-adress"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link href="/sign-up" className='text-lg font-psemibold text-secondary'>
              Sign Up
            </Link>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn