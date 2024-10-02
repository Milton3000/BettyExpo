import { useEffect, useState } from 'react';
import { View, FlatList, Image, Text, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databases, config, addImagesToGallery, addVideosToGallery, uploadFile } from '../../../lib/appwrite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Feather } from '@expo/vector-icons';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

const GalleryDetails = () => {
  const { galleryId } = useLocalSearchParams();
  const router = useRouter();
  const [galleryData, setGalleryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newMedia, setNewMedia] = useState([]);
  const [mediaType, setMediaType] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Track the selected image
  const [modalVisible, setModalVisible] = useState(false);

  // Reanimated Shared Value for swipe animations
  const translateX = useSharedValue(0);
  const screenWidth = Dimensions.get('window').width;
  const imageModalSize = screenWidth * 0.8; // Uniform size for modal images

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

  const openPicker = async (selectType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: selectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewMedia(result.assets);
      setMediaType(selectType);
    } else {
      Alert.alert('No files selected');
    }
  };

  const uploadMedia = async () => {
    if (newMedia.length === 0) {
      return Alert.alert('No media selected to upload.');
    }

    setUploading(true);

    try {
      const mediaUrls = await Promise.all(newMedia.map(async (media) => {
        const fileUrl = await uploadFile(media, media.mimeType);

        if (!fileUrl) {
          throw new Error('File upload failed: No file URL returned');
        }

        return fileUrl;
      }));

      if (mediaType === 'image') {
        await addImagesToGallery(galleryId, mediaUrls);
      } else {
        await addVideosToGallery(galleryId, mediaUrls);
      }

      Alert.alert('Success', 'Media uploaded successfully!');

      const updatedGallery = await databases.getDocument(config.databaseId, config.galleriesCollectionId, galleryId);

      setGalleryData(updatedGallery);
    } catch (error) {
      console.error('Error uploading media:', error.message || error);
      Alert.alert('Error', 'Failed to upload media.');
    } finally {
      setUploading(false);
      setNewMedia([]);
    }
  };

  const handleImagePress = (index) => {
    setSelectedImageIndex(index); // Ensure we pick the correct image index
    translateX.value = 0; // Reset translateX when opening the modal
    setModalVisible(true);
  };

  const handlePreviousImage = () => {
    if (selectedImageIndex > 0) {
      translateX.value = withSpring(screenWidth, {}, () => {
        runOnJS(setSelectedImageIndex)(selectedImageIndex - 1);
        translateX.value = 0;
      });
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex < galleryData.images.length - 1) {
      translateX.value = withSpring(-screenWidth, {}, () => {
        runOnJS(setSelectedImageIndex)(selectedImageIndex + 1);
        translateX.value = 0;
      });
    }
  };

  const handleExportImage = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        return Alert.alert('Permission denied', 'Please grant permission to save images.');
      }

      const { uri } = await FileSystem.downloadAsync(galleryData.images[selectedImageIndex], FileSystem.documentDirectory + 'image.jpg');

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);

      Alert.alert('Success', 'Image saved to your gallery!');
    } catch (error) {
      console.error('Error exporting image:', error);
      Alert.alert('Error', 'Failed to export image.');
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (loading) return <Text>Loading...</Text>;
  if (!galleryData) return <Text>No gallery found</Text>;

  const { title, images = [], videos = [] } = galleryData;

  return (
    <SafeAreaView className="bg-primary h-full">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 }}>
        <TouchableOpacity onPress={() => router.push('/galleries')}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>{title}</Text>
        <TouchableOpacity>
          <Feather name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {images.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={{ fontSize: 20, marginBottom: 8, color: 'white', textAlign: 'center' }}>Image Library</Text>
          <FlatList
            data={images}
            key={`grid-${images.length}`}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => handleImagePress(index)}>
                <Image
                  source={{ uri: item }}
                  style={{ width: screenWidth / 3 - 10, height: screenWidth / 3 - 10, margin: 5, borderRadius: 10 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            numColumns={3}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        </View>
      )}

      {videos.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={{ fontSize: 20, marginBottom: 8, color: 'white', textAlign: 'center' }}>Videos</Text>
          <FlatList
            data={videos}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <Text style={{ textAlign: 'center', marginBottom: 16 }}>{item}</Text>}
          />
        </View>
      )}

      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Text style={{ fontSize: 20, color: 'white', textAlign: 'center' }}>Add More Media</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
          <TouchableOpacity onPress={() => openPicker('image')}>
            <Text style={{ color: 'white', fontSize: 18 }}>Upload Images</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPicker('video')}>
            <Text style={{ color: 'white', fontSize: 18 }}>Upload Videos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {newMedia.length > 0 && (
        <TouchableOpacity onPress={uploadMedia} disabled={uploading} style={{ marginTop: 16, padding: 16, backgroundColor: 'green', borderRadius: 10 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>{uploading ? 'Uploading...' : 'Upload Media'}</Text>
        </TouchableOpacity>
      )}

      <GestureHandlerRootView>
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <PanGestureHandler
            onGestureEvent={({ nativeEvent }) => {
              if (nativeEvent.translationX > 50) handlePreviousImage();
              if (nativeEvent.translationX < -50) handleNextImage();
            }}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity style={{ position: 'absolute', top: 60, right: 12 }} onPress={() => setModalVisible(false)}>
                <Feather name="x" size={35} color="white" />
              </TouchableOpacity>

              {galleryData.images[selectedImageIndex] && (
                <Animated.Image
                  source={{ uri: galleryData.images[selectedImageIndex] }}
                  style={[{ width: imageModalSize, height: imageModalSize, borderRadius: 20, borderWidth: 2, borderColor: 'white' }, animatedStyle]}
                  resizeMode="cover"
                />
              )}

              <TouchableOpacity onPress={handleExportImage} style={{ marginTop: 20, padding: 10, backgroundColor: 'gray', borderRadius: 10 }}>
                <Text style={{ color: 'white', fontSize: 16 }}>Export</Text>
              </TouchableOpacity>
            </View>
          </PanGestureHandler>
        </Modal>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default GalleryDetails;
