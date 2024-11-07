import React, { useState } from 'react';
import { View, Text, Alert, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { sendPasswordResetEmail } from '../../lib/appwrite';
import { images } from "../../constants";
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(email);
      Alert.alert("Success", "Password reset link has been sent to your email");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#161622' }}>
      {/* Go Back Arrow */}
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
        style={{
          position: 'absolute',
          top: 50,
          left: 15,
          zIndex: 10, // Ensure this is on top of other elements
          padding: 5, // Make it easier to tap
          backgroundColor: 'rgba(0, 0, 0, 0.3)', // Temporary background for visibility
          borderRadius: 20, // Optional: round the background
        }}
      >
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        enableOnAndroid={true}
        extraHeight={300}
      >
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Image
            source={images.bettylogo4}
            resizeMode="contain"
            style={{ width: 155, height: 155 }}
          />
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '600', textAlign: 'center', marginTop: -40 }}>
            Forgot Password
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <FormField
            title="Email"
            value={email}
            handleChangeText={setEmail}
            keyboardType="email-address"
          />
          <CustomButton
            title="Reset Password"
            handlePress={handleResetPassword}
            isLoading={isSubmitting}
            containerStyles={{ marginTop: 20 }}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
