import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator'; // Import the image manipulation library for compression
import { Alert } from 'react-native';
import { addImagesToGallery, uploadFile } from '../lib/appwrite'; // Removed addVideosToGallery

export const useUploadMedia = () => {
  const [newMedia, setNewMedia] = useState([]);
  const [uploading, setUploading] = useState(false);

  const openPicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Allow only images
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewMedia(result.assets);
    } else {
      Alert.alert('No files selected');
    }
  };

  const compressImage = async (imageUri) => {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }], // Resize the image for compression
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Set compression level and format
    );
    return manipResult.uri;
  };

  const uploadMedia = async (galleryId, databases, config) => {
    if (newMedia.length === 0) {
      return Alert.alert('No media selected to upload.');
    }

    setUploading(true);

    try {
      const mediaUrls = await Promise.all(newMedia.map(async (media) => {
        let fileUri = media.uri;

        // Compress the image before uploading
        fileUri = await compressImage(media.uri);

        const fileName = media.fileName || fileUri.split('/').pop();
        const mimeType = media.mimeType || 'image/jpeg';
        const fileUrl = await uploadFile({
          name: fileName,
          uri: fileUri,
          type: mimeType,
        }, mimeType);

        if (!fileUrl) {
          throw new Error('File upload failed: No file URL returned');
        }

        return fileUrl;
      }));

      // Add the images to the gallery
      await addImagesToGallery(galleryId, mediaUrls);

      Alert.alert('Success', 'Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading media:', error.message || error);
      Alert.alert('Error', error.message || 'Failed to upload media.');
    } finally {
      setUploading(false);
      setNewMedia([]);
    }
  };

  return {
    newMedia,
    uploading,
    openPicker,
    uploadMedia,
  };
};
