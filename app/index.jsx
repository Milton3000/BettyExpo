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
source={images.logo}
className="w-[130px] h-[84px]"
resizeMode="contain"
/>

<Image
source={images.cards}
className="max-w-[380px] w-full h-[300px]"
resizeMode='contain'
/>



</View>
</ScrollView>
        </SafeAreaView>
    );
}

// folders within parenthesis = route group / screens
// Important to have a separate layout for the Auth screens, since they won't have the same components as the Home Screens. Auth and Onboarding screens should have separate layout