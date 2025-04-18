import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Text,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserGalleries } from "../../../lib/appwrite";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useGlobalContext } from "../../../context/GlobalProvider";

const Galleries = () => {
  const { user, isLogged, isGuest } = useGlobalContext();
  const [galleries, setGalleries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Optimize console.logs by moving them into a useFocusEffect
  useFocusEffect(
    useCallback(() => {
      // console.log("User:", user);
      console.log("Is Logged:", isLogged);
      console.log("Is Guest:", isGuest);
    }, [user, isLogged, isGuest])
  );

  // Fetch galleries with error handling and retry logic
  const fetchGalleriesWithRetry = async (retryCount = 3) => {
    if (!user && !isGuest) {
      console.warn("Skipping gallery fetch: User is undefined or not logged in.");
      return;
    }

    try {
      const userGalleries = user
        ? await getUserGalleries(user.$id)
        : []; // Guests won't fetch user-specific galleries

      const validGalleries = userGalleries.filter((gallery) => !!gallery);
      const sortedGalleries = validGalleries.sort(
        (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt)
      );

      setGalleries(sortedGalleries);
    } catch (error) {
      if (retryCount > 0) {
        console.warn(`Retrying to fetch galleries, ${retryCount} retries left.`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        fetchGalleriesWithRetry(retryCount - 1);
      } else {
        console.error("Error fetching galleries:", error.message);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGalleriesWithRetry();
    }, [user, isGuest])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGalleriesWithRetry();
    setRefreshing(false);
  };

  const handleGalleryPress = (gallery) => {
    if (!gallery || !gallery.$id) {
      Alert.alert("Error", "Gallery not found.");
      return;
    }
    router.push(`/galleries/${gallery.$id}`);
  };

  const handleCreateGalleryPress = () => {
    router.push("/create");
  };

  const handleSignUpPress = () => {
    router.push("/sign-up");
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#161622", flex: 1 }}>
      <Text
        style={{
          color: "white",
          fontSize: 30,
          fontWeight: "bold",
          marginTop: 5,
          marginBottom: 15,
          textAlign: "center",
        }}
        className="font-didotbold"
      >
        Galleries
      </Text>

      <FlatList
        data={galleries}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 10 }}
        renderItem={({ item }) => {
          const title = item?.title || "Untitled";
          const thumbnail = item?.thumbnail || null;

          return (
            <TouchableOpacity
              onPress={() => handleGalleryPress(item)}
              style={{ flex: 1, marginBottom: 10, marginHorizontal: 5 }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                  textAlign: "center",
                  color: "white",
                }}
                className="font-helveticabold"
              >
                {title}
              </Text>
              <View
                style={{
                  padding: 10,
                  shadowColor: "black",
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                }}
              >
                {thumbnail ? (
                  <Image
                    source={{ uri: thumbnail }}
                    style={{ width: "100%", height: 150, borderRadius: 10 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ textAlign: "center", color: "white" }}>
                    No Thumbnail Available
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            {!isLogged && (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: 20,
                }}
              >
                Create an account to get started!
              </Text>
            )}
            <TouchableOpacity
              onPress={isLogged ? handleCreateGalleryPress : handleSignUpPress}
              style={{
                backgroundColor: "#4b5c64",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginTop: 10,
              }}
            >
              <Text
                className="font-helveticabold"
                style={{ color: "white", fontWeight: "bold" }}
              >
                {isLogged ? "Create Gallery" : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      />
    </SafeAreaView>
  );
};

export default Galleries;
