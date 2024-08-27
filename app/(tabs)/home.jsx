import { View, Text, FlatList, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from "../../constants";

const Home = () => {
  return (
    <SafeAreaView className="bg-primary">
      <FlatList
        data={[{ id: 1 }, { id: 2 }, { id: 3 },]}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <Text className="text-3xl text-white"> {item.id}
          </Text>
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between items-start flew-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome Back
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  Betty
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
          </View>
        )}
      />
    </SafeAreaView>
  )
}

// FLatlist is used to Render a lot of elements. Can pass a lot of props.
// Values: Data = Array of list. keyExtractar = Key of the item. renderItem = explains React Native how we want to render each item in the list. 

export default Home