import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { Link } from "expo-router";

export default function App() {
    return (
        <View className="flex-1 items-center justify-center bg-white text-3xl">
            <Text className="text-3xl font-pblack">Betty App!</Text>
            <StatusBar style="auto" />
            <Link href="/profile" style={{ color: "blue" }}> Go to Profile </Link>
        </View>
    );
}

// folders within parenthesis = route group / screens
// Important to have a separate layout for the Auth screens, since they won't have the same components as the Home Screens. Auth and Onboarding screens should have separate layout