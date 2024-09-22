import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { icons } from '../../constants';
import { router } from 'expo-router';
import { createPost } from '../../lib/appwrite'; // Updated to createPost
import { useGlobalContext } from '../../context/GlobalProvider';

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    asset: null, // Dynamic asset (image or video)
    thumbnail: null,
    type: null, // New state to track the type of the asset
  });

  const openPicker = async (selectType, isThumbnail = false) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: selectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

    if (!result.canceled) {
      if (isThumbnail) {
        // Set the thumbnail when uploading a thumbnail image for a video
        setForm({
          ...form,
          thumbnail: result.assets[0],
        });
      } else {
        // Set the main asset (image or video)
        setForm({
          ...form,
          asset: result.assets[0],
          type: selectType, // Set the type (image or video)
        });
      }
    } else {
      Alert.alert('No file selected');
    }
  };

  const submit = async () => {
    // Ensure the title and asset (either image or video) are provided
    if (form.title === "" || !form.asset || !form.type) {
      return Alert.alert("Please provide all required fields");
    }

    // Handle the case for image uploads
    if (form.type === "image") {
      // If it's an image and no thumbnail is provided, use the image as the thumbnail
      if (!form.thumbnail) {
        setForm({ ...form, thumbnail: form.asset });
      }
    }

    // Handle the case for video uploads
    if (form.type === "video") {
      // Ensure a thumbnail is provided for videos
      if (!form.thumbnail) {
        return Alert.alert("Please provide a thumbnail for the video");
      }
    }

    setUploading(true);
    try {
      await createPost({
        ...form,
        userId: user.$id,
      }, form.type); // Pass type (image/video)

      Alert.alert("Success", "Post uploaded successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      // Reset the form after submission
      setForm({
        title: "",
        asset: null,
        thumbnail: null,
        type: null,
      });
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">
          Upload Image or Video
        </Text>
        <FormField
          title="Title"
          value={form.title}
          placeholder="Provide a title ..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-10"
        />
<View className="mt-7 space-y-4">
  <Text className="text-base text-gray-100 font-pmedium">
    Upload Video
  </Text>
  <TouchableOpacity onPress={() => openPicker('video')}>
    {form.type === 'video' && form.asset ? (
      <Video
        source={{ uri: form.asset.uri }}
        className="w-full h-64 rounded-2xl"
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping
      />
    ) : (
      <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
        <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
          <Image source={icons.upload} resizeMethod='contain' className="w-1/2 h-1/2" />
        </View>
      </View>
    )}
  </TouchableOpacity>

  <Text className="text-base text-gray-100 font-pmedium">
    Upload Image
  </Text>
  <TouchableOpacity onPress={() => openPicker('image')}>
    {form.type === 'image' && form.asset ? (
      <Image
        source={{ uri: form.asset.uri }}
        resizeMode="cover"
        className="w-full h-64 rounded-2xl"
      />
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
          <TouchableOpacity onPress={() => openPicker('image', true)}>
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

export default Create;
