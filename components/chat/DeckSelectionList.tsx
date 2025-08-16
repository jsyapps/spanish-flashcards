import React from 'react';
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Deck } from "../../utils/storage";
import { COLORS, FONT_SIZE, SPACING } from "../../constants/theme";
import { commonStyles } from "../../styles/common";

interface DeckSelectionListProps {
  decks: Deck[];
  selectedDecks: Set<string>;
  onToggleDeck: (deckId: string) => void;
}

export const DeckSelectionList: React.FC<DeckSelectionListProps> = React.memo(({
  decks,
  selectedDecks,
  onToggleDeck,
}) => {
  if (decks.length === 0) return null;

  return (
    <>
      <View style={styles.spacer} />
      {decks.map((deck) => (
        <TouchableOpacity
          key={deck.id}
          style={styles.deckCheckItem}
          onPress={() => onToggleDeck(deck.id)}
        >
          <View style={styles.checkboxContainer}>
            <View style={[
              commonStyles.checkbox,
              selectedDecks.has(deck.id) && commonStyles.checkboxSelected
            ]}>
              {selectedDecks.has(deck.id) && (
                <Ionicons name="checkmark" size={16} color={COLORS.WHITE} />
              )}
            </View>
            <Text style={styles.deckCheckText}>{deck.name}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
});

DeckSelectionList.displayName = 'DeckSelectionList';

const styles = StyleSheet.create({
  spacer: {
    marginTop: SPACING.XL,
  },
  deckCheckItem: {
    marginBottom: SPACING.SM,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.SM,
  },
  deckCheckText: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.DARK_GRAY,
    flex: 1,
  },
});