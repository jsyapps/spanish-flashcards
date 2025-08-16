import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Flashcard } from "../../utils/storage";
import { BORDER_RADIUS, COLORS, FONT_SIZE, FONT_WEIGHT, SHADOW, SPACING } from "../../constants/theme";

interface RecentFlashcardsOverlayProps {
  visible: boolean;
  flashcards: Flashcard[];
  onFlashcardPress: (flashcard: Flashcard) => void;
}

export const RecentFlashcardsOverlay: React.FC<RecentFlashcardsOverlayProps> = React.memo(({
  visible,
  flashcards,
  onFlashcardPress,
}) => {
  if (!visible) return null;

  const renderFlashcardItem = ({ item: flashcard }: { item: Flashcard }) => (
    <TouchableOpacity
      style={styles.flashcardItem}
      onPress={() => onFlashcardPress(flashcard)}
    >
      <Text style={styles.flashcardFront} numberOfLines={1}>
        {flashcard.front}
      </Text>
    </TouchableOpacity>
  );

  const ItemSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.recentOverlay}>
      <Text style={styles.recentLabel}>Recent Flashcards</Text>
      {flashcards.length > 0 ? (
        <View style={[styles.containerBox, { maxHeight: 260 }]}>
          <FlatList
            data={flashcards}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={ItemSeparator}
            renderItem={renderFlashcardItem}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      ) : null}
    </View>
  );
});

RecentFlashcardsOverlay.displayName = 'RecentFlashcardsOverlay';

const styles = StyleSheet.create({
  recentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    paddingTop: SPACING.LG,
    backgroundColor: COLORS.BACKGROUND,
  },
  recentLabel: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.DARK_GRAY,
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  containerBox: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.XL,
    overflow: 'hidden',
    ...SHADOW.LG,
  },
  listContainer: {
    backgroundColor: COLORS.WHITE,
  },
  flashcardItem: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: SPACING.XL,
  },
  flashcardFront: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.DARK_GRAY,
  },
});