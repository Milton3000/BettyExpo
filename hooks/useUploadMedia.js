import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { addImagesToGallery, addVideosToGallery, uploadFile } from '../lib/appwrite';

export const useUploadMedia = () => {
  const [newMedia, setNewMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [mediaType, setMediaType] = useState(null);

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

  const uploadMedia = async (galleryId, databases, config) => {
    if (newMedia.length === 0) {
      return Alert.alert('No media selected to upload.');
    }

    setUploading(true);

    try {
      const mediaUrls = await Promise.all(newMedia.map(async (media) => {
        let fileUri = media.uri;

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

      if (mediaType === 'image') {
        await addImagesToGallery(galleryId, mediaUrls);
      } else {
        await addVideosToGallery(galleryId, mediaUrls);
      }

      Alert.alert('Success', 'Media uploaded successfully!');
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
