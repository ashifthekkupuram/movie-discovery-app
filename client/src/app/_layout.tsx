import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerStyle: { backgroundColor: '#111' }, headerTintColor: "#fff"  }} >
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="movie/[id]" options={{ title: "" }} />
  </Stack>;
}
