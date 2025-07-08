import React from 'react';
import {
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
import { deleteFlashcard, saveFlashcard as saveFlashcardToStorage } from '../utils/storage';

interface FlashcardModalProps {
  visible: boolean;
  userMessage: string;
  response: string;
  onSave: () => void;
  onCancel: () => void;
  editingCardId?: string; // Optional ID for editing existing cards
}

export default function FlashcardModal({
  visible,
  userMessage,
  response,
  onSave,
  onCancel,
  editingCardId,
}: FlashcardModalProps) {
  const [editableUserMessage, setEditableUserMessage] = React.useState(userMessage);
  const [editableResponse, setEditableResponse] = React.useState(response);

  React.useEffect(() => {
    setEditableUserMessage(userMessage);
    setEditableResponse(response);
  }, [userMessage, response]);

  const handleSave = async () => {
    try {
      if (editingCardId) {
        // Update existing flashcard by deleting old and creating new
        await deleteFlashcard(editingCardId);
        await saveFlashcardToStorage(editableUserMessage, editableResponse);
        console.log('Flashcard updated successfully:', { 
          front: editableUserMessage, 
          back: editableResponse 
        });
      } else {
        // Create new flashcard
        await saveFlashcardToStorage(editableUserMessage, editableResponse);
        console.log('Flashcard saved successfully:', { 
          front: editableUserMessage, 
          back: editableResponse 
        });
      }
      onSave(); // Notify parent that save was successful
    } catch (error) {
      console.error('Failed to save flashcard:', error);
      // Could add error handling/toast here
    }
  };

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
        keyboardVerticalOffset={Platform.OS === "ios" ? -50 : -30}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingCardId ? 'Edit Flashcard' : 'Save as Flashcard'}
          </Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalLabel}>Front:</Text>
            <TextInput
              style={styles.modalInput}
              value={editableUserMessage}
              onChangeText={setEditableUserMessage}
              multiline
              textAlignVertical="top"
            />
            
            <Text style={styles.modalLabel}>Back:</Text>
            <TextInput
              style={styles.modalInput}
              value={editableResponse}
              onChangeText={setEditableResponse}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveFlashcardButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveFlashcardButtonText}>Save</Text>
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  
  modalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
    color: "#333",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    
    backgroundColor: "#f9f9f9",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  cancelButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  saveFlashcardButton: {
    backgroundColor: "#28a745",
  },
  saveFlashcardButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});