import { View, Text, FlatList, Image, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { images } from "../../constants";
import SearchInput from '../../components/SearchInput';
import Trending from '../../components/Trending';
import EmptyState from '../../components/EmptyState';
import { getAllPosts, getLatestGalleries } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import GalleryCard from '../../components/GalleryCard';
import { useGlobalContext } from '../../context/GlobalProvider';

const Home = () => {
  const { user } = useGlobalContext();
  const { data: posts, refetch: refetchPosts } = useAppwrite(getAllPosts);
  const [latestGalleries, setLatestGalleries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch the latest galleries
  const fetchGalleries = async () => {
    try {
      const galleries = await getLatestGalleries();
      setLatestGalleries(galleries);
    } catch (error) {
      console.error('Error fetching latest galleries:', error);
    }
  };

  useEffect(() => {
    fetchGalleries(); // Fetch galleries on component mount
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPosts(); // Refresh posts
    await fetchGalleries(); // Refresh galleries
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    return <GalleryCard gallery={item} />;
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-1">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                {/* Wrap all text content in <Text> */}
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
                  resizeMode="contain"
                />
              </View>
            </View>
            <SearchInput />
            <View className="w-full flex-1 pt-5 pb-5">
              <Text className="text-gray-100 text-lg font-bold mb-3">
                Gallery Preview
              </Text>
              {/* Pass latest galleries to Trending */}
              <Trending posts={latestGalleries} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No galleries found"
            subtitle="Be the first one to upload a gallery"
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
};

export default Home;

// SafeAreaView = Scroll View
// FLatlist is used to Render a lot of elements. Can pass a lot of props.
// Values: Data = Array of list. keyExtractar = Key of the item. renderItem = explains React Native how we want to render each item in the list. 
