import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  FlatList,
} from "react-native";
import { Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import SettingsModal from "../../modals/SettingsModal";
import DeleteModal from "../../modals/DeleteModal";
import QRModal from "../../modals/QRModal";
import AccessModal from "../../modals/AccessModal";
import { useUploadMedia } from "../../hooks/useUploadMedia";
import { deleteImages } from "../../lib/deleteImages";
import { databases, config, deleteGallery } from "../../lib/appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [deletedGalleries, setDeletedGalleries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);


  const { uploadMedia, newMedia, openPicker, uploading } = useUploadMedia();
  const screenWidth = Dimensions.get("window").width;

  // Fetch gallery data
  const fetchGallery = async () => {
    try {
      if (!galleryId || deletedGalleries.includes(galleryId)) {
        console.log("Gallery ID is invalid or deleted.");
        return;
      }

      const gallery = await databases.getDocument(
        config.databaseId,
        config.galleriesCollectionId,
        galleryId
      );

      if (gallery) {
        setGalleryData(gallery);
      } else {
        console.log("No gallery data found for ID:", galleryId);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  // Image selection/deselection logic
  const toggleSelectImage = (imageUri) => {
    if (selectedImages.includes(imageUri)) {
      setSelectedImages(selectedImages.filter((img) => img !== imageUri));
    } else {
      setSelectedImages([...selectedImages, imageUri]);
    }
  };

  useEffect(() => {
    if (galleryId && galleryId !== "") {
      fetchGallery();
    }
  }, [galleryId]);

  const handleDeleteGallery = async () => {
    try {
      const imagesToDelete = galleryData?.images ?? [];
      const thumbnailToDelete = galleryData?.thumbnail; // Undefined if null

      if (thumbnailToDelete) {
        await deleteGallery(
          config.galleriesCollectionId,
          galleryId,
          imagesToDelete,
          thumbnailToDelete
        );
      } else {
        await deleteGallery(
          config.galleriesCollectionId,
          galleryId,
          imagesToDelete
        );
      }

      setGalleryData(null);
      setDeletedGalleries((prev) => [...prev, galleryId]);
      router.push("/galleries");

    } catch (error) {
      console.error("Error deleting gallery:", error);
      Alert.alert("Error", `Failed to delete gallery: ${error.message}`);
    }
  };

  const handleDeleteSelectedImages = async () => {
    if (selectedImages.length === 0) {
      return Alert.alert("No images selected", "Please select images to delete.");
    }

    const allImages = galleryData?.images ?? [];

    await deleteImages(galleryId, selectedImages, allImages, setGalleryData);

    setSelectedImages([]);
    setIsMultiSelectMode(false);
  };

  const handleUploadMedia = async () => {
    await uploadMedia(galleryId, databases, config);
    await fetchGallery();
  };

  if (loading) return <Text>Loading...</Text>;
  if (!galleryData) return <Text>No gallery found</Text>;

  const { title, images = [], eventDate } = galleryData;

  // Prepare images array, filtering out falsy values and re-indexing
  const filteredImages = images
    .filter(Boolean)
    .map((img, index) => ({ uri: img, id: index.toString() }));

  const renderImage = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => {
        if (!isMultiSelectMode) {
          setSelectedImageIndex(index);
          setModalVisible(true);
        } else {
          toggleSelectImage(item.uri);
        }
      }}
      onLongPress={() => {
        if (!isMultiSelectMode) {
          setIsMultiSelectMode(true);
          toggleSelectImage(item.uri);
        }
      }}
      style={{
        width: (screenWidth - 20) / 3, // Ensuring 3 images per row
        height: (screenWidth - 20) / 3,
        borderWidth: 0.5, // This adds a solid border
        borderColor: "#0000", // You can change the color to any valid color, here it's black
      }}
    >
      <Image
        source={{ uri: item.uri }}
        style={{
          width: "100%",
          height: "100%",
        }}
        resizeMode="cover"
      />
      {selectedImages.includes(item.uri) && (
        <View
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 12,
            padding: 2,
          }}
        >
          <Feather name="check" size={16} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="bg-primary h-full">
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          marginTop: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/galleries")}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)", // Temporary background for visibility
            borderRadius: 20, // Optional: round the background
          }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              setSelectedImages([]);
            }}
            style={{
              padding: 6,
              backgroundColor: isMultiSelectMode ? "#ff6347" : "#1e90ff",
              borderRadius: 5,
              marginRight: 10,
            }}
          >
            <Text className="font-helveticabold" style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>
              {isMultiSelectMode ? "Cancel" : "Select"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSettingsModalVisible(true)}>
            <Feather name="settings" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setQrModalVisible(true)}
            style={{ marginLeft: 10 }}
          >
            <MaterialIcons name="qr-code" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <Text className="font-helveticabold"
        style={{
          color: "white",
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center",
          marginTop: 5,
        }}
      >
        {title}
      </Text>
      {eventDate && (
        <Text className="font-helvetica" style={{ color: "gray", textAlign: "center", marginTop: 4, marginBottom: 4, }}>
          {new Date(eventDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      )}

      {/* Scrollable Image Gallery */}
      <FlatList
        data={filteredImages}
        keyExtractor={(item) => item.id}
        renderItem={renderImage}
        numColumns={3} // 3 images per row
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={fetchGallery}
        contentContainerStyle={{
          flexWrap: "wrap",
          justifyContent: "flex-start",
          paddingHorizontal: 10,
        }}
      />

      {/* Action Buttons */}
      <View style={{ marginTop: 10, alignItems: "center" }}>
        {isMultiSelectMode && selectedImages.length > 0 && (
          <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() =>
                handleExportMultipleImages(
                  selectedImages,
                  setSelectedImages,
                  setIsMultiSelectMode
                )
              }
              style={{
                padding: 16,
                backgroundColor: "gray",
                borderRadius: 10,
                width: 150,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AntDesign name="download" size={18} color="white" />
              <Text style={{ color: "white", textAlign: "center", marginLeft: 8 }}>
                {selectedImages.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteSelectedImages}
              style={{
                padding: 16,
                backgroundColor: "red",
                borderRadius: 10,
                width: 150,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="trash" size={18} color="white" />
              <Text style={{ color: "white", textAlign: "center", marginLeft: 8 }}>
                {selectedImages.length}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upload Media Button */}
        {!isMultiSelectMode && (
          <TouchableOpacity onPress={() => openPicker(galleryId, fetchGallery)} style={{ marginBottom: 10 }}>
            <MaterialIcons name="cloud-upload" size={40} color="white" />
          </TouchableOpacity>
        )}

        {/* {newMedia.length > 0 && (
          <TouchableOpacity
            onPress={handleUploadMedia}
            disabled={uploading}
            style={{
              padding: 16,
              backgroundColor: "green",
              borderRadius: 10,
              width: 250,
              alignSelf: "center",
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              {uploading
                ? "Uploading..."
                : `Upload ${newMedia.length} Image${newMedia.length > 1 ? "s" : ""}`}
            </Text>
          </TouchableOpacity>
        )} */}
      </View>

      {/* Modal for image preview */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity style={{ position: "absolute", top: 60, right: 12, zIndex: 1 }} onPress={() => setModalVisible(false)}>
            <Feather name="x" size={35} color="white" />
          </TouchableOpacity>

          <FlatList
            data={images}
            horizontal
            pagingEnabled
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ alignItems: "center", justifyContent: "center", width: screenWidth }}>
                <Image
                  source={{ uri: item }}
                  style={{
                    width: screenWidth,
                    height: screenWidth * 1.33,
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
          <View style={{ flexDirection: "row", marginBottom: 30 }}>
            <TouchableOpacity
              onPress={() => handleExportImage(images[selectedImageIndex])}
              style={{
                padding: 10,
                backgroundColor: "gray",
                borderRadius: 10,
                marginRight: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <AntDesign name="download" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                deleteImages(galleryId, [images[selectedImageIndex]], images, setGalleryData)
              }
              style={{
                padding: 10,
                backgroundColor: "red",
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Feather name="trash" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
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
          galleryId={galleryId}
          onThumbnailUpdated={() => fetchGallery()}
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
