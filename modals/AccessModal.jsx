import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { databases, config } from '../lib/appwrite';

const AccessModal = ({ visible, onClose, galleryId }) => {
  const [selectedAccessLevel, setSelectedAccessLevel] = useState(0); // Default to "View Only"
  
  // Fetch the current access level when the modal is opened
  useEffect(() => {
    const fetchAccessLevel = async () => {
      if (!galleryId) return;
      try {
        const gallery = await databases.getDocument(
          config.databaseId,
          config.galleriesCollectionId,
          galleryId
        );
        setSelectedAccessLevel(gallery.accessLevel || 0); // Default to "View Only" if not set
      } catch (error) {
        console.error('Failed to fetch access level:', error);
      }
    };
    if (visible) {
      fetchAccessLevel(); // Fetch the access level when modal is visible
    }
  }, [visible, galleryId]);

  const saveAccessLevel = async () => {
    if (!galleryId) {
      Alert.alert('Error', 'Gallery ID is missing.');
      return;
    }

    try {
      // Update the accessLevel in the Appwrite database
      await databases.updateDocument(
        config.databaseId,
        config.galleriesCollectionId,
        galleryId,
        { accessLevel: selectedAccessLevel }
      );
      Alert.alert('Success', 'Access level updated successfully!');
      onClose(); // Close the modal after saving
    } catch (error) {
      Alert.alert('Error', `Failed to update access level: ${error.message}`);
    }
  };

  const accessOptions = [
    { label: 'View Only', value: 0 },
    { label: 'Upload & Download', value: 1 },
    { label: 'Upload, Download & Delete', value: 2 },
  ];

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Access Settings</Text>
          <Text style={{ marginBottom: 10 }}>Select Access Level:</Text>

          {/* Render access options with circles */}
          {accessOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setSelectedAccessLevel(option.value)}
              style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}
            >
              <View
                style={{
                  height: 24,
                  width: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: 'gray',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                {selectedAccessLevel === option.value && (
                  <View
                    style={{
                      height: 12,
                      width: 12,
                      borderRadius: 6,
                      backgroundColor: 'black',
                    }}
                  />
                )}
              </View>
              <Text style={{ color: selectedAccessLevel === option.value ? 'blue' : 'black' }}>{option.label}</Text>
            </TouchableOpacity>
          ))}

          {/* Save and Close buttons */}
          <TouchableOpacity onPress={saveAccessLevel} style={{ marginTop: 20, padding: 10, backgroundColor: 'black', borderRadius: 5 }}>
            <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}>
            <Text style={{ textAlign: 'center', color: 'blue' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AccessModal;
