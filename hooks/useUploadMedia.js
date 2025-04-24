import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator'; // Import the image manipulation library for compression
import { Alert } from 'react-native';
import { addImagesToGallery, uploadFile } from '../lib/appwrite'; // Removed addVideosToGallery

export const useUploadMedia = () => {
  const [newMedia, setNewMedia] = useState([]);
  const [uploading, setUploading] = useState(false);

  const openPicker = async (galleryId, fetchGallery) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Allow only images
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewMedia(result.assets);

      // Automatically trigger the upload after selecting images
      await uploadMedia(galleryId, result.assets, fetchGallery); // Pass the galleryId here
    } else {
      // Optional: Alert for no media selected
      Alert.alert('No media selected');
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

  const uploadMedia = async (galleryId, media, fetchGallery) => {
    if (media.length === 0) {
      return Alert.alert('No media selected to upload.');
    }
  
    // Validate galleryId
    if (!galleryId || typeof galleryId !== 'string' || galleryId.length > 36) {
      return Alert.alert('Error', 'Invalid gallery ID');
    }
  
    setUploading(true);
  
    try {
      const mediaUrls = [];
      for (const item of media) {
        try {
          let fileUri = item.uri;
          fileUri = await compressImage(item.uri);
  
          const fileName = item.fileName || fileUri.split('/').pop();
          const mimeType = item.mimeType || 'image/jpeg';
          const fileUrl = await uploadFile({
            name: fileName,
            uri: fileUri,
            type: mimeType,
          }, mimeType);
  
          if (!fileUrl) {
            console.warn('File upload failed for:', fileName);
            continue; // Skip to next file if upload fails
          }
  
          mediaUrls.push(fileUrl);
        } catch (error) {
          console.error('Error uploading single file:', error);
        }
      }
  
      if (mediaUrls.length > 0) {
        await addImagesToGallery(galleryId, mediaUrls);
        await fetchGallery(); // Refresh the gallery data
      } else {
        Alert.alert('Warning', 'No files were successfully uploaded');
      }
  
    } catch (error) {
      console.error('Error in upload process:', error);
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
