import { TouchableOpacity, Text } from 'react-native';
import React from 'react';

const CustomButton = ({ 
  title, 
  handlePress, 
  containerStyles, 
  textStyles, 
  isLoading 
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        backgroundColor: '#4b5c64',
        borderRadius: 16,
        minHeight: 62,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      className={`${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
      disabled={isLoading}
    >
      <Text className={`text-white font-helveticabold text-lg ${textStyles}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;