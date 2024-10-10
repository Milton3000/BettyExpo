import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { databases, config } from '../lib/appwrite'; // Import Appwrite setup

const AccessModal = ({ visible, onClose, galleryId }) => {
  const [selectedAccessLevel, setSelectedAccessLevel] = useState(0); // Default to "View Only"

  const saveAccessLevel = async () => {
    if (!galleryId) {
      console.error('Gallery ID is missing.');
      return;
    }

    try {
      // Update the accessLevel in the Appwrite database
      await databases.updateDocument(
        config.databaseId,
        config.galleriesCollectionId,
        galleryId, // Make sure this is the document ID
        { accessLevel: selectedAccessLevel }
      );

      onClose(); // Close the modal after saving
    } catch (error) {
      console.error('Failed to update access level:', error);
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
              style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10,}}
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
