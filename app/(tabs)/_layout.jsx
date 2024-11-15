import { View, Text } from 'react-native';
import { Tabs } from "expo-router";
import Ionicons from 'react-native-vector-icons/Ionicons';

const TabIcon = ({ iconName, color, name, focused }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', paddingTop: 10 }}>
      <Ionicons name={iconName} size={24} color={color} style={{ marginBottom: 4 }} />
      <Text 
        style={{ color: color, fontSize: 12, textAlign: 'center', fontWeight: focused ? '600' : '400', width: 60 }} // Set width for consistent text display
        className="font-helveticabold" // Apply Helvetica-Bold font
        numberOfLines={1} // Ensure text is on one line
        ellipsizeMode="tail" // Truncate with ellipsis if text is too long
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#FFA001",
        tabBarInactiveTintColor: "#CDCDE0",
        tabBarStyle: {
          backgroundColor: "#161622",
          borderTopWidth: 1,
          borderTopColor: "#232533",
          height: 90,
          paddingTop: 10,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="galleries/index"
        options={{
          title: "Galleries",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon iconName="bookmarks-outline" color={color} name="Galleries" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon iconName="add-circle-outline" color={color} name="Create" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon iconName="settings-outline" color={color} name="Settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;













// ORIGINAL

// import { View, Text, Image } from 'react-native'
// import { Tabs } from "expo-router";

// import { icons } from "../../constants";

// const TabIcon = ({ icon, color, name, focused }) => {
//   return (
//     <View className="items-center justify-center gap-2">
//       <Image
//         source={icon}
//         resizeMode='contain'
//         tintColor={color}
//         className="w-6 h-6"
//       />
//       <Text className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`} style={{ color: color }}>
//         {name}
//       </Text>
//     </View>
//   );
// }

// const TabsLayout = () => {
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarShowLabel: false,
//         tabBarActiveTintColor: "#FFA001",
//         tabBarInactiveTintColor: "#CDCDE0",
//         tabBarStyle: {
//           backgroundColor: "#161622",
//           borderTopWidth: 1,
//           borderTopColor: "#232533",
//           height: 84,
//         },
//       }}
//     >
//       {/* <Tabs.Screen
//         name="home"
//         options={{
//           title: "Home",
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => (
//             <TabIcon icon={icons.home} color={color} name="Home" focused={focused} />
//           ),
//         }}
//       /> */}
//       <Tabs.Screen
//         name="galleries/index"
//         options={{
//           title: "Galleries",
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => (
//             <TabIcon icon={icons.bookmark} color={color} name="Galleries" focused={focused} />
//           ),
//         }}
//       />
//             <Tabs.Screen
//         name="galleries/[galleryId]"
//         options={{
//           title: "Image Library",
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => (
//             <TabIcon icon={icons.bookmark} color={color} name="Library" focused={focused} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="create"
//         options={{
//           title: "Create",
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => (
//             <TabIcon icon={icons.plus} color={color} name="Create" focused={focused} />
//           ),
//         }}
//       />
// <Tabs.Screen
//   name="settings"
//   options={{
//     title: "Settings",
//     headerShown: false,
//     tabBarIcon: ({ color, focused }) => (
//       <TabIcon icon={icons.settings} color={color} name="Settings" focused={focused} />
//     ),
//   }}
// />
//     </Tabs>
//   );
// };

// export default TabsLayout;

// Allows us to switch with all the pages 