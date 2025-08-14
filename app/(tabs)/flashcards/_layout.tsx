import { Stack } from "expo-router";

export default function FlashcardsLayout() {
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
          title: "All Flashcards",
          headerLargeTitle: false,
          headerLargeTitleShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="manage"
        options={{
          title: "Manage All Cards",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}