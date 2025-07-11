import { Stack } from "expo-router";

export default function DecksLayout() {
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
          title: "My Decks",
          headerLargeTitle: false,
          headerLargeTitleShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="flashcards"
        options={({ route }) => ({
          headerShown: true,
          headerTitle: (route.params as any)?.title || "Flashcards",
          headerBackTitle: "Back",
        })}
      />
      <Stack.Screen
        name="manage-flashcards"
        options={{
          title: "Manage Cards",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}