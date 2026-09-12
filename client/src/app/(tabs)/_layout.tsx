import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#111" },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#111", borderTopColor: "#222" },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#666",
        sceneStyle: { backgroundColor: "#111" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="film-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
