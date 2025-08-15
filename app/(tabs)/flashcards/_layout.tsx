import { Stack } from "expo-router";
import { COLORS } from "../../../constants/theme";

export default function FlashcardsLayout() {
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