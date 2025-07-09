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
import { COLORS, SPACING } from '../constants/theme';
import { commonStyles } from '../styles/common';

interface FlashcardModalProps {
  visible: boolean;
  userMessage: string;
  response: string;
  onSave: (front: string, back: string) => void;
  onCancel: () => void;
}

export default function FlashcardModal({
  visible,
  userMessage,
  response,
  onSave,
  onCancel,
}: FlashcardModalProps) {
  const [editableUserMessage, setEditableUserMessage] = React.useState(userMessage);
  const [editableResponse, setEditableResponse] = React.useState(response);

  React.useEffect(() => {
    setEditableUserMessage(userMessage);
    setEditableResponse(response);
  }, [userMessage, response]);

  const handleSave = () => {
    // Pass the edited values back to the parent
    onSave(editableUserMessage, editableResponse);
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
          <Text style={commonStyles.modalTitle}>
            Edit Flashcard
          </Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={commonStyles.modalLabel}>Front:</Text>
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
          </ScrollView>
          
          <View style={commonStyles.modalButtons}>
            <TouchableOpacity 
              style={[commonStyles.modalButton, commonStyles.secondaryButton]}
              onPress={onCancel}
            >
              <Text style={commonStyles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[commonStyles.modalButton, styles.saveFlashcardButton]}
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
  modalInput: {
    marginHorizontal: SPACING.XS, // Add small horizontal margin
    marginBottom: SPACING.SM, // Add bottom margin for spacing
  },
  saveFlashcardButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  saveFlashcardButtonText: {
    color: COLORS.WHITE,
    textAlign: "center",
    fontWeight: "bold",
  },
});