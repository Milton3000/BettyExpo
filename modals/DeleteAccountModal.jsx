import React from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { deleteAccount } from '../../lib/appwrite';  // Import the deleteAccount function
import { useGlobalContext } from '../../context/GlobalProvider';
import { useRouter } from 'expo-router';

const DeleteAccountModal = ({ visible, onClose }) => {
  const { setUser, setIsLogged } = useGlobalContext();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      // Call the deleteAccount function
      await deleteAccount();
      
      // Reset user state and log out
      setUser(null);
      setIsLogged(false);
      
      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');

      // Close modal and redirect to sign-in page
      onClose();
      router.replace('/sign-in');
      
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account.');
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Delete Account</Text>
          <Text>Are you sure you want to delete your account and all its data? This action cannot be undone.</Text>
          
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: 'blue' }}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={{ marginTop: 10, backgroundColor: 'red', padding: 10, borderRadius: 5 }}>
            <Text style={{ textAlign: 'center', color: 'white' }}>Confirm Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteAccountModal;