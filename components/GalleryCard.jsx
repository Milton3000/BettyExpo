import { View, Text, Image } from 'react-native';
import React from 'react';

const GalleryCard = ({ gallery }) => {
  // Safeguard against invalid data
  const title = gallery?.title || "Untitled";  
  const thumbnail = gallery?.thumbnail || null; 

  return (
    <View style={{ padding: 16, backgroundColor: 'white', borderRadius: 10, shadowColor: 'black', shadowOpacity: 0.5 }}>
      {/* Display title above the image */}
      <Text style={{ marginBottom: 8, fontSize: 18, fontWeight: '600', color: 'black' }}>{title}</Text>

      {thumbnail ? (
        <Image
          source={{ uri: thumbnail }}
          style={{ width: '100%', height: 200, borderRadius: 10 }}
          resizeMode="cover"
        />
      ) : (
        <Text>No Thumbnail Available</Text>
      )}
    </View>
  );
};

export default GalleryCard;
