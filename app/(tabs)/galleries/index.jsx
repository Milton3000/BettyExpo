import { View, FlatList, TouchableOpacity, Image, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLatestGalleries } from '../../../lib/appwrite';
import { useRouter, useFocusEffect } from 'expo-router';
import InfoBox from '../../../components/InfoBox';
import { useState, useCallback } from 'react';

const Galleries = () => {
  const [galleries, setGalleries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);  // State for refresh control
  const router = useRouter();

  const fetchGalleries = async () => {
    try {
      const latestGalleries = await getLatestGalleries();
      setGalleries(latestGalleries);
    } catch (error) {
      console.error("Error fetching galleries:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGalleries();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate delay to test refresh spinner visibility
    await new Promise(resolve => setTimeout(resolve, 200));
    await fetchGalleries();
    setRefreshing(false);
  };

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"  // Ensure the spinner is visible
          />
        }
      />
    </SafeAreaView>
  );
};

export default Galleries;
