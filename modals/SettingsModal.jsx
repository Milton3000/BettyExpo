import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

const SettingsModal = ({ visible, onClose, onAccessPress, onDeletePress }) => {
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
