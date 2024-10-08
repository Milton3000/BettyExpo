import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

const DeleteAccountModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Delete Account</Text>
          <Text>Are you sure you want to delete your account and all data?</Text>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: 'blue' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            // Call your delete account function here
            onClose();
          }} style={{ marginTop: 10, backgroundColor: 'red', padding: 10, borderRadius: 5 }}>
            <Text style={{ textAlign: 'center', color: 'white' }}>Confirm Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteAccountModal;
