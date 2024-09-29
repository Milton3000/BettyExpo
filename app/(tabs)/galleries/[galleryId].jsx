import { useEffect, useState } from 'react';
import { View, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databases, config } from '../../../lib/appwrite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import InfoBox from '../../../components/InfoBox';
import { Feather } from '@expo/vector-icons'; // Make sure this is correctly imported

const GalleryDetails = () => {
  const { galleryId } = useLocalSearchParams();
  const router = useRouter();
  const [galleryData, setGalleryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        if (!galleryId) return;
        const gallery = await databases.getDocument(config.databaseId, config.galleriesCollectionId, galleryId);
        setGalleryData(gallery);
      } catch (error) {
        console.error('Error fetching gallery details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (galleryId) fetchGallery();
  }, [galleryId]);

  if (loading) return <Text>Loading...</Text>;
  if (!galleryData) return <Text>No gallery found</Text>;

  const { title, images = [], videos = [] } = galleryData;

  return (
    <SafeAreaView className="bg-primary h-full">
      {/* Go Back Button with Icon */}
      <TouchableOpacity
        style={{ padding: 16, backgroundColor: 'white', borderRadius: 10, marginHorizontal: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center' }}
        onPress={() => router.push('/galleries')} // Navigate explicitly to "Galleries"
      >
        <Feather name="arrow-left" size={24} color="black" /> 
        <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>Go Back</Text>
      </TouchableOpacity>

      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 24, paddingHorizontal: 16 }}>
  <InfoBox
    // title={`Gallery: ${title}`} // Use this if you want to display the gallery title
    title={title}
    containerStyles="mt-5"
    titleStyles="text-lg font-bold"
  />
</View>


      {/* Render images */}
      {images.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
<Text style={{ fontSize: 20, marginBottom: 8, color: 'white', textAlign: 'center' }}>
  Image Library
</Text>
          <FlatList
            data={images}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width: '100%', height: 192, borderRadius: 10, marginBottom: 16 }}
                resizeMode="cover"
              />
            )}
          />
        </View>
      )}

      {/* Render videos */}
      {videos.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={{ fontSize: 20, marginBottom: 8 }}>Videos:</Text>
          <FlatList
            data={videos}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={{ textAlign: 'center', marginBottom: 16 }}>{item}</Text> // Placeholder for video
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default GalleryDetails;
