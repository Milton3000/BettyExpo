import { View, Text, ScrollView, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from "../../constants";

const SignIn = () => {
  return (
<SafeAreaView className="bg-primary h-full">
<ScrollView>
  <View className="w-full justify-center min-h-[80vh] px-4 my-6">
<Image 
source={images.bettylogo4}
resizeMode="contain"
className="w-[155px] h-[155px]" />

<Text className="text-2xl text-white text-semibold mt-5 font-psemibold">
  Log in to Betty
</Text>
  </View>
</ScrollView>
</SafeAreaView>
  )
}

export default SignIn