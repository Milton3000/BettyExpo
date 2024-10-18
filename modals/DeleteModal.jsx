import React from 'react';
import { Modal, View, Text, TouchableOpacity, Alert } from 'react-native';

const DeleteModal = ({ visible, onClose, onDelete }) => {
  const handleDelete = async () => {
    try {
      await onDelete();
      // Alert.alert('Success', 'Gallery deleted successfully!');
      onClose(); // Close modal after deletion
    } catch (error) {
      Alert.alert('Error', `Failed to delete gallery: ${error.message}`);
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
            Confirm Delete
          </Text>
          <Text style={{ marginBottom: 30, textAlign: 'center' }}>
            Are you sure you want to delete this gallery? This action cannot be undone.
          </Text>
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              padding: 10,
              backgroundColor: 'red',
              borderRadius: 10,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={{ fontWeight: 'bold', color: 'black' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteModal;
