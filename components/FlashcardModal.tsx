import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { commonStyles } from '../styles/common';
import { addFlashcardToDeck, Deck, deleteFlashcard, getDecks, getFlashcardDeckAssociations, removeFlashcardFromDeck } from '../utils/storage';

interface FlashcardModalProps {
  visible: boolean;
  userMessage: string;
  response: string;
  onSave: (front: string, back: string) => void;
  onCancel: () => void;
  cardId?: string;
  onDeckChange?: (cardId: string, deckIds: string[]) => void;
}

export default function FlashcardModal({
  visible,
  userMessage,
  response,
  onSave,
  onCancel,
  cardId,
  onDeckChange,
}: FlashcardModalProps) {
  const [editableUserMessage, setEditableUserMessage] = React.useState(userMessage);
  const [editableResponse, setEditableResponse] = React.useState(response);
  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [selectedDecks, setSelectedDecks] = React.useState<Set<string>>(new Set());
  const [originalDecks, setOriginalDecks] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setEditableUserMessage(userMessage);
    setEditableResponse(response);
  }, [userMessage, response]);

  // Load decks and current associations when modal opens
  React.useEffect(() => {
    if (visible && cardId) {
      loadDecksAndAssociations();
    }
  }, [visible, cardId]);

  const loadDecksAndAssociations = async () => {
    if (!cardId) return;
    
    try {
      setLoading(true);
      
      // Load all decks
      const allDecks = await getDecks();
      setDecks(allDecks);
      
      // Load current deck associations for this flashcard
      const associations = await getFlashcardDeckAssociations();
      const currentDeckIds = associations
        .filter(assoc => assoc.flashcardId === cardId)
        .map(assoc => assoc.deckId);
      
      const currentDecksSet = new Set(currentDeckIds);
      setSelectedDecks(currentDecksSet);
      setOriginalDecks(currentDecksSet);
      
    } catch (error) {
      console.error('Error loading decks and associations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDeckSelection = (deckId: string) => {
    const newSelection = new Set(selectedDecks);
    if (newSelection.has(deckId)) {
      newSelection.delete(deckId);
    } else {
      newSelection.add(deckId);
    }
    setSelectedDecks(newSelection);
  };

  const handleSave = async () => {
    try {
      // First save the flashcard content
      onSave(editableUserMessage, editableResponse);
      
      // Then handle deck associations if this is an existing flashcard
      if (cardId) {
        await updateDeckAssociations();
      }
    } catch (error) {
      console.error('Error saving flashcard:', error);
      Alert.alert("Error", "Failed to save flashcard changes");
    }
  };

  const updateDeckAssociations = async () => {
    if (!cardId) return;
    
    try {
      // Calculate changes
      const addedDecks = [...selectedDecks].filter(deckId => !originalDecks.has(deckId));
      const removedDecks = [...originalDecks].filter(deckId => !selectedDecks.has(deckId));
      
      // Add new deck associations
      for (const deckId of addedDecks) {
        await addFlashcardToDeck(cardId, deckId);
      }
      
      // Remove old deck associations
      for (const deckId of removedDecks) {
        await removeFlashcardFromDeck(cardId, deckId);
      }
      
      // Notify parent about deck changes
      if (onDeckChange && (addedDecks.length > 0 || removedDecks.length > 0)) {
        onDeckChange(cardId, [...selectedDecks]);
      }
      
    } catch (error) {
      console.error('Error updating deck associations:', error);
      Alert.alert("Error", "Failed to update deck associations");
      throw error;
    }
  };

  const handleDelete = () => {
    if (!cardId) return;
    
    Alert.alert(
      "Delete Flashcard",
      "Are you sure you want to delete this flashcard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFlashcard(cardId);
              onCancel(); // Close modal after deletion
            } catch (error) {
              console.error('Error deleting flashcard:', error);
              Alert.alert("Error", "Failed to delete flashcard");
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView 
        style={commonStyles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? -50 : -30}
      >
        <View style={commonStyles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[commonStyles.modalLabel, { marginTop: 0 }]}>Front:</Text>
            <TextInput
              style={[commonStyles.textInput, styles.modalInput]}
              value={editableUserMessage}
              onChangeText={setEditableUserMessage}
              multiline
              textAlignVertical="top"
            />
            
            <Text style={commonStyles.modalLabel}>Back:</Text>
            <TextInput
              style={[commonStyles.multilineInput, styles.modalInput]}
              value={editableResponse}
              onChangeText={setEditableResponse}
              multiline
              textAlignVertical="top"
            />
            
            {/* Deck Selection - only show when editing existing flashcard */}
            {cardId && decks.length > 0 && (
              <>
                <Text style={[commonStyles.modalLabel, { marginTop: SPACING.LG }]}>Decks:</Text>
                {decks.map((deck) => (
                  <TouchableOpacity
                    key={deck.id}
                    style={styles.deckCheckItem}
                    onPress={() => toggleDeckSelection(deck.id)}
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
            )}
          </ScrollView>
          
          <View style={commonStyles.modalButtons}>
            <TouchableOpacity 
              style={[commonStyles.modalButton, styles.saveFlashcardButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveFlashcardButtonText}>Save</Text>
            </TouchableOpacity>
            
{cardId ? (
              <TouchableOpacity 
                style={[commonStyles.modalButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[commonStyles.modalButton, commonStyles.secondaryButton]}
                onPress={onCancel}
              >
                <Text style={commonStyles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalInput: {
    marginHorizontal: SPACING.XS, // Add small horizontal margin
    marginBottom: SPACING.SM, // Add bottom margin for spacing
  },
  saveFlashcardButton: {
    backgroundColor: "#007AFF",
  },
  saveFlashcardButtonText: {
    color: COLORS.WHITE,
    textAlign: "center",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: COLORS.DANGER,
  },
  deleteButtonText: {
    color: COLORS.WHITE,
    textAlign: "center",
    fontWeight: "bold",
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
    fontSize: 16,
    color: COLORS.DARK_GRAY,
    flex: 1,
    marginLeft: SPACING.MD,
  },
});