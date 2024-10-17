import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, Text, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SettingsModal from '../../modals/SettingsModal';
import DeleteModal from '../../modals/DeleteModal';
import QRModal from '../../modals/QRModal';
import AccessModal from '../../modals/AccessModal';
import { useUploadMedia } from '../../hooks/useUploadMedia';
import { deleteImages } from '../../components/DeleteImage'; // Adjust the path if needed
import { handleExportImage, handleExportMultipleImages } from '../../utils/mediaUtils';
import { databases, config, deleteGallery } from '../../lib/appwrite';

const GalleryDetails = () => {
  const { galleryId } = useLocalSearchParams();
  const router = useRouter();
  const [galleryData, setGalleryData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // Retry related state
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3; // Limit the number of retries

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        if (!galleryId) {
          throw new Error('Gallery ID is missing or invalid.');
        }

        const gallery = await databases.getDocument(config.databaseId, config.galleriesCollectionId, galleryId);
        setGalleryData(gallery);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Error fetching gallery details:', error);

        if (error.message.includes('Document with the requested ID could not be found') && retryCount < maxRetries) {
          setTimeout(() => setRetryCount(retryCount + 1), 1000); // Retry after 1 second
        } else {
          Alert.alert('Error', 'Failed to load gallery details.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (retryCount <= maxRetries) {
      fetchGallery();
    }
  }, [galleryId, retryCount]);

  const toggleSelectImage = (imageUri) => {
    if (selectedImages.includes(imageUri)) {
      setSelectedImages(selectedImages.filter((img) => img !== imageUri));
    } else {
      setSelectedImages([...selectedImages, imageUri]);
    }
  };

  const handleDeleteGallery = async () => {
    try {
      await deleteGallery(config.galleriesCollectionId, galleryId, galleryData.images, galleryData.videos, galleryData.thumbnail);
      Alert.alert('Success', 'Gallery deleted successfully!');
      setDeleteModalVisible(false);
      router.push('/galleries');
    } catch (error) {
      Alert.alert('Error', `Failed to delete gallery: ${error.message}`);
      console.error('Error deleting gallery:', error);
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (!galleryData) return <Text>No gallery found</Text>;

  const { title, images = [], eventDate } = galleryData;
  const latestImages = images.slice().reverse(); // Reverse images to show the newest first

  return (
    <SafeAreaView className="bg-primary h-full">
  {/* Header */}
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16 }}>
    {/* Arrow aligned to the left */}
    <TouchableOpacity onPress={() => router.push('/galleries')}>
      <Feather name="arrow-left" size={24} color="white" />
    </TouchableOpacity>

    {/* Right-side buttons */}
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/* Select button */}
      <TouchableOpacity
        onPress={() => {
          setIsMultiSelectMode(!isMultiSelectMode);
          setSelectedImages([]); // Clear any existing selections when toggling mode
        }}
        style={{
          padding: 6,  // Reduced padding for smaller button
          backgroundColor: isMultiSelectMode ? '#ff6347' : '#1e90ff',
          borderRadius: 5,
          marginRight: 10, // Added space between settings and select button
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
        <View style={{ paddingHorizontal: 16, marginTop: 24, height: (screenWidth / 3) * 3 + 30 }}>
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
                  borderWidth: selectedImages.includes(item) ? 2 : 0,
                  borderColor: 'yellow',
                  borderRadius: 10,
                }}
              >
                <Image
                  source={{ uri: item }}
                  style={{
                    width: screenWidth / 3 - 18,
                    height: screenWidth / 3 - 15,
                    margin: 5,
                    borderRadius: 10
                  }}
                  resizeMode="cover"
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
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
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
              backgroundColor: 'green',
              borderRadius: 10,
              width: 150
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              {`Export ${selectedImages.length} Image${selectedImages.length > 1 ? 's' : ''}`}
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
              width: 150
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              {`Delete ${selectedImages.length} Image${selectedImages.length > 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upload Media Buttons */}
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

      {/* Upload Media Button */}
      {newMedia.length > 0 && (
        <TouchableOpacity
          onPress={() => uploadMedia(galleryId, databases, config)}
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
            {uploading ? 'Uploading...' : 'Upload Media'}
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
            data={latestImages}
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
                    height: screenWidth * 0.8,
                    borderRadius: 20
                  }}
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
          <View style={{ flexDirection: 'row', marginBottom: 30 }}>
            <TouchableOpacity
              onPress={() => handleExportImage(latestImages[selectedImageIndex])}
              style={{
                padding: 10,
                backgroundColor: 'gray',
                borderRadius: 10,
                marginRight: 10
              }}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteImages(galleryId, [latestImages[selectedImageIndex]], latestImages, setGalleryData)}
              style={{
                padding: 10,
                backgroundColor: 'red',
                borderRadius: 10
              }}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>Delete</Text>
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
