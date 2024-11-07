import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import SettingsModal from "../../modals/SettingsModal";
import DeleteModal from "../../modals/DeleteModal";
import QRModal from "../../modals/QRModal";
import AccessModal from "../../modals/AccessModal";
import { useUploadMedia } from "../../hooks/useUploadMedia";
import { deleteImages } from "../../components/DeleteImage";
import {
  handleExportImage,
  handleExportMultipleImages,
} from "../../utils/mediaUtils";
import { databases, config, deleteGallery } from "../../lib/appwrite";

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
  const [deletedGalleries, setDeletedGalleries] = useState([]);

  const { uploadMedia, newMedia, openPicker, uploading } = useUploadMedia();
  const screenWidth = Dimensions.get("window").width;

  // Fetch gallery data
  const fetchGallery = async () => {
    try {
      if (!galleryId || deletedGalleries.includes(galleryId)) return;

      setRefreshing(true);
      const galleryList = await databases.listDocuments(
        config.databaseId,
        config.galleriesCollectionId
      );
      const galleryExists = galleryList.documents.some(
        (doc) => doc.$id === galleryId
      );

      if (!galleryExists) {
        setGalleryData(null);
        setDeletedGalleries((prev) => [...prev, galleryId]);
        return;
      }

      const gallery = await databases.getDocument(
        config.databaseId,
        config.galleriesCollectionId,
        galleryId
      );
      setGalleryData(gallery);
      // console.log("Fetched Images Array:", gallery.images); // Log for debugging
    } catch (error) {
      if (
        error.message.includes(
          "Document with the requested ID could not be found"
        )
      ) {
        Alert.alert("Error", "The requested gallery does not exist.");
        setDeletedGalleries((prev) => [...prev, galleryId]);
      } else {
        Alert.alert("Error", "Failed to load gallery details.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Image selection/deselection logic
  const toggleSelectImage = (image) => {
    if (selectedImages.includes(image)) {
      setSelectedImages(selectedImages.filter((img) => img !== image));
    } else {
      setSelectedImages([...selectedImages, image]);
    }
  };

  useEffect(() => {
    if (galleryId && galleryId !== "") {
      fetchGallery();
    }
  }, [galleryId]);

  const handleDeleteGallery = async () => {
    try {
      await deleteGallery(
        config.galleriesCollectionId,
        galleryId,
        galleryData.images,
        galleryData.thumbnail
      );
      setGalleryData(null);
      setDeletedGalleries((prev) => [...prev, galleryId]);
      router.push("/galleries");
    } catch (error) {
      Alert.alert("Error", `Failed to delete gallery: ${error.message}`);
    }
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

  return (
    <SafeAreaView className="bg-primary h-full">
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          marginTop: 16,
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
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>
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

      <Text
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
        <Text style={{ color: "gray", textAlign: "center", marginTop: 8 }}>
          Created on:{" "}
          {new Date(eventDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      )}

      {/* Scrollable Image Gallery */}
      <FlatList
        data={filteredImages} // Use filtered and re-indexed images array
        keyExtractor={(item) => item.id} // Use unique id from re-indexed images
        renderItem={({ item, index }) => (
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
              margin: 1,
              borderWidth: selectedImages.includes(item.uri) ? 1 : 0,
              borderColor: "yellow",
              borderRadius: 5,
            }}
          >
            <Image
              source={{ uri: item.uri }}
              style={{
                width: screenWidth / 3 - 1,
                height: screenWidth / 2.5 - 2.5,
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
        )}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={fetchGallery}
        style={{ height: screenWidth }} // Display only 3 rows of images
      />

      {/* Action Buttons */}
      <View style={{ marginTop: 10, alignItems: "center" }}>
        {isMultiSelectMode && selectedImages.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginBottom: 10,
            }}
          >
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
              <Text
                style={{ color: "white", textAlign: "center", marginLeft: 8 }}
              >
                {selectedImages.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await deleteImages(
                  galleryId,
                  selectedImages,
                  images,
                  setGalleryData
                );
                setSelectedImages([]);
                setIsMultiSelectMode(false);
              }}
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
              <Text
                style={{ color: "white", textAlign: "center", marginLeft: 8 }}
              >
                {selectedImages.length}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upload Media Button */}
        {!isMultiSelectMode && (
          <TouchableOpacity onPress={openPicker} style={{ marginBottom: 10 }}>
            <MaterialIcons name="cloud-upload" size={40} color="white" />
          </TouchableOpacity>
        )}

        {newMedia.length > 0 && (
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
                : `Upload ${newMedia.length} Image${
                    newMedia.length > 1 ? "s" : ""
                  }`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: 60, right: 12, zIndex: 1 }}
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
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: screenWidth,
                }}
              >
                <Image
                  source={{ uri: item }}
                  style={{
                    width: screenWidth,
                    height: screenWidth * 1.33,
                  }}
                  resizeMode="cover"
                />
              </View>
            )}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth
              );
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
                deleteImages(
                  galleryId,
                  [images[selectedImageIndex]],
                  images,
                  setGalleryData
                )
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
