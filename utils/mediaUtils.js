import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export const handleExportImage = async (imageUri) => {
  try {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Permission denied', 'Please grant permission to save images.');
    }

    const { uri } = await FileSystem.downloadAsync(imageUri, FileSystem.documentDirectory + 'image.jpg');
    const asset = await MediaLibrary.createAssetAsync(uri);
    await MediaLibrary.createAlbumAsync('Download', asset, false);

    Alert.alert('Success', 'Image saved to your gallery!');
  } catch (error) {
    console.error('Error exporting image:', error);
    Alert.alert('Error', 'Failed to export image.');
  }
};

export const handleExportMultipleImages = async (selectedImages, setSelectedImages, setIsMultiSelectMode) => {
  if (selectedImages.length === 0) {
    return Alert.alert('No images selected for export.');
  }

  try {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Permission denied', 'Please grant permission to save images.');
    }

    // Export the selected images
    for (const imageUri of selectedImages) {
      const { uri } = await FileSystem.downloadAsync(
        imageUri, 
        FileSystem.documentDirectory + 'image.jpg'
      );
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);
    }

    Alert.alert('Success', 'Selected images saved to your gallery!');
    
    // Reset the state after exporting
    setSelectedImages([]); // Clear the selected images
    setIsMultiSelectMode(false); // Exit multi-selection mode
  } catch (error) {
    console.error('Error exporting images:', error);
    Alert.alert('Error', 'Failed to export images.');
  }
};
