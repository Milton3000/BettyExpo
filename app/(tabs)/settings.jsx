
import React from 'react';
import { View, Text } from 'react-native';

const Settings = () => {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Settings</Text>

      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 18 }}>Account</Text>
        <Text style={{ color: '#888' }}>Manage your account settings</Text>
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 18 }}>Notifications</Text>
        <Text style={{ color: '#888' }}>Adjust your notification preferences</Text>
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 18 }}>Privacy</Text>
        <Text style={{ color: '#888' }}>Control your privacy settings</Text>
      </View>

      <View>
        <Text style={{ fontSize: 18 }}>Help</Text>
        <Text style={{ color: '#888' }}>Get support or find FAQs</Text>
      </View>
    </View>
  );
};

export default Settings;





// import { View, FlatList, TouchableOpacity, Image } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import EmptyState from '../../components/EmptyState';
// import { getUserGalleries, signOut } from '../../lib/appwrite';
// import useAppwrite from '../../lib/useAppwrite';
// import { useGlobalContext } from '../../context/GlobalProvider';
// import { icons } from '../../constants';
// import { router } from "expo-router";
// import InfoBox from '../../components/InfoBox';
// import GalleryCard from '../../components/GalleryCard'; // Using GalleryCard

// const Profile = () => {
//   const { user, setUser, setIsLogged } = useGlobalContext();

//   // Fetch user galleries instead of posts
//   const { data: galleries } = useAppwrite(() => getUserGalleries(user?.$id));

//   const logout = async () => {
//     await signOut();
//     setUser(null);
//     setIsLogged(false);
//     router.replace("/sign-in");
//   };

//   return (
//     <SafeAreaView className="bg-primary h-full">
//       <FlatList
//         data={galleries} // Render user galleries instead of posts
//         keyExtractor={(item) => item.$id}
//         renderItem={({ item }) => <GalleryCard gallery={item} />} // Use GalleryCard for rendering galleries
//         ListHeaderComponent={() => (
//           <View className="w-full justify-center items-center mt-6 mb-12 px-4">
//             <TouchableOpacity className="w-full items-end mb-10" onPress={logout}>
//               <Image
//                 source={icons.logout}
//                 resizeMode="contain"
//                 className="w-6 h-6"
//               />
//             </TouchableOpacity>

//             {/* Avatar Section */}
//             {user?.avatar ? (
//               <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
//                 <Image source={{ uri: user?.avatar }} className="w-[90%] h-[90%] rounded-lg" resizeMode="cover" />
//               </View>
//             ) : (
//               <Text className="text-white">No Avatar Found</Text>
//             )}

//             {/* Username and Info */}
//             <InfoBox
//               title={user?.username || 'Unknown User'} // Ensure username is displayed
//               containerStyles="mt-5"
//               titleStyles="text-lg text-white"
//             />

//             {/* Gallery Count */}
//             <View className="justify-center items-center">
//               <InfoBox
//                 title={galleries?.length || 0} // Show the number of galleries
//                 subtitle="Galleries"
//                 containerStyles="" // Remove any margin-right for centering
//                 titleStyles="text-xl text-white"
//               />
//             </View>
//           </View>
//         )}
//         ListEmptyComponent={() => (
//           <EmptyState
//             title="No galleries found"
//             subtitle="You haven't created any galleries yet."
//           />
//         )}
//       />
//     </SafeAreaView>
//   );
// };

// export default Profile;




// ORIGINAL PROFILE (BEFORE)
// import { View, FlatList, TouchableOpacity, Image, } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import ImageCard from '../../components/ImageCard'; // ImageCard
// import VideoCard from '../../components/VideoCard';
// import EmptyState from '../../components/EmptyState';
// import { videoCollectionId, imageCollectionId, getUserPosts, signOut } from '../../lib/appwrite';
// import useAppwrite from '../../lib/useAppwrite';
// import { useGlobalContext } from '../../context/GlobalProvider';
// import { icons } from '../../constants';
// import { router } from "expo-router";
// import InfoBox from '../../components/InfoBox';

// const Profile = () => {
//   const { user, setUser, setIsLogged } = useGlobalContext();
//   const { data: posts } = useAppwrite(() => getUserPosts(user.$id));

//   const logout = async () => {
//     await signOut();
//     setUser(null)
//     setIsLogged(false)

//     router.replace("/sign-in")
//   }
//   return (
//     <SafeAreaView className="bg-primary h-full">
//       <FlatList
//         data={posts}
//         keyExtractor={(item) => item.$id}
//         renderItem={({ item }) => {
//           if (item.collectionId === videoCollectionId) {
//             return <VideoCard video={item} />;
//           } else if (item.collectionId === imageCollectionId) {
//             return <ImageCard image={item} />;
//           }
//           return null; // Handle other cases or ignore them
//         }}
//         ListHeaderComponent={() => (
//           <View className="w-full justify-center items-center mt-6 mb-12 px-4">
//             <TouchableOpacity className="w-full items-end mb-10"
//               onPress={logout}
//             >
//               <Image
//                 source={icons.logout}
//                 resizeMode='contain'
//                 className="w-6 h-6"
//               />
//             </TouchableOpacity>
//             <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
//               <Image source={{ uri: user?.avatar }} className="w-[90%] h-[90%] rounded-lg" resizeMode='cover' />
//             </View>
//             <InfoBox
//               title={user?.username}
//               containerStyles="mt-5"
//               titleStyles="text-lg"
//             />
//             <View className="mt-5 flex-row">
//               <InfoBox
//                 title={posts.length || 0}
//                 subtitle="Posts"
//                 containerStyles="mr-10"
//                 titleStyles="text-xl"
//               />
//               <InfoBox
//                 title="2" // KAN SKIPPA FOLLOWERS SEN
//                 subtitle="Galleries"
//                 titleStyles="text-xl"
//               />
//             </View>
//           </View>
//         )}
//         ListEmptyComponent={() => (
//           <EmptyState
//             title="No posts found"
//             subtitle="You haven't posted anything yet."
//           />
//         )}
//       />
//     </SafeAreaView>
//   );
// }

// export default Profile;

