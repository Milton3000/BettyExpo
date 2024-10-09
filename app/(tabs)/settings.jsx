import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from '../../lib/appwrite';  // Import signOut
import { useGlobalContext } from '../../context/GlobalProvider';
import { useRouter } from 'expo-router';  // For navigation
import { icons } from '../../constants';  // For logout icon

// Import modals from the modals folder
import AccountModal from '../../modals/AccountModal';
import NotificationsModal from '../../modals/NotificationsModal';
import AccessModal from '../../modals/AccessModal';
import HelpModal from '../../modals/HelpModal';
import DeleteAccountModal from '../../modals/DeleteAccountModal';  // Import the Delete Account modal

const Settings = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [modalVisible, setModalVisible] = useState(null);  // Generic modal state
  const router = useRouter();

  // Logout functionality
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsLogged(false);
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Function to handle opening modals for each setting item
  const openModal = (modalType) => {
    setModalVisible(modalType);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        {/* Top-right Logout Button */}
        <TouchableOpacity onPress={logout} style={{ position: 'absolute', right: 10 }}>
          <Image source={icons.logout} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>

        {/* Settings Header */}
        <Text className="text-2xl text-white font-psemibold mb-10">Settings</Text>

        {/* Account Item */}
        <TouchableOpacity onPress={() => openModal('Account')} style={{ marginBottom: 20 }}>
          <Text className="text-base text-white">Account</Text>
          <Text className="text-sm text-gray-100">Manage your account settings</Text>
        </TouchableOpacity>

        {/* Notifications Item */}
        <TouchableOpacity onPress={() => openModal('Notifications')} style={{ marginBottom: 20 }}>
          <Text className="text-base text-white">Notifications</Text>
          <Text className="text-sm text-gray-100">Adjust your notification preferences</Text>
        </TouchableOpacity>

        {/* Access Item */}
        <TouchableOpacity onPress={() => openModal('Access')} style={{ marginBottom: 20 }}>
          <Text className="text-base text-white">Access</Text>
          <Text className="text-sm text-gray-100">Control your access settings</Text>
        </TouchableOpacity>

        {/* Help Item */}
        <TouchableOpacity onPress={() => openModal('Help')} style={{ marginBottom: 20 }}>
          <Text className="text-base text-white">Help</Text>
          <Text className="text-sm text-gray-100">Get support or find FAQs</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity onPress={() => openModal('DeleteAccount')} style={{ marginBottom: 20 }}>
          <Text className="text-base text-red-500">Delete Account</Text>  
        </TouchableOpacity>

        {/* Modals for each setting */}
        <AccountModal visible={modalVisible === 'Account'} onClose={() => setModalVisible(null)} />
        <NotificationsModal visible={modalVisible === 'Notifications'} onClose={() => setModalVisible(null)} />
        <AccessModal visible={modalVisible === 'Access'} onClose={() => setModalVisible(null)} />
        <HelpModal visible={modalVisible === 'Help'} onClose={() => setModalVisible(null)} />
        <DeleteAccountModal visible={modalVisible === 'DeleteAccount'} onClose={() => setModalVisible(null)} />
      </ScrollView>
    </SafeAreaView>
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

