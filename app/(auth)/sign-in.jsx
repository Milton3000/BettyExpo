import { View, Text, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from "../../constants";
import FormField from '../../components/FormField';

const SignIn = () => {

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  return (
<SafeAreaView className="bg-primary h-full">
<ScrollView>
  <View className="w-full justify-center h-full px-4 -top-16">
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
  </View>
</ScrollView>
</SafeAreaView>
  )
}

export default SignIn