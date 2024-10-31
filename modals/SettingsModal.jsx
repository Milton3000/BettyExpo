import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { uploadFile } from '../lib/appwrite'; // Use your existing uploadFile function
import { databases, config } from '../lib/appwrite'; // Adjust the paths to your setup

const SettingsModal = ({ visible, onClose, onAccessPress, onDeletePress, galleryId, onThumbnailUpdated }) => {
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Open the image picker to select a new thumbnail
  const handleEditThumbnail = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
  
      if (!result.canceled) {
        const { uri } = result.assets[0]; // Adjust to ensure you are fetching the URI properly
        setSelectedThumbnail(uri); // Set the selected image URI
      } else {
        console.log('Thumbnail selection was canceled');
      }
    } catch (error) {
      console.error('Error selecting thumbnail:', error);
    }
  };
  

  // Compress and upload the new thumbnail
  const handleUploadThumbnail = async () => {
    if (!selectedThumbnail) {
      // return Alert.alert('No thumbnail selected', 'Please select a thumbnail first.');
    }

    try {
      setUploading(true); // Start the upload process

      // Compress the image before uploading
      const compressedImage = await ImageManipulator.manipulateAsync(
        selectedThumbnail,
        [{ resize: { width: 800 } }], // Resize for compression
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress and format
      );

      // Create a file object for the compressed image
      const file = {
        uri: compressedImage.uri,
        name: `thumbnail_${galleryId}.jpg`,
        type: 'image/jpeg', // Set the correct MIME type for images
      };

      const uploadedThumbnailUrl = await uploadFile(file, 'image/jpeg'); // Upload using your existing uploadFile function

      // Update the gallery document with the new thumbnail URL
      await databases.updateDocument(config.databaseId, config.galleriesCollectionId, galleryId, {
        thumbnail: uploadedThumbnailUrl, // Update the gallery document with the thumbnail URL
      });

      Alert.alert('Success', 'Thumbnail updated successfully!');
      setSelectedThumbnail(null); // Clear the selected thumbnail
      setUploading(false);
      onThumbnailUpdated(); // Notify parent component to refresh the gallery
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      Alert.alert('Error', error.message || 'Failed to upload thumbnail.');
      setUploading(false); // Stop the upload process in case of error
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
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

          {/* Edit Thumbnail Option */}
          <TouchableOpacity
            onPress={handleEditThumbnail}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 15,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              marginBottom: 15,
              borderWidth: 1,
              borderColor: '#ccc',
            }}
          >
            <Feather name="image" size={20} color="black" />
            <Text style={{ fontWeight: 'bold', color: 'black', marginLeft: 8 }}>
              {selectedThumbnail ? 'Change Thumbnail' : 'Edit Thumbnail'}
            </Text>
          </TouchableOpacity>

          {/* Only show the "Upload Thumbnail" button if a new thumbnail is selected */}
          {selectedThumbnail && (
            <TouchableOpacity
              onPress={handleUploadThumbnail}
              style={{
                padding: 15,
                backgroundColor: '#4CAF50',
                borderRadius: 8,
                marginBottom: 15,
                borderWidth: 1,
                borderColor: '#4CAF50',
                alignItems: 'center',
              }}
              disabled={uploading} // Disable the button during upload
            >
              {uploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{ fontWeight: 'bold', color: 'white' }}>Upload Thumbnail</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Access Option */}
          <TouchableOpacity
            onPress={onAccessPress}
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
            onPress={onDeletePress}
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
            onPress={onClose}
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
  );
};

export default SettingsModal;
