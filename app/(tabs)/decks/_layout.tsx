import { Stack } from "expo-router";
import { COLORS } from "../../../constants/theme";

export default function DecksLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.BACKGROUND,
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
          headerShown: true,
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}