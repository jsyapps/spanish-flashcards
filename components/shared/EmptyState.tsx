import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from "../../constants/theme";
import { commonStyles } from "../../styles/common";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  icon = "folder-outline",
  title,
  subtitle,
  actionText,
  onAction,
  children,
}) => {
  return (
    <View style={commonStyles.centerContent}>
      <Ionicons name={icon} size={64} color={COLORS.EMPTY_ICON} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && (
        <Text style={styles.emptySubtitle}>{subtitle}</Text>
      )}
      {actionText && onAction && (
        <TouchableOpacity 
          style={[commonStyles.primaryButton, styles.actionButton]}
          onPress={onAction}
        >
          <Text style={commonStyles.primaryButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
      {children}
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  emptyTitle: {
    fontSize: FONT_SIZE.XXL,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.GRAY_800,
    marginTop: SPACING.LG,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.GRAY_600,
    marginTop: SPACING.SM,
    textAlign: 'center',
    paddingHorizontal: SPACING.XL,
    lineHeight: 24,
  },
  actionButton: {
    marginTop: SPACING.XL,
  },
});