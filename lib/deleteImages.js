import { Alert } from 'react-native';
import { databases, storage, config } from '../lib/appwrite';

// Helper function to extract the file ID from the file URL
const getFileIdFromUrl = (url) => {
  const regex = /files\/([a-zA-Z0-9]+)\//; // Extract the file ID from the URL
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Function to delete selected images from gallery and storage
export const deleteImages = async (galleryId, selectedImages, allImages, setGalleryData) => {
  try {
    // First, delete the selected images from storage
    const promises = selectedImages.map(async (imageUrl) => {
      const fileId = getFileIdFromUrl(imageUrl);
      if (fileId) {
        await storage.deleteFile(config.storageId, fileId); // Delete the file from storage
      }
    });

    // Wait for all selected images to be deleted from storage
    await Promise.all(promises);

    // Filter out the deleted images from the gallery's image list
    const updatedImages = allImages.filter((image) => !selectedImages.includes(image));

    // Update the gallery with the new list of images
    await databases.updateDocument(
      config.databaseId,
      config.galleriesCollectionId,
      galleryId,
      { images: updatedImages }
    );

    // Update the gallery data in the state
    setGalleryData((prevGallery) => ({
      ...prevGallery,
      images: updatedImages,
    }));

  } catch (error) {
    console.error('Error deleting images:', error);
    Alert.alert('Error', 'Failed to delete images.');
  }
};