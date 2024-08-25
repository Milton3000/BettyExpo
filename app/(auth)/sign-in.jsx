import { View, Text, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from "../../constants";
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link } from 'expo-router';

const SignIn = () => {

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = () => {

  }

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