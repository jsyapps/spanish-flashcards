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
import { Deck, validateAndSaveDeck, validateAndUpdateDeck } from '../utils/storage';

interface DeckModalProps {
  visible: boolean;
  deck?: Deck; // If provided, this is edit mode
  onSave: () => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#007AFF', // Blue
  '#34C759', // Green
  '#FF9500', // Orange
  '#FF3B30', // Red
  '#AF52DE', // Purple
  '#FF2D92', // Pink
  '#5AC8FA', // Light Blue
  '#FFCC00', // Yellow
];

export default function DeckModal({
  visible,
  deck,
  onSave,
  onCancel,
}: DeckModalProps) {
  const [name, setName] = useState(deck?.name || '');
  const [selectedColor, setSelectedColor] = useState(deck?.color || PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (deck) {
      setName(deck.name);
      setSelectedColor(deck.color || PRESET_COLORS[0]);
    } else {
      setName('');
      setSelectedColor(PRESET_COLORS[0]);
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
          color: selectedColor,
        });
        
        if (!result.success) {
          Alert.alert('Error', result.error || 'Failed to update deck');
          return;
        }
      } else {
        // Create mode
        const result = await validateAndSaveDeck(
          name.trim(),
          undefined,
          selectedColor
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
          <Text style={styles.modalTitle}>
            {deck ? 'Edit Deck' : 'Create New Deck'}
          </Text>
          
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
            
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
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
                {saving ? 'Saving...' : (deck ? 'Update' : 'Create')}
              </Text>
            </TouchableOpacity>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
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
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#333",
    borderWidth: 3,
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
});