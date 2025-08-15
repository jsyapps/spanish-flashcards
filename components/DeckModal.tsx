import React, { useState } from 'react';
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
import { Deck, validateAndSaveDeck, validateAndUpdateDeck, deleteDeck } from '../utils/storage';

interface DeckModalProps {
  visible: boolean;
  deck?: Deck; // If provided, this is edit mode
  onSave: () => void;
  onCancel: () => void;
  onDelete?: (deckId: string) => void;
}


export default function DeckModal({
  visible,
  deck,
  onSave,
  onCancel,
  onDelete,
}: DeckModalProps) {
  const [name, setName] = useState(deck?.name || '');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (deck) {
      setName(deck.name);
    } else {
      setName('');
    }
  }, [deck, visible]);

  const handleSave = async () => {
    if (saving) return;
    
    setSaving(true);
    try {
      if (deck) {
        // Edit mode
        const result = await validateAndUpdateDeck(deck.id, {
          name: name.trim(),
        });
        
        if (!result.success) {
          Alert.alert('Error', result.error || 'Failed to update deck');
          return;
        }
      } else {
        // Create mode
        const result = await validateAndSaveDeck(
          name.trim(),
          undefined
        );
        
        if (!result.success) {
          Alert.alert('Error', result.error || 'Failed to create deck');
          return;
        }
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving deck:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deck || saving) return;
    
    Alert.alert(
      "Delete Deck",
      "Are you sure you want to delete this deck? This will also remove all flashcards from this deck.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await deleteDeck(deck.id);
              onDelete?.(deck.id);
            } catch (error) {
              console.error('Error deleting deck:', error);
              Alert.alert("Error", "Failed to delete deck");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const isValid = name.trim().length > 0;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Deck Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter deck name"
              maxLength={50}
              autoFocus={!deck} // Only autofocus for new decks
            />
            <Text style={styles.charCount}>{name.length}/50</Text>
            
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[
                styles.modalButton, 
                styles.saveButton,
                (!isValid || saving) && styles.disabledButton
              ]}
              onPress={handleSave}
              disabled={!isValid || saving}
            >
              <Text style={[
                styles.saveButtonText,
                (!isValid || saving) && styles.disabledButtonText
              ]}>
                {saving ? 'Saving...' : (deck ? 'Save' : 'Create')}
              </Text>
            </TouchableOpacity>
            
            
            
            
{deck ? (
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDelete}
                disabled={saving}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            
            
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  cancelButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledButtonText: {
    color: "#999",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  deleteButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});