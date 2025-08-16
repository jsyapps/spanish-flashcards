import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS, FONT_SIZE, SPACING } from "../../constants/theme";
import { commonStyles } from "../../styles/common";

interface AsyncOperationWrapperProps {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
  loadingText?: string;
  emptyState?: React.ReactNode;
  showEmptyWhen?: boolean;
}

export const AsyncOperationWrapper: React.FC<AsyncOperationWrapperProps> = React.memo(({
  loading,
  error,
  children,
  loadingText = "Loading...",
  emptyState,
  showEmptyWhen = false,
}) => {
  if (loading) {
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (showEmptyWhen && emptyState) {
    return <View style={commonStyles.centerContent}>{emptyState}</View>;
  }

  return <>{children}</>;
});

AsyncOperationWrapper.displayName = 'AsyncOperationWrapper';

const styles = StyleSheet.create({
  loadingText: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.GRAY,
    marginTop: SPACING.LG,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.DANGER,
    textAlign: 'center',
    paddingHorizontal: SPACING.LG,
  },
});