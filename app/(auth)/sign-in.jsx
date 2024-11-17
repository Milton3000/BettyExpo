import { View, Text, Image, Alert, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { images } from "../../constants";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link, router } from "expo-router";
import {
  getCurrentUser,
  signIn,
  checkActiveSession,
  deleteSessions,
} from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { StatusBar } from "expo-status-bar";

const SignIn = () => {
  const { setUser, setIsLogged, setIsGuest } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Auto-login Workflow
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const activeSession = await checkActiveSession();
        if (activeSession) {
          const user = await getCurrentUser();
          setUser(user);
          setIsLogged(true);
          setIsGuest(false);
          router.replace("/galleries");
        }
      } catch (error) {
        console.log("No active session found:", error.message);
      }
    };

    autoLogin();
  }, []);

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
      setIsGuest(false);

      router.replace("/galleries");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    setIsLogged(false);
    router.replace("/galleries");
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#161622", flex: 1 }}>
      <StatusBar style="light" backgroundColor="#161622" />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={30}
        extraHeight={150}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Image
            source={images.bettylogo4}
            resizeMode="contain"
            style={{ width: 155, height: 155 }}
          />
          <Text
            style={{
              fontSize: 24,
              color: "white",
              fontWeight: "600",
              textAlign: "center",
              marginVertical: 20,
            }}
          >
            Log in to Betty
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, flex: 1 }}>
          <View style={{ marginBottom: 20 }}>
            <FormField
              title="Email"
              value={form.email}
              placeholder="Enter your email"
              handleChangeText={(e) => setForm({ ...form, email: e })}
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              importantForAutofill="yes"
            />
          </View>
          <View style={{ marginBottom: 30 }}>
            <FormField
              title="Password"
              value={form.password}
              placeholder="Enter your password"
              handleChangeText={(e) => setForm({ ...form, password: e })}
              autoComplete="password"
              textContentType="password"
              importantForAutofill="yes"
            />
          </View>

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles={{ marginBottom: 20 }}
            isLoading={isSubmitting}
          />

          {/* Continue as Guest Button */}
          <TouchableOpacity
            onPress={continueAsGuest}
            style={{
              marginTop: 20,
              alignSelf: "center",
              backgroundColor: "#4b5c64",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Continue as Guest
            </Text>
          </TouchableOpacity>

          {/* Sign-Up and Forgot Password Links */}
          <View
            style={{
              justifyContent: "center",
              flexDirection: "row",
              marginTop: 20,
            }}
          >
            <Text style={{ color: "#aaa" }}>Don't have an account?</Text>
            <Link
              href="/sign-up"
              style={{ marginLeft: 5, color: "#6200EE", fontWeight: "bold" }}
            >
              Sign Up
            </Link>
          </View>
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={{ marginTop: 15, alignSelf: "center" }}
          >
            <Text style={{ color: "#6200EE", fontWeight: "bold" }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
