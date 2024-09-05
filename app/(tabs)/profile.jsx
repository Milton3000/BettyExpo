import { View, Text, FlatList, TouchableOpacity, Image, } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ImageCard from '../../components/ImageCard'; // ImageCard
import VideoCard from '../../components/VideoCard';
import EmptyState from '../../components/EmptyState';
import { videoCollectionId, imageCollectionId, getUserPosts } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import { icons } from '../../constants';

const Profile = () => {
  const { user } = useGlobalContext();
  const { data: posts } = useAppwrite(() => getUserPosts(user.$id));

  const logout = () => {

  }
  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => {
          if (item.collectionId === videoCollectionId) {
            return <VideoCard video={item} />;
          } else if (item.collectionId === imageCollectionId) {
            return <ImageCard image={item} />;
          }
          return null; // Handle other cases or ignore them
        }}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity className="w-full items-end mb-10"
            onPress={logout}
            >
          <Image 
          source={icons.logout}
          resizeMode='contain'
          className="w-6 h-6"
          />
            </TouchableOpacity>
            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
          <Image source={{ uri: user?.avatar}} className="w-[90%] h-[90%] rounded-lg" resizeMode='cover'/>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No posts found"
            subtitle="You haven't posted anything yet."
          />
        )}
      />
    </SafeAreaView>
  );
}

export default Profile;

