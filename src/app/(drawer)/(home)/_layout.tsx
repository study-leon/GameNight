import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#6C63FF" },
        headerTintColor: "#ffffff",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="chatDetails/[id]"
        options={{
          headerBackButtonDisplayMode: "minimal",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="new/chat"
        options={{
          title: "Neuer Chat",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
