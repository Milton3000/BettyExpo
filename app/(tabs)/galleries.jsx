import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { icons } from '../../constants';
import { router } from 'expo-router';
import { createGallery, uploadFile } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';

const Galleries = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    images: [],
    thumbnail: null,
  });

  const openPicker = async (isThumbnail = false) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: !isThumbnail,
    });

    if (!result.canceled) {
      if (isThumbnail) {
        setForm({
          ...form,
          thumbnail: result.assets[0],
        });
      } else {
        setForm({
          ...form,
          images: [...form.images, ...result.assets],
        });
      }
    } else {
      Alert.alert('No file selected');
    }
  };

  const submit = async () => {
    if (form.title === "" || form.images.length === 0 || !form.thumbnail) {
      return Alert.alert("Please provide all required fields");
    }

    setUploading(true);
    try {
      // Upload the thumbnail and get its URL
      const thumbnailUrl = await uploadFile(form.thumbnail);

      // Upload other images and collect their URLs
      const uploadedImageUrls = await Promise.all(
        form.images.map(image => uploadFile(image))
      );

      // Create the gallery with the image URLs
      await createGallery({
        title: form.title,
        description: form.description,
        eventDate: form.eventDate,
        thumbnail: thumbnailUrl, // Use the uploaded thumbnail URL
        images: uploadedImageUrls, // Use the uploaded image URLs
      });

      Alert.alert("Success", "Gallery created successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        title: "",
        images: [],
        thumbnail: null,
      });
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">
          Create a Gallery
        </Text>

        <FormField
          title="Title"
          value={form.title}
          placeholder="Provide a title ..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-10"
        />

        {/* Upload Images */}
        <View className="mt-7 space-y-4">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload Images
          </Text>
          <TouchableOpacity onPress={() => openPicker()}>
            {form.images.length > 0 ? (
              <View className="flex flex-wrap">
                {form.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image.uri }}
                    resizeMode="cover"
                    className="w-32 h-32 rounded-2xl m-2"
                  />
                ))}
              </View>
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image source={icons.upload} resizeMethod='contain' className="w-1/2 h-1/2" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Thumbnail Section */}
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">Thumbnail Image</Text>
          <TouchableOpacity onPress={() => openPicker(true)}>
            {form.thumbnail ? (
              <Image 
                source={{ uri: form.thumbnail.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
                <Image source={icons.upload} resizeMethod="contain" className="w-5 h-5" />
                <Text className="text-sm text-gray-100 font-pmedium">Choose a file</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <CustomButton 
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Galleries;
