import { View, FlatList, TouchableOpacity, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLatestGalleries } from '../../../lib/appwrite';
import { useRouter } from 'expo-router';
import InfoBox from '../../../components/InfoBox';
import { useEffect, useState } from 'react';

const Galleries = () => {
  const [galleries, setGalleries] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const latestGalleries = await getLatestGalleries();
        console.log(latestGalleries); // This logs the correct gallery data
        setGalleries(latestGalleries);
      } catch (error) {
        console.error("Error fetching galleries:", error);
      }
    };
    fetchGalleries();
  }, []);

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
        renderItem={({ item }) => {
          const title = item?.title || "Untitled";
          const thumbnail = item?.thumbnail || null;

          return (
            <TouchableOpacity onPress={() => handleGalleryPress(item)}>
              <View style={{ backgroundColor: 'white', shadowColor: 'black', shadowOpacity: 0.5, borderRadius: 10, padding: 16, marginBottom: 16 }}>
                {/* Render title above thumbnail */}
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>{title}</Text>
                
                {thumbnail ? (
                  <Image
                    source={{ uri: thumbnail }}
                    style={{ width: '100%', height: 200, borderRadius: 10 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text>No Thumbnail Available</Text>
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
