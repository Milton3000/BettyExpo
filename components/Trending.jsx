// import { TouchableOpacity, ImageBackground, Image, FlatList, Text } from 'react-native';
// import React, { useState } from 'react';
// import * as Animatable from 'react-native-animatable';
// import { icons } from '../constants';
// import { Video, ResizeMode } from 'expo-av';
// import { useRouter } from 'expo-router';  // Use router for navigation

// const zoomIn = {
//   0: {
//     scale: 0.9
//   },
//   1: {
//     scale: 1.1,
//   }
// }
// const zoomOut = {
//   0: {
//     scale: 1
//   },
//   1: {
//     scale: 0.9,
//   }
// }

// const TrendingItem = ({ activeItem, item, handleGalleryPress }) => {
//   const [play, setPlay] = useState(false);
//   const isVideo = !!item.video;

//   return (
//     <Animatable.View className="mr-5"
//       animation={activeItem === item.$id ? zoomIn : zoomOut}
//       duration={500}
//     >
//       <TouchableOpacity onPress={() => handleGalleryPress(item.$id)}>
//         {/* Render the title above the gallery item */}
//         {/* <Text className="text-center text-white font-bold mb-2">{item.title || 'Untitled'}</Text> */}

//         {isVideo ? (
//           play ? (
//             <Video 
//               source={{ uri: item.video }}
//               className="w-52 h-72 rounded-[35px] mt-3 bg-white/10"
//               resizeMode={ResizeMode.CONTAIN}
//               useNativeControls
//               shouldPlay
//               onPlaybackStatusUpdate={(status) => {
//                 if(status.didJustFinish) {
//                   setPlay(false);
//                 }
//               }}
//               onError={(error) => {
//                 console.error("Video error: ", error);
//               }}
//             />
//           ) : (
//             <TouchableOpacity className="relative justify-center items-center" activeOpacity={0.7}
//               onPress={() => setPlay(true)}>
//               <ImageBackground source={{
//                 uri: item.thumbnail
//               }}
//                 className="w-52 h-72 rounded-[35px] my-5 overflow-hidden shadow-lg shadow-black-40"
//                 resizeMode='cover'/>
//               <Image source={icons.play}
//                 className="w-12 h-12 absolute"
//                 resizeMode='contain' />
//             </TouchableOpacity>
//           )
//         ) : (
//           <ImageBackground source={{
//             uri: item.image || item.thumbnail
//           }}
//             className="w-52 h-72 rounded-[35px] my-5 overflow-hidden shadow-lg shadow-black-40"
//             resizeMode='cover'/>
//         )}
//       </TouchableOpacity>
//     </Animatable.View>
//   )
// }

// const Trending = ({ posts }) => {
//   const [activeItem, setActiveItem] = useState(posts[0]?.$id);
//   const router = useRouter();  // Initialize router for navigation

//   const viewableItemsChanged = ({ viewableItems }) => {
//     if (viewableItems.length > 0) {
//       setActiveItem(viewableItems[0].item.$id);
//     }
//   };

//   // Function to handle gallery press and navigate to gallery details page
//   const handleGalleryPress = (galleryId) => {
//     router.push(`/galleries/${galleryId}`);  // Navigate to [galleryId] page
//   };

//   return (
//     <FlatList
//       data={posts}
//       keyExtractor={(item) => item.$id}
//       renderItem={({ item }) => (
//         <TrendingItem
//           activeItem={activeItem}
//           item={item}
//           handleGalleryPress={handleGalleryPress}  // Pass the press handler
//         />
//       )}
//       onViewableItemsChanged={viewableItemsChanged}
//       viewabilityConfig={{
//         itemVisiblePercentThreshold: 70,
//       }}
//       contentOffset={{ x: 170 }}
//       horizontal
//     />
//   )
// }

// export default Trending;
