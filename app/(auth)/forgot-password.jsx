import React, { useState } from 'react';
import { View, Text, Alert, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { sendPasswordResetEmail } from '../../lib/appwrite';
import { images } from "../../constants";  // Assuming images are in the constants folder
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#161622', justifyContent: 'center' }}>
      {/* Go Back Arrow */}
      <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 52, left: 15 }}>
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>

      {/* Logo and Title */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Image
          source={images.bettylogo4}
          resizeMode="contain"
          style={{ width: 155, height: 155 }}
        />
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '600', textAlign: 'center', marginBottom: -60 }}>
          Forgot Password
        </Text>
      </View>

      {/* Form and Reset Button */}
      <View style={{ paddingHorizontal: 20, marginTop: 120 }}>
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
        />
      </View>
    </SafeAreaView>
  );
};

export default ForgotPassword;
