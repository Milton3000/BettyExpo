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
import * as ImageManipulator from 'expo-image-manipulator'; // Add ImageManipulator import
import { StatusBar } from 'expo-status-bar';

const CreateGallery = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    galleryTitle: "",
    thumbnail: null,  // Thumbnail is optional
    assets: [], // Store multiple assets
    assetType: null, // Track type (image or video)
  });

  const openThumbnailPicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      // Compress the selected thumbnail image
      const compressedThumbnail = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1000 } }], // Resize to 1000px width
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG } // Compress to 80% quality
      );

      // Update the form with the compressed thumbnail
      setForm({
        ...form,
        thumbnail: {
          uri: compressedThumbnail.uri, // Replace URI with the compressed image URI
          name: result.assets[0].fileName || `thumbnail-${Date.now()}.jpg`, // Ensure fileName is present
          type: 'image/jpeg',
          size: compressedThumbnail.size || result.assets[0].fileSize, // Use the size or fallback
        },
      });
    } else {
      // Alert.alert('No thumbnail selected');
    }
  };

  // Function for opening image or video picker (Currently not in use)
  const openPicker = async (selectType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: selectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      // Set original assets directly
      setForm({
        ...form,
        assets: result.assets, // Use original assets
        assetType: selectType,
      });
    } else {
      Alert.alert('No files selected');
    }
  };

  const submit = async () => {
    if (form.galleryTitle === "") {
      return Alert.alert("Please provide a gallery title");
    }

    setUploading(true);
    try {
      // Prepare the data for gallery creation
      let galleryData = {
        title: form.galleryTitle,
        userId: user.$id,
        assets: [], // Explicitly sending an empty array for assets to prevent backend errors
      };

      // If a thumbnail is present, include it in the gallery data
      if (form.thumbnail) {
        const compressedImage = await ImageManipulator.manipulateAsync(
          form.thumbnail.uri,
          [{ resize: { width: 1000 } }], // Resize to 1000px width
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } // Compress to 80% quality
        );

        galleryData.thumbnail = {
          uri: compressedImage.uri,
          name: form.thumbnail.name,
          type: 'image/jpeg',
          size: compressedImage.size || form.thumbnail.size,
        };
      }

      // Log the data for debugging
      console.log('Gallery being created:', galleryData);

      // Create the gallery with the given data
      const { newGallery } = await createGallery(galleryData);

      // Alert.alert("Success", "Gallery created successfully");
      router.push("/galleries");
    } catch (error) {
      Alert.alert("Error creating gallery:", error.message);
    } finally {
      setForm({
        galleryTitle: "",
        thumbnail: null,
        assets: [], // Reset assets
        assetType: null,
      });
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#161622', flex: 1 }}>
      <StatusBar style="light" backgroundColor="#161622" />
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-helveticabold">Create a Gallery</Text>
        <FormField
  title="Gallery Title"
  value={form.galleryTitle}
  placeholder="Enter gallery title ..."
  handleChangeText={(e) => setForm({ ...form, galleryTitle: e })}
  otherStyles="mt-10"
/>


        {/* Thumbnail Section */}
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-helveticabold">Thumbnail Image</Text>
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
                <Text className="text-sm text-gray-100 font-helveticabold">Choose a thumbnail</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Asset Picker Section (Commented out for future use) */}
        {/* 
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
        */}

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











// This one is with compressed images and minimum MINIMUM_SIZE_THRESHOLD, but still doesnt work for some images. EntityTooSmall error.

// import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import FormField from '../../components/FormField';
// import CustomButton from '../../components/CustomButton';
// import * as ImagePicker from 'expo-image-picker';
// import { icons } from '../../constants';
// import { router } from 'expo-router';
// import { createGallery } from '../../lib/appwrite'; 
// import { useGlobalContext } from '../../context/GlobalProvider';
// import * as ImageManipulator from 'expo-image-manipulator'; 
// import { fetchGalleries } from '../../lib/appwrite'; 

// const MINIMUM_SIZE_THRESHOLD = 100 * 1024; // Minimum size of 100KB

// const CreateGallery = () => {
//   const { user } = useGlobalContext();
//   const [uploading, setUploading] = useState(false);
//   const [galleries, setGalleries] = useState([]);
//   const [form, setForm] = useState({
//     galleryTitle: "",
//     thumbnail: null,
//     assets: [],
//     assetType: null,
//   });

//   useEffect(() => {
//     const loadGalleries = async () => {
//       try {
//         const galleryList = await fetchGalleries();
//         setGalleries(galleryList);
//       } catch (error) {
//         console.error("Error fetching galleries:", error.message);
//       }
//     };
//     loadGalleries();
//   }, []);

//   const openPicker = async (selectType) => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: selectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
//       allowsMultipleSelection: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       let compressedAssets = result.assets;

//       // Compress images if the asset type is 'image'
//       if (selectType === 'image') {
//         compressedAssets = await Promise.all(result.assets.map(async (asset) => {
//           const compressedImage = await ImageManipulator.manipulateAsync(
//             asset.uri,
//             [{ resize: { width: 1500 } }], 
//             { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } 
//           );

//           if (compressedImage.size < MINIMUM_SIZE_THRESHOLD) {
//             console.warn("Image too small, skipping upload:", compressedImage.uri);
//             return null;
//           }

//           return {
//             ...asset,
//             uri: compressedImage.uri,
//             size: compressedImage.size, 
//           };
//         }));

//         compressedAssets = compressedAssets.filter(asset => asset !== null);
//       }

//       setForm({
//         ...form,
//         assets: compressedAssets,
//         assetType: selectType,
//       });
//     } else {
//       Alert.alert('No files selected');
//     }
//   };

//   const openThumbnailPicker = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       const compressedThumbnail = await ImageManipulator.manipulateAsync(
//         result.assets[0].uri,
//         [{ resize: { width: 1500 } }], 
//         { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } 
//       );

//       if (compressedThumbnail.size < MINIMUM_SIZE_THRESHOLD) {
//         Alert.alert("Thumbnail image is too small. Please choose a larger image.");
//         return;
//       }

//       setForm({
//         ...form,
//         thumbnail: {
//           ...result.assets[0],
//           uri: compressedThumbnail.uri, 
//         },
//       });
//     } else {
//       Alert.alert('No thumbnail selected');
//     }
//   };

//   const submit = async () => {
//     if (form.galleryTitle === "" || !form.thumbnail || form.assets.length === 0) {
//       return Alert.alert("Please provide all required fields");
//     }

//     setUploading(true);
//     try {
//       const { newGallery } = await createGallery({
//         title: form.galleryTitle,
//         thumbnail: form.thumbnail,
//         assets: form.assets,
//         assetType: form.assetType,
//         userId: user.$id,
//       });

//       setGalleries((prevGalleries) => [...prevGalleries, newGallery]);

//       fetchGalleries().then((updatedGalleries) => {
//         setGalleries(updatedGalleries);
//       });

//       Alert.alert("Success", "Gallery created successfully");
//       router.push("/home");
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setForm({
//         galleryTitle: "",
//         thumbnail: null,
//         assets: [],
//         assetType: null,
//       });
//       setUploading(false);
//     }
//   };

//   return (
//     <SafeAreaView className="bg-primary h-full">
//       <ScrollView className="px-4 my-6">
//         <Text className="text-2xl text-white font-psemibold">Create a Gallery</Text>
//         <FormField
//           title="Gallery Title"
//           value={form.galleryTitle}
//           placeholder="Enter gallery title ..."
//           handleChangeText={(e) => setForm({ ...form, galleryTitle: e })}
//           otherStyles="mt-10"
//         />

//         <View className="mt-7 space-y-2">
//           <Text className="text-base text-gray-100 font-pmedium">Thumbnail Image</Text>
//           <TouchableOpacity onPress={openThumbnailPicker}>
//             {form.thumbnail ? (
//               <Image 
//                 source={{ uri: form.thumbnail.uri }}
//                 resizeMode="cover"
//                 className="w-full h-64 rounded-2xl"
//               />
//             ) : (
//               <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
//                 <Image source={icons.upload} resizeMethod="contain" className="w-5 h-5" />
//                 <Text className="text-sm text-gray-100 font-pmedium">Choose a thumbnail</Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         <View className="mt-7 space-y-4">
//           <Text className="text-base text-gray-100 font-pmedium">
//             Upload {form.assetType ? form.assetType === "image" ? "Images" : "Videos" : "Images or Videos"}
//           </Text>
//           <TouchableOpacity onPress={() => openPicker(form.assetType ? form.assetType : 'image')}>
//             {form.assets.length > 0 ? (
//               <ScrollView horizontal>
//                 {form.assets.map((asset, index) => (
//                   <Image
//                     key={index}
//                     source={{ uri: asset.uri }}
//                     resizeMode="cover"
//                     className="w-40 h-40 mx-2 rounded-2xl"
//                   />
//                 ))}
//               </ScrollView>
//             ) : (
//               <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
//                 <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
//                   <Image source={icons.upload} resizeMethod='contain' className="w-1/2 h-1/2" />
//                 </View>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         <CustomButton 
//           title="Submit Gallery"
//           handlePress={submit}
//           containerStyles="mt-7"
//           isLoading={uploading}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default CreateGallery;










// THIS ONE IS FOR THE ORIGINAL BEFORE ALL THE SHIT. ENTITYTOOSMALL STILL OCCURS HERE BUT EASIER LOGIC:
// import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import FormField from '../../components/FormField';
// import CustomButton from '../../components/CustomButton';
// import * as ImagePicker from 'expo-image-picker';
// import { icons } from '../../constants';
// import { router } from 'expo-router';
// import { createGallery } from '../../lib/appwrite'; // Updated to createGallery
// import { useGlobalContext } from '../../context/GlobalProvider';
// import * as ImageManipulator from 'expo-image-manipulator'; // Add ImageManipulator import
// import { fetchGalleries } from '../../lib/appwrite'; // Import fetchGalleries (ALSO OPTIONAL)


// const CreateGallery = () => {
//   const { user } = useGlobalContext();
//   const [uploading, setUploading] = useState(false);
//   const [galleries, setGalleries] = useState([]); // (THIS ONE TOO OPTIONAL)
//   const [form, setForm] = useState({
//     galleryTitle: "",
//     thumbnail: null,
//     assets: [], // Store multiple assets
//     assetType: null, // Track type (image or video)
//   });

//     // Fetch galleries when the component mounts (MAYBE OPTIONAL? CAN BE REMOVED)
//     useEffect(() => {
//       const loadGalleries = async () => {
//         try {
//           const galleryList = await fetchGalleries();
//           setGalleries(galleryList);
//         } catch (error) {
//           console.error("Error fetching galleries:", error.message);
//         }
//       };
  
//       loadGalleries();
//     }, []);

//   const openPicker = async (selectType) => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: selectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
//       allowsMultipleSelection: true,
//       quality: 1,
//     });
  
//     if (!result.canceled) {
//       let compressedAssets = result.assets;
  
//       // Compress images if the asset type is 'image'
//       if (selectType === 'image') {
//         compressedAssets = await Promise.all(result.assets.map(async (asset) => {
//           const compressedImage = await ImageManipulator.manipulateAsync(
//             asset.uri,
//             [{ resize: { width: 1000 } }], // Resize to 1000px width
//             { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } // Compress to 80% quality
//           );
//           return {
//             ...asset,
//             uri: compressedImage.uri, // Replace the URI with the compressed image's URI
//           };
//         }));
//       }
  
//       setForm({
//         ...form,
//         assets: compressedAssets, // Save compressed assets
//         assetType: selectType,
//       });
//     } else {
//       Alert.alert('No files selected');
//     }
//   };
  
//   const openThumbnailPicker = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 1,
//     });
  
//     if (!result.canceled) {
//       // Compress the selected thumbnail image
//       const compressedThumbnail = await ImageManipulator.manipulateAsync(
//         result.assets[0].uri,
//         [{ resize: { width: 1000 } }], // Resize to 1000px width
//         { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } // Compress to 80% quality
//       );
  
//       // Update the form with the compressed thumbnail
//       setForm({
//         ...form,
//         thumbnail: {
//           ...result.assets[0],
//           uri: compressedThumbnail.uri, // Replace URI with the compressed image URI
//         },
//       });
//     } else {
//       Alert.alert('No thumbnail selected');
//     }
//   };

//   const submit = async () => {
//     if (form.galleryTitle === "" || !form.thumbnail || form.assets.length === 0) {
//       return Alert.alert("Please provide all required fields");
//     }
  
//     setUploading(true);
//     try {
//       // Create the gallery
//       const { newGallery } = await createGallery({
//         title: form.galleryTitle,
//         thumbnail: form.thumbnail,
//         assets: form.assets,
//         assetType: form.assetType,
//         userId: user.$id,
//       });
  
//       // Optimistic update for instant feedback
//       setGalleries((prevGalleries) => [...prevGalleries, newGallery]);
  
//       // Fetch new galleries in the background
//       fetchGalleries().then((updatedGalleries) => {
//         setGalleries(updatedGalleries);
//       });
  
//       Alert.alert("Success", "Gallery created successfully");
//       router.push("/home");
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setForm({
//         galleryTitle: "",
//         thumbnail: null,
//         assets: [],
//         assetType: null,
//       });
//       setUploading(false);
//     }
//   };
  
  
  

//   return (
//     <SafeAreaView className="bg-primary h-full">
//       <ScrollView className="px-4 my-6">
//         <Text className="text-2xl text-white font-psemibold">Create a Gallery</Text>
//         <FormField
//           title="Gallery Title"
//           value={form.galleryTitle}
//           placeholder="Enter gallery title ..."
//           handleChangeText={(e) => setForm({ ...form, galleryTitle: e })}
//           otherStyles="mt-10"
//         />

//         {/* Thumbnail Section */}
//         <View className="mt-7 space-y-2">
//           <Text className="text-base text-gray-100 font-pmedium">Thumbnail Image</Text>
//           <TouchableOpacity onPress={openThumbnailPicker}>
//             {form.thumbnail ? (
//               <Image 
//                 source={{ uri: form.thumbnail.uri }}
//                 resizeMode="cover"
//                 className="w-full h-64 rounded-2xl"
//               />
//             ) : (
//               <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
//                 <Image source={icons.upload} resizeMethod="contain" className="w-5 h-5" />
//                 <Text className="text-sm text-gray-100 font-pmedium">Choose a thumbnail</Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Asset Picker (Images or Videos) */}
//         <View className="mt-7 space-y-4">
//           <Text className="text-base text-gray-100 font-pmedium">
//             Upload {form.assetType ? form.assetType === "image" ? "Images" : "Videos" : "Images or Videos"}
//           </Text>
//           <TouchableOpacity onPress={() => openPicker(form.assetType ? form.assetType : 'image')}>
//             {form.assets.length > 0 ? (
//               <ScrollView horizontal>
//                 {form.assets.map((asset, index) => (
//                   <Image
//                     key={index}
//                     source={{ uri: asset.uri }}
//                     resizeMode="cover"
//                     className="w-40 h-40 mx-2 rounded-2xl"
//                   />
//                 ))}
//               </ScrollView>
//             ) : (
//               <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
//                 <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
//                   <Image source={icons.upload} resizeMethod='contain' className="w-1/2 h-1/2" />
//                 </View>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         <CustomButton 
//           title="Submit Gallery"
//           handlePress={submit}
//           containerStyles="mt-7"
//           isLoading={uploading}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default CreateGallery;
