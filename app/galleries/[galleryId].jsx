import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, Text, TouchableOpacity, Dimensions, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SettingsModal from '../../modals/SettingsModal';
import DeleteModal from '../../modals/DeleteModal';
import QRModal from '../../modals/QRModal';
import AccessModal from '../../modals/AccessModal';
import { useUploadMedia } from '../../hooks/useUploadMedia';
import { deleteImages } from '../../components/DeleteImage'; 
import { handleExportImage, handleExportMultipleImages } from '../../utils/mediaUtils';
import { databases, config, deleteGallery } from '../../lib/appwrite';

const GalleryDetails = () => {
  const { galleryId } = useLocalSearchParams();
  const router = useRouter();
  const [galleryData, setGalleryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  const [selectedImages, setSelectedImages] = useState([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [accessModalVisible, setAccessModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { uploadMedia, newMedia, openPicker, uploading } = useUploadMedia();
  const screenWidth = Dimensions.get('window').width;

  // Fetch gallery data
  const fetchGallery = async () => {
    try {
      if (!galleryId) {
        throw new Error('Gallery ID is missing or invalid.');
      }

      setRefreshing(true); 
      const gallery = await databases.getDocument(config.databaseId, config.galleriesCollectionId, galleryId);
      setGalleryData(gallery);
    } catch (error) {
      console.error('Error fetching gallery details:', error);
      Alert.alert('Error', 'Failed to load gallery details.');
    } finally {
      setLoading(false);
      setRefreshing(false); 
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [galleryId]);

  const toggleSelectImage = (imageUri) => {
    if (selectedImages.includes(imageUri)) {
      setSelectedImages(selectedImages.filter((img) => img !== imageUri));
    } else {
      setSelectedImages([...selectedImages, imageUri]);
    }
  };

  const handleDeleteGallery = async () => {
    try {
      await deleteGallery(config.galleriesCollectionId, galleryId, galleryData.images, galleryData.thumbnail);
      // Alert.alert('Success', 'Gallery deleted successfully!');
      setDeleteModalVisible(false);
      router.push('/galleries');
    } catch (error) {
      Alert.alert('Error', `Failed to delete gallery: ${error.message}`);
      console.error('Error deleting gallery:', error);
    }
  };

  const handleUploadMedia = async () => {
    await uploadMedia(galleryId, databases, config);
    // After uploading, re-fetch gallery data to show the new images
    await fetchGallery();
  };

  if (loading) return <Text>Loading...</Text>;
  if (!galleryData) return <Text>No gallery found</Text>;

  const { title, images = [], eventDate } = galleryData;

  return (
    <SafeAreaView className="bg-primary h-full">
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 }}>
        <TouchableOpacity onPress={() => router.push('/galleries')}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        {/* Right-side buttons */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Select button */}
          <TouchableOpacity
            onPress={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              setSelectedImages([]); 
            }}
            style={{
              padding: 6,
              backgroundColor: isMultiSelectMode ? '#ff6347' : '#1e90ff',
              borderRadius: 5,
              marginRight: 10,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
              {isMultiSelectMode ? 'Cancel' : 'Select'}
            </Text>
          </TouchableOpacity>

          {/* Settings button */}
          <TouchableOpacity className="p-2" onPress={() => setSettingsModalVisible(true)}>
            <Feather name="settings" size={24} color="white" />
          </TouchableOpacity>

          {/* QR Code button */}
          <View style={{ marginLeft: 10 }}>
            <TouchableOpacity onPress={() => setQrModalVisible(true)}>
              <MaterialIcons name="qr-code" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Gallery Title */}
      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 5 }}>
        {title}
      </Text>

      {/* Event Date */}
      {eventDate && (
        <Text style={{ color: 'gray', textAlign: 'center', marginTop: 8 }}>
          Created on: {new Date(eventDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <View style={{ paddingHorizontal: 2, marginTop: 10 }}>
  <FlatList
    data={images}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item, index }) => (
      <TouchableOpacity
        onPress={() => {
          if (!isMultiSelectMode) {
            setSelectedImageIndex(index);
            setModalVisible(true);
          } else {
            toggleSelectImage(item);
          }
        }}
        onLongPress={() => {
          if (!isMultiSelectMode) {
            setIsMultiSelectMode(true);
            toggleSelectImage(item);
          }
        }}
        style={{
          margin: 1, // Uniform margin between images
          borderWidth: selectedImages.includes(item) ? 1 : 0,
          borderColor: 'yellow',
          borderRadius: 5,
        }}
      >
        <Image
          source={{ uri: item }}
          style={{
            width: screenWidth / 3 - 2, // Take up full width of grid cell
            height: screenWidth / 3 - 2, // Uniform height for all images
          }}
          resizeMode="cover" // Ensures that images fill the grid cells properly
        />
        {selectedImages.includes(item) && (
          <View style={{
            position: 'absolute',
            top: 5,
            right: 5,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 12,
            padding: 2,
          }}>
            <Feather name="check" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    )}
    numColumns={3}
    columnWrapperStyle={{ justifyContent: 'space-between' }} // Keep columns evenly spaced
    contentContainerStyle={{ paddingBottom: 16 }}
    showsVerticalScrollIndicator={false}
    refreshing={refreshing} 
    onRefresh={fetchGallery} // Allows the gallery to refresh on pull-down
  />
</View>
      )}

      {/* Export or Delete Selected Images Buttons */}
      {isMultiSelectMode && selectedImages.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => handleExportMultipleImages(selectedImages, setSelectedImages, setIsMultiSelectMode)}
            style={{
              padding: 16,
              backgroundColor: 'gray',
              borderRadius: 10,
              width: 150,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <AntDesign name="download" size={18} color="white" />
            <Text style={{ color: 'white', textAlign: 'center', marginLeft: 8 }}>
              {selectedImages.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await deleteImages(galleryId, selectedImages, images, setGalleryData);
              setSelectedImages([]);
              setIsMultiSelectMode(false);
            }}
            style={{
              padding: 16,
              backgroundColor: 'red',
              borderRadius: 10,
              width: 150,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Feather name="trash" size={18} color="white" />
            <Text style={{ color: 'white', textAlign: 'center', marginLeft: 8 }}>
              {selectedImages.length}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upload Media Button */}
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <TouchableOpacity onPress={openPicker}>
          <MaterialIcons name="cloud-upload" size={40} color="white" />
        </TouchableOpacity>
      </View>

      {/* Upload Action Button */}
      {newMedia.length > 0 && (
        <TouchableOpacity
          onPress={handleUploadMedia}
          disabled={uploading}
          style={{
            marginTop: 20,
            padding: 16,
            backgroundColor: 'green',
            borderRadius: 10,
            width: 250,
            alignSelf: 'center'
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            {uploading ? 'Uploading...' : `Upload ${newMedia.length} Image${newMedia.length > 1 ? 's' : ''}`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Image Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.8)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 60, right: 12, zIndex: 1 }}
            onPress={() => setModalVisible(false)}
          >
            <Feather name="x" size={35} color="white" />
          </TouchableOpacity>

          <FlatList
            data={images}
            horizontal
            pagingEnabled
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: screenWidth
              }}>
                <Image
                  source={{ uri: item }}
                  style={{
                    width: screenWidth,
                    height: screenWidth * 1,
                    borderRadius: 3,
                  }}
                  resizeMode="contain"
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
          <View style={{ flexDirection: 'row', marginBottom: 30 }}>
            <TouchableOpacity
              onPress={() => handleExportImage(images[selectedImageIndex])}
              style={{
                padding: 10,
                backgroundColor: 'gray',
                borderRadius: 10,
                marginRight: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <AntDesign name="download" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteImages(galleryId, [images[selectedImageIndex]], images, setGalleryData)}
              style={{
                padding: 10,
                backgroundColor: 'red',
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Feather name="trash" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modals */}
      {settingsModalVisible && (
        <SettingsModal
  visible={settingsModalVisible}
  onClose={() => setSettingsModalVisible(false)}
  onAccessPress={() => {
    setAccessModalVisible(true);
    setSettingsModalVisible(false);
  }}
  onDeletePress={() => {
    setDeleteModalVisible(true);
    setSettingsModalVisible(false);
  }}
  galleryId={galleryId} // Pass the galleryId prop
  onThumbnailUpdated={() => fetchGallery()} // Ensure the gallery refreshes after update
/>

      )}
      {deleteModalVisible && (
        <DeleteModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          onDelete={handleDeleteGallery}
        />
      )}
      {qrModalVisible && (
        <QRModal
          visible={qrModalVisible}
          onClose={() => setQrModalVisible(false)}
          galleryId={galleryId}
        />
      )}
      {accessModalVisible && (
        <AccessModal
          visible={accessModalVisible}
          onClose={() => setAccessModalVisible(false)}
          galleryId={galleryId}
        />
      )}
    </SafeAreaView>
  );
};

export default GalleryDetails;
