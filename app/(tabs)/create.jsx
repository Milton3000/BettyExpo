import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import * as ImagePicker from 'expo-image-picker';
import { icons } from '../../constants';
import { router } from 'expo-router';
import { createGallery } from '../../lib/appwrite'; // Updated to createGallery
import { useGlobalContext } from '../../context/GlobalProvider';

const CreateGallery = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    galleryTitle: "",
    thumbnail: null,
    assets: [], // Store multiple assets
    assetType: null, // Track type (image or video)
  });

  const openPicker = async (selectType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: selectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true, // Allow multiple selection
      quality: 1,
    });

    if (!result.canceled) {
      setForm({
        ...form,
        assets: result.assets, // Save multiple assets
        assetType: selectType,
      });
    } else {
      Alert.alert('No files selected');
    }
  };

  const openThumbnailPicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setForm({
        ...form,
        thumbnail: result.assets[0],
      });
    } else {
      Alert.alert('No thumbnail selected');
    }
  };
  const submit = async () => {
    if (form.galleryTitle === "" || !form.thumbnail || form.assets.length === 0) {
      return Alert.alert("Please provide all required fields");
    }
  
    setUploading(true);
    try {
      const newGallery = await createGallery({
        title: form.galleryTitle,
        thumbnail: form.thumbnail,
        assets: form.assets,
        assetType: form.assetType,
        userId: user.$id, // Pass the user's ID directly
      });
  
      Alert.alert("Success", "Gallery created successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setForm({
        galleryTitle: "",
        thumbnail: null,
        assets: [],
        assetType: null,
      });
      setUploading(false);
    }
  };
  
  

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">Create a Gallery</Text>
        <FormField
          title="Gallery Title"
          value={form.galleryTitle}
          placeholder="Enter gallery title ..."
          handleChangeText={(e) => setForm({ ...form, galleryTitle: e })}
          otherStyles="mt-10"
        />

        {/* Thumbnail Section */}
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">Thumbnail Image</Text>
          <TouchableOpacity onPress={openThumbnailPicker}>
            {form.thumbnail ? (
              <Image 
                source={{ uri: form.thumbnail.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
                <Image source={icons.upload} resizeMethod="contain" className="w-5 h-5" />
                <Text className="text-sm text-gray-100 font-pmedium">Choose a thumbnail</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Asset Picker (Images or Videos) */}
        <View className="mt-7 space-y-4">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload {form.assetType ? form.assetType === "image" ? "Images" : "Videos" : "Images or Videos"}
          </Text>
          <TouchableOpacity onPress={() => openPicker(form.assetType ? form.assetType : 'image')}>
            {form.assets.length > 0 ? (
              <ScrollView horizontal>
                {form.assets.map((asset, index) => (
                  <Image
                    key={index}
                    source={{ uri: asset.uri }}
                    resizeMode="cover"
                    className="w-40 h-40 mx-2 rounded-2xl"
                  />
                ))}
              </ScrollView>
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image source={icons.upload} resizeMethod='contain' className="w-1/2 h-1/2" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <CustomButton 
          title="Submit Gallery"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateGallery;
