import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Deck } from "../../utils/storage";
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from "../../constants/theme";
import { commonStyles } from "../../styles/common";
import { DeckSelectionList } from "./DeckSelectionList";

interface FlashcardCreationFormProps {
  editableFront: string;
  editableBack: string;
  onChangeFront: (text: string) => void;
  onChangeBack: (text: string) => void;
  decks: Deck[];
  selectedDecks: Set<string>;
  onToggleDeck: (deckId: string) => void;
  onSave: () => void;
  isFrontInputFocused: boolean;
  onFrontFocus: () => void;
  onFrontBlur: () => void;
}

export const FlashcardCreationForm: React.FC<FlashcardCreationFormProps> = React.memo(({
  editableFront,
  editableBack,
  onChangeFront,
  onChangeBack,
  decks,
  selectedDecks,
  onToggleDeck,
  onSave,
  isFrontInputFocused,
  onFrontFocus,
  onFrontBlur,
}) => {
  return (
    <View style={commonStyles.card}>
      <TextInput
        style={isFrontInputFocused ? styles.underlineInput : styles.frontTextNoUnderline}
        value={editableFront}
        onChangeText={onChangeFront}
        onFocus={onFrontFocus}
        onBlur={onFrontBlur}
        multiline
        textAlignVertical="top"
      />
      
      <TextInput
        style={[commonStyles.multilineInput, { marginTop: SPACING.LG }]}
        value={editableBack}
        onChangeText={onChangeBack}
        multiline
        textAlignVertical="top"
      />
      
      <DeckSelectionList
        decks={decks}
        selectedDecks={selectedDecks}
        onToggleDeck={onToggleDeck}
      />
      
      <TouchableOpacity 
        style={[commonStyles.primaryButton, { marginTop: SPACING.XL }]}
        onPress={onSave}
      >
        <Text style={commonStyles.primaryButtonText}>
          {selectedDecks.size > 0 ? 'Save to Deck' : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

FlashcardCreationForm.displayName = 'FlashcardCreationForm';

const styles = StyleSheet.create({
  underlineInput: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 2,
    fontSize: FONT_SIZE.XXXL,
    backgroundColor: 'transparent',
    color: COLORS.GRAY_800,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    minHeight: 32,
  },
  frontTextNoUnderline: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 2,
    fontSize: FONT_SIZE.XXXL,
    backgroundColor: 'transparent',
    color: COLORS.GRAY_800,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    minHeight: 32,
    borderBottomWidth: 0,
  },
});