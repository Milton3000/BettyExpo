import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Feather } from '@expo/vector-icons';

const QRModal = ({ visible, onClose, galleryId }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
        <TouchableOpacity style={{ position: 'absolute', top: 60, right: 12, zIndex: 1 }} onPress={onClose}>
          <Feather name="x" size={35} color="white" />
        </TouchableOpacity>
        <QRCode value={`betty://gallery/${galleryId}`} size={250} color="white" backgroundColor="black" />
        <Text style={{ color: 'white', marginTop: 20 }}>Scan this code to view the gallery.</Text>
      </View>
    </Modal>
  );
};

export default QRModal;
