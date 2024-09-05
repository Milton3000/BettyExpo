import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';

const Search = () => {
  const { query } = useLocalSearchParams();
  return (
    <SafeAreaView className="bg-primary h-full">
      <Text className="text-3xl text-white">{query}</Text>
    </SafeAreaView>
  )
}

export default Search




// Can extract the value of the search because of [].
// This will allow us to rename the page or get the query information for the specific search the user is trying to do.