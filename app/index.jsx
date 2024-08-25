import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, Text, View } from 'react-native';
import { Link } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

import { images } from "../constants";

export default function App() {
    return (
        <SafeAreaView className="bg-primary h-full">
<ScrollView contentContainerStyle={{ height: '90%'}}> 
    {/* change to 100% later */}
<View className="w-full justify-center items-center h-full px-4">
<Image 
source={images.bettylogo3}
className="w-[250px] h-[250px] -top-2"
resizeMode='contain'
/>

<Image
source={images.betty2}
className="max-w-[350px] w-full h-[270px] -top-12"
resizeMode='contain'
/>

<View className="relative mt-5 -top-6">
<Text className="text-3xl text-white font-bold text-center">
Discover Endless Sharing with {' '}
<Text className="text-secondary-200">
    Betty
</Text>
</Text>
<Image 
source={images.path}
className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
resizeMode='contain'
/>
</View>

{/* <Text className="text-sm font-pregular text-gray-100 mt-7 text-center">
    Where creativity meets innovation: embark on a journey of limitless exploration with Betty
</Text> */}

</View>
</ScrollView>
        </SafeAreaView>
    );
}

// folders within parenthesis = route group / screens
// Important to have a separate layout for the Auth screens, since they won't have the same components as the Home Screens. Auth and Onboarding screens should have separate layout