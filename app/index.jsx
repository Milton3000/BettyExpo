import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { ImageBackground, Text, View, StyleSheet } from 'react-native';
import { Redirect, router } from "expo-router";
import { images } from "../constants";
import CustomButton from '../components/CustomButton';
import { useGlobalContext } from '../context/GlobalProvider';

export default function App() {
  const { isLoading, isLoggedIn } = useGlobalContext();
  const [hasLaunchedBefore, setHasLaunchedBefore] = useState(null); // null = not yet checked

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('hasLaunched');
        if (value === null) {
          // First time launch
          await AsyncStorage.setItem('hasLaunched', 'true');
          setHasLaunchedBefore(false);
        } else {
          setHasLaunchedBefore(true);
        }
      } catch (e) {
        console.warn('Error reading launch flag:', e);
        setHasLaunchedBefore(true); // Fallback
      }
    };

    checkFirstLaunch();
  }, []);

  if (!isLoading && isLoggedIn) return <Redirect href="/create" />;

  if (hasLaunchedBefore === null) return null; // or a loading screen

  const buttonTitle = hasLaunchedBefore ? "Sign In" : "Get Started";
  const buttonTarget = hasLaunchedBefore ? "/sign-in" : "/sign-up";

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />

      <ImageBackground
        source={images.background}
        style={styles.backgroundImage}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <View style={styles.lightOverlay} />
        <View style={styles.textOverlay}>
          <Text style={styles.title}>APP NAME</Text>
          <Text style={styles.subtitle}>Discover Endless Sharing</Text>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title={buttonTitle}
            handlePress={() => router.push(buttonTarget)}
            containerStyles="w-2/3"
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Lighten the background image
    },
    textOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Dark overlay just for the text section
        width: '100%',
        paddingVertical: 10,
        alignItems: 'center',
        marginBottom: 20, // Space between the overlay and other elements
    },
    title: {
        fontSize: 32,
        color: 'white',
        fontFamily: 'Didot-Bold', // Ensure Didot-Bold is loaded in your app
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 24,
        color: 'white',
        fontFamily: 'Didot-Bold',
        textAlign: 'center',
        marginTop: 4,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 50, // Position the button near the bottom of the screen
        width: '100%',
        alignItems: 'center',
    },
});



// folders within parenthesis = route group / screens
// Important to have a separate layout for the Auth screens, since they won't have the same components as the Home Screens. Auth and Onboarding screens should have separate layout