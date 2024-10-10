import React from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { deleteAccount } from '../lib/appwrite';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../context/GlobalProvider';

const DeleteAccountModal = ({ visible, onClose }) => {
  const { setUser, setIsLogged } = useGlobalContext();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    // Show a second confirmation alert before proceeding
    Alert.alert(
      'Confirm Delete',
      'Are you absolutely sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();  // Call the deleteAccount function
              setUser(null);
              setIsLogged(false);
              router.replace('/sign-in');
              Alert.alert('Success', 'Your account has been deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete your account.');
              console.error('Error deleting account:', error);
            }
            onClose();  // Close the modal after the action
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Delete Account</Text>
          <Text style={{ marginBottom: 30, textAlign: 'center' }}>
            Are you sure you want to delete your account? This action cannot be undone.
          </Text>
          <TouchableOpacity onPress={handleDeleteAccount} style={{ marginBottom: 30, padding: 10, backgroundColor: 'red', borderRadius: 10 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Delete Account</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}>
            <Text style={{ textAlign: 'center', color: 'blue' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteAccountModal;
