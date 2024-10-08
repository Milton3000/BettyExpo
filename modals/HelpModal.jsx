import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

const HelpModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Help</Text>
          <Text>Get support or find FAQs here.</Text>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: 'blue' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default HelpModal;
