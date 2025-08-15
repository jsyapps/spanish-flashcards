import { Stack } from "expo-router";
import { COLORS } from "../../../constants/theme";

export default function ChatLayout() {
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
          title: "Flashcard Amigo",
          headerLargeTitle: false,
          headerLargeTitleShadowVisible: false,
        }}
      />
    </Stack>
  );
}