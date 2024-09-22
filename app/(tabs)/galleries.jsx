import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { createGallery } from '../../lib/appwrite'; // Ensure you have this function
import { useGlobalContext } from '../../context/GlobalProvider';

const Galleries = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    images: [], // Store selected images
  });

  const openPicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map(asset => asset.uri);
      setForm({ ...form, images: [...form.images, ...selectedImages] });
    } else {
      Alert.alert('No images selected');
    }
  };

  const submit = async () => {
    if (form.title === "" || form.images.length === 0) {
      return Alert.alert("Please provide all required fields");
    }

    setUploading(true);
    try {
      await createGallery({
        title: form.title,
        images: form.images,
        userId: user.$id,
      });
      Alert.alert("Success", "Gallery created successfully");
      // Optionally, navigate to another screen
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({ title: "", images: [] });
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <View className="mb-10">
        <Text className="text-2xl text-white font-psemibold">
          Create a New Gallery
        </Text>
        </View>
        <FormField
          title="Gallery Title"
          value={form.title}
          placeholder="Enter gallery title..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
        />
        
        <View className="mt-7">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload Images
          </Text>
          <TouchableOpacity onPress={openPicker}>
            <View className="w-full h-40 bg-black-100 rounded-2xl justify-center items-center">
              <Text className="text-gray-100 font-pmedium">Choose Images</Text>
            </View>
          </TouchableOpacity>
          {form.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={{ width: '100%', height: 150, marginTop: 10 }} />
          ))}
        </View>

        <CustomButton 
          title="Create Gallery"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Galleries;
