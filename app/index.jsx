import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, Text, View } from 'react-native';
import { Link } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';

import { images } from "../constants";

export default function App() {
    return (
        <SafeAreaView className="bg-primary h-full">
<ScrollView contentContainerStyle={{ height: '100%'}}>
<View className="w-full justify-center items-center h-full px-4">
<Image 
source={images.bettylogo3}
className="w-[200px] h-[200px]"
/>

<Image
source={images.betty2}
className="max-w-[380px] w-full h-[300px] -top-9"
resizeMode='contain'
/>

<View className="relative mt-5 -top-5">
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