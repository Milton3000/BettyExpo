import { View, FlatList, TouchableOpacity, Image, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserGalleries } from '../../../lib/appwrite'; // Replace with getUserGalleries
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { useGlobalContext } from '../../../context/GlobalProvider'; // Access global context

const Galleries = () => {
  const { user, isLogged } = useGlobalContext(); // Get user and login status from global context
  const [galleries, setGalleries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchGalleries = async () => {
    try {
      // Fetch galleries for the current user
      const userGalleries = await getUserGalleries(user.$id); // Fetch galleries for the current user
  
      // Sort galleries by creation date in descending order (newest first)
      const sortedGalleries = userGalleries.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
  
      setGalleries(sortedGalleries);
    } catch (error) {
      console.error("Error fetching galleries:", error);
    }
  };  

  useFocusEffect(
    useCallback(() => {
      fetchGalleries();
    }, [user]) // Ensure it refetches when user changes
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 200)); // Delay for testing refresh spinner
    await fetchGalleries();
    setRefreshing(false);
  };

  const handleGalleryPress = (gallery) => {
    router.push(`/galleries/${gallery.$id}`);
  };

  const handleCreateGalleryPress = () => {
    router.push("/create");
  };

  const handleSignUpPress = () => {
    router.push("/sign-up");
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#161622', flex: 1 }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Galleries
      </Text>

      <FlatList
        data={galleries}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
        renderItem={({ item }) => {
          const title = item?.title || "Untitled";
          const thumbnail = item?.thumbnail || null;

          return (
            <TouchableOpacity
              onPress={() => handleGalleryPress(item)}
              style={{ flex: 1, marginBottom: 10, marginHorizontal: 5 }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center', color: "white" }}>
                {title}
              </Text>
              <View style={{ padding: 10, shadowColor: 'black', shadowOpacity: 0.3, shadowRadius: 5 }}>
                {thumbnail ? (
                  <Image
                    source={{ uri: thumbnail }}
                    style={{ width: '100%', height: 150, borderRadius: 10 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ textAlign: 'center', color: 'white' }}>No Thumbnail Available</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
              {isLogged ? "Create your first gallery to get started!" : "Create an account to get started!"}
            </Text>
            <TouchableOpacity
              onPress={isLogged ? handleCreateGalleryPress : handleSignUpPress}
              style={{
                backgroundColor: '#6200EE',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginTop: 10,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
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
