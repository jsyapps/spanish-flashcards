import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "white",
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Spanish Chat",
          headerLargeTitle: false,
          headerLargeTitleShadowVisible: false,
        }}
      />
    </Stack>
  );
}