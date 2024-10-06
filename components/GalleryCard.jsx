import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { icons } from '../constants';

const GalleryCard = ({ gallery }) => {
  // console.log('Gallery Data:', gallery); // Log gallery data for inspection
  
  const username = gallery?.users?.[0]?.username || "Unknown User"; // Access the expanded username

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center flex-1 ml-3 gap-y-1">
          <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
            {gallery.title || "Untitled"}
          </Text>
          <Text className="text-xs text-gray-100 font-pregular" numberOfLines={1}>
            {username}
          </Text>
        </View>
        <View className="pt-2">
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
      >
        <Image
          source={{ uri: gallery.thumbnail }}
          className="w-full h-full rounded-xl mt-3"
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
};

export default GalleryCard;
