import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';

import { icons } from "../constants";

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 -top-8 ${otherStyles}`}>
      {/* Title with Helvetica-Bold */}
      <Text className="text-base text-gray-100 font-helveticabold">{title}</Text>

      <View className="border-2 border-black-200 w-full px-3 py-3 bg-black-100 rounded-2xl focus:border-secondary items-center flex-row">
      <TextInput
  className="flex-1 text-white font-helveticabold text-base"
  value={value}
  placeholder={placeholder}
  placeholderTextColor="#7b7b8b"
  onChangeText={handleChangeText}
  secureTextEntry={title === 'Password' && !showPassword}
  style={{
    lineHeight: 17,
  }}
/>



        {/* Show/Hide Password Toggle */}
        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyehide}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
