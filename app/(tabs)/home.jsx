import { View, Text, FlatList, Image, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from "../../constants";
import SearchInput from '../../components/SearchInput';
import Trending from '../../components/Trending';
import EmptyState from '../../components/EmptyState';
import { 
  getAllPosts, 
  getLatestPosts, 
  videoCollectionId, 
  imageCollectionId 
} from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import ImageCard from '../../components/ImageCard';
import { useGlobalContext } from '../../context/GlobalProvider';

const Home = () => {
  const { user } = useGlobalContext();
  const { data: posts, refetch } = useAppwrite(getAllPosts);
  const { data: latestPosts } = useAppwrite(getLatestPosts);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const renderItem = ({ item }) => {
    if (item.collectionId === videoCollectionId) {
      return <VideoCard video={item} />;
    } else if (item.collectionId === imageCollectionId) {
      return <ImageCard image={item} />;
    }
    return null;
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-1">
            <View className="justify-between items-start flew-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome Back,
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {user?.username}
                </Text>
              </View>
              <View className="mt-1.5">
                <Image
                  source={images.bettylogo4}
                  className="w-9 h-10"
                  resizeMode='contain'
                />
              </View>
            </View>
            <SearchInput />
            <View className="w-full flex-1 pt-5 pb-5">
              <Text className="text-gray-100 text-lg font-pregular mb-3">
                Gallery Preview
              </Text>
              <Trending posts={latestPosts ?? []} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No posts found"
            subtitle="Be the first one to upload a post"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  )
}

export default Home
// SafeAreaView = Scroll View
// FLatlist is used to Render a lot of elements. Can pass a lot of props.
// Values: Data = Array of list. keyExtractar = Key of the item. renderItem = explains React Native how we want to render each item in the list. 
