import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from "../../constants/theme";

interface LoadingMessageProps {
  userMessage: string;
  loadingText?: string;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = React.memo(({
  userMessage,
  loadingText = "Thinking..."
}) => {
  return (
    <>
      <View style={styles.userMessageBox}>
        <Text style={styles.userMessageText}>{userMessage}</Text>
      </View>
      <View style={styles.loadingBox}>
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    </>
  );
});

LoadingMessage.displayName = 'LoadingMessage';

const styles = StyleSheet.create({
  userMessageBox: {
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.XXL,
    marginBottom: SPACING.SM,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  userMessageText: {
    fontSize: FONT_SIZE.LG,
    lineHeight: 24,
    color: COLORS.WHITE,
  },
  loadingBox: {
    backgroundColor: COLORS.LOADING_BACKGROUND,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.XXL,
    alignSelf: "flex-start",
    maxWidth: "80%",
    marginBottom: SPACING.SM,
  },
  loadingText: {
    fontSize: FONT_SIZE.LG,
    lineHeight: 24,
    color: COLORS.GRAY,
    fontStyle: "italic",
  },
});