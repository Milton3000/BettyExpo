import { View, FlatList, TouchableOpacity, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLatestGalleries } from '../../../lib/appwrite';
import { useRouter, useFocusEffect } from 'expo-router';  // Import useFocusEffect
import InfoBox from '../../../components/InfoBox';
import { useEffect, useState, useCallback } from 'react';  // Import useCallback for useFocusEffect

const Galleries = () => {
  const [galleries, setGalleries] = useState([]);
  const router = useRouter();

  // Refetch galleries when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchGalleries = async () => {
        try {
          const latestGalleries = await getLatestGalleries();
          setGalleries(latestGalleries);  // Update the galleries list
        } catch (error) {
          console.error("Error fetching galleries:", error);
        }
      };

      fetchGalleries(); // Fetch galleries when returning to this screen
    }, [])  // Empty dependency array ensures this runs every time the screen is focused
  );

  const handleGalleryPress = (gallery) => {
    router.push(`/galleries/${gallery.$id}`);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <Text className="text-gray-100 text-xl font-bold mb-5 mt-5 text-center">
        Galleries
      </Text>

      <FlatList
        data={galleries}
        keyExtractor={(item) => item.$id}
        numColumns={2}  // Set to 2 columns for a grid layout
        key={'_'}  // Force a re-render when columns change
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}  // Styling for grid columns
        renderItem={({ item }) => {
          const title = item?.title || "Untitled";
          const thumbnail = item?.thumbnail || null;

          return (
            <TouchableOpacity
              onPress={() => handleGalleryPress(item)}
              style={{ flex: 1, marginBottom: 16, marginHorizontal: 5 }} // Flex for even distribution in grid
            >
              <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 10, shadowColor: 'black', shadowOpacity: 0.3, shadowRadius: 5 }}>
                {/* Render title above thumbnail */}
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>
                  {title}
                </Text>

                {thumbnail ? (
                  <Image
                    source={{ uri: thumbnail }}
                    style={{ width: '100%', height: 150, borderRadius: 10 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ textAlign: 'center' }}>No Thumbnail Available</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <InfoBox
            title="No galleries available."
            containerStyles="mt-10"
            titleStyles="text-lg"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Galleries;
