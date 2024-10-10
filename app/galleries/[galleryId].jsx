import { useEffect, useState } from 'react';
import { View, FlatList, Image, Text, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databases, config, addImagesToGallery, addVideosToGallery, uploadFile, deleteGallery } from '../../lib/appwrite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import AccessModal from '../../modals/AccessModal'; // Import AccessModal

const GalleryDetails = () => {
  const { galleryId } = useLocalSearchParams();
  const router = useRouter();
  const [galleryData, setGalleryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newMedia, setNewMedia] = useState([]);
  const [mediaType, setMediaType] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [accessModalVisible, setAccessModalVisible] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const imageModalSize = screenWidth * 0.8;

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

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
        let fileUri = media.uri;

        const originalFileInfo = await FileSystem.getInfoAsync(fileUri);

        if (mediaType === 'image') {
          const compressedImage = await ImageManipulator.manipulateAsync(
            media.uri,
            [{ resize: { width: 1000 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );

          const compressedFileInfo = await FileSystem.getInfoAsync(compressedImage.uri);

          if (compressedFileInfo.size < 1024) {
            throw new Error('File is too small to upload.');
          }

          fileUri = compressedImage.uri;
        }

        const fileExists = await FileSystem.getInfoAsync(fileUri);
        if (!fileExists || !fileExists.exists) {
          throw new Error('File does not exist or is inaccessible.');
        }

        const fileName = media.fileName || fileUri.split('/').pop();
        const mimeType = media.mimeType || 'image/jpeg';
        const fileSize = fileExists.size;

        const fileUrl = await uploadFile(
          {
            name: fileName,
            uri: fileUri,
            type: mimeType,
            size: fileSize,
          },
          mimeType
        );

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
      Alert.alert('Error', error.message || 'Failed to upload media.');
    } finally {
      setUploading(false);
      setNewMedia([]);
    }
  };

  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
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

  const handleDeleteGallery = async () => {
    try {
      await deleteGallery(config.galleriesCollectionId, galleryId, galleryData.images, galleryData.videos, galleryData.thumbnail);
      Alert.alert('Success', 'Gallery deleted successfully!');
      setDeleteModalVisible(false);
      setSettingsModalVisible(false);
      router.push('/galleries');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete gallery.');
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (!galleryData) return <Text>No gallery found</Text>;

  const { title, images = [], videos = [], eventDate } = galleryData;

  return (
    <SafeAreaView className="bg-primary h-full">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 }}>
        <TouchableOpacity onPress={() => router.push('/galleries')}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>{title}</Text>
        <TouchableOpacity onPress={() => setSettingsModalVisible(true)}>
          <Feather name="settings" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ margin: 5 }}>
          <TouchableOpacity onPress={() => setQrModalVisible(true)}>
            <MaterialIcons name="qr-code" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {eventDate && (
        <Text style={{ color: 'gray', textAlign: 'center', marginTop: 8 }}>
          Created on: {formatEventDate(eventDate)}
        </Text>
      )}

      {images.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <FlatList
            data={images}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => handleImagePress(index)}>
                <Image
                  source={{ uri: item }}
                  style={{ width: screenWidth / 3 - 18, height: screenWidth / 3 - 15, margin: 5, borderRadius: 10 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            numColumns={3}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        </View>
      )}

      <View style={{ paddingHorizontal: 30, marginTop: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => openPicker('image')}>
            <Text style={{ color: 'white', fontSize: 18 }}>Upload Images</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPicker('video')}>
            <Text style={{ color: 'white', fontSize: 18 }}>Upload Videos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {newMedia.length > 0 && (
        <TouchableOpacity onPress={uploadMedia} disabled={uploading} style={{ marginTop: 20, padding: 16, backgroundColor: 'green', borderRadius: 10, width: 250, alignSelf: 'center'}}>
          <Text style={{ color: 'white', textAlign: 'center' }}>{uploading ? 'Uploading...' : 'Upload Media'}</Text>
        </TouchableOpacity>
      )}

      {/* Image Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={{ position: 'absolute', top: 60, right: 12, zIndex: 1 }} onPress={() => setModalVisible(false)}>
            <Feather name="x" size={35} color="white" />
          </TouchableOpacity>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ alignItems: 'center', justifyContent: 'center', width: screenWidth }}>
                <Image
                  source={{ uri: item }}
                  style={{ width: screenWidth, height: imageModalSize, borderRadius: 20 }}
                  resizeMode="cover"
                />
              </View>
            )}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setSelectedImageIndex(index);
            }}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
          />
          <TouchableOpacity onPress={handleExportImage} style={{ marginBottom: 30, padding: 10, backgroundColor: 'gray', borderRadius: 10 }}>
            <Text style={{ color: 'white', fontSize: 16 }}>Export</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Settings Modal for Access and Delete Gallery */}
      <Modal
        visible={settingsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
        >
          <View
            style={{
              width: 300,
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              Settings
            </Text>

            {/* Access Option */}
            <TouchableOpacity
              onPress={() => {
                setAccessModalVisible(true);
                setSettingsModalVisible(false);
              }}
              style={{
                padding: 15,
                backgroundColor: '#f0f0f0',
                borderRadius: 8,
                marginBottom: 15,
                borderWidth: 1,
                borderColor: '#ccc',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: 'bold', color: 'black' }}>Access</Text>
            </TouchableOpacity>

            {/* Delete Gallery Option */}
            <TouchableOpacity
              onPress={() => {
                setDeleteModalVisible(true);
                setSettingsModalVisible(false);
              }}
              style={{
                padding: 15,
                backgroundColor: '#f8d7da',
                borderRadius: 8,
                marginBottom: 15,
                borderWidth: 1,
                borderColor: '#f5c6cb',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: 'bold', color: 'red' }}>Delete Gallery</Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setSettingsModalVisible(false)}
              style={{
                padding: 10,
                borderRadius: 5,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: 'bold', color: 'black' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Gallery Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
        >
          <View
            style={{
              width: 300,
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              Confirm Delete
            </Text>
            <Text style={{ marginBottom: 30, textAlign: 'center' }}>
              Are you sure you want to delete this gallery? This action cannot be undone.
            </Text>
            <TouchableOpacity
              onPress={handleDeleteGallery}
              style={{
                padding: 10,
                backgroundColor: 'red',
                borderRadius: 10,
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDeleteModalVisible(false)}
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{ fontWeight: 'bold', color: 'black' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal visible={qrModalVisible} transparent={true} animationType="slide" onRequestClose={() => setQrModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 60, right: 12, zIndex: 1 }}
            onPress={() => setQrModalVisible(false)}
          >
            <Feather name="x" size={35} color="white" />
          </TouchableOpacity>
          <QRCode value={`betty://gallery/${galleryId}`} size={250} color="white" backgroundColor="black" />
          <Text style={{ color: 'white', marginTop: 20 }}>Scan this code to view the gallery.</Text>
        </View>
      </Modal>

      {/* Access Modal */}
      <AccessModal visible={accessModalVisible} onClose={() => setAccessModalVisible(false)} galleryId={galleryId} />
    </SafeAreaView>
  );
};

export default GalleryDetails;
