import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import FlashcardModal from "../../../components/FlashcardModal";
import { Deck, getDecks, initializeStorage, saveFlashcardToDeck } from "../../../utils/storage";

export default function Index() {
  const [inputText, setInputText] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [response, setResponse] = useState("");
  const [editableFront, setEditableFront] = useState("");
  const [editableBack, setEditableBack] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isMainInputFocused, setIsMainInputFocused] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(new Set());

  const loadDecks = async () => {
    try {
      await initializeStorage();
      const deckList = await getDecks();
      setDecks(deckList);
      
      // Auto-select the first deck if available and none selected
      if (deckList.length > 0 && selectedDecks.size === 0) {
        setSelectedDecks(new Set([deckList[0].id]));
      }
    } catch (error) {
      console.error("Error loading decks:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDecks();
    }, [])
  );

  const toggleDeckSelection = (deckId: string) => {
    const newSelection = new Set(selectedDecks);
    if (newSelection.has(deckId)) {
      newSelection.delete(deckId);
    } else {
      newSelection.add(deckId);
    }
    setSelectedDecks(newSelection);
  };

  const sendMessage = async () => {
    if (inputText.trim()) {
      setUserMessage(inputText.trim());
      setResponse(""); // Clear previous response
      setInputText("");
      Keyboard.dismiss(); // Close the keyboard
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: inputText.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setResponse(data.response);
        setEditableFront(inputText.trim());
        setEditableBack(data.response);
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = "Sorry, I couldn't get a response. Please try again.";
        setResponse(errorMessage);
        setEditableFront(inputText.trim());
        setEditableBack(errorMessage);
      }
    }
  };

  const openFlashcardModal = () => {
    setModalVisible(true);
  };

  const handleSaveToDeck = async () => {
    if (editableFront.trim() && editableBack.trim() && selectedDecks.size > 0) {
      try {
        // Save to each selected deck
        for (const deckId of selectedDecks) {
          await saveFlashcardToDeck(editableFront.trim(), editableBack.trim(), deckId);
        }
        
        console.log('Flashcard saved successfully:', { 
          front: editableFront.trim(), 
          back: editableBack.trim(),
          decks: Array.from(selectedDecks)
        });
        
        // Reset to auto-select first deck for next flashcard
        if (decks.length > 0) {
          setSelectedDecks(new Set([decks[0].id]));
        }
      } catch (error) {
        console.error('Error saving flashcard:', error);
        // Could add error handling/toast here
      }
    }
  };

  const handleFlashcardSaved = () => {
    setModalVisible(false);
    // Reset to auto-select first deck for next flashcard
    if (decks.length > 0) {
      setSelectedDecks(new Set([decks[0].id]));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      enabled={isMainInputFocused}
    >
      <SafeAreaView style={styles.container}>
        
        
        <ScrollView style={styles.responseContainer} contentContainerStyle={styles.scrollContent}>
          {userMessage ? (
            <>
              {response ? (
                <>
                  <View style={styles.contentContainer}>
                    <Text style={[styles.inputLabel, { marginTop: 0 }]}>Front:</Text>
                    <TextInput
                      style={styles.editableFrontInput}
                      value={editableFront}
                      onChangeText={setEditableFront}
                      multiline
                      textAlignVertical="top"
                    />
                    
                    <Text style={styles.inputLabel}>Back:</Text>
                    <TextInput
                      style={styles.editableInput}
                      value={editableBack}
                      onChangeText={setEditableBack}
                      multiline
                      textAlignVertical="top"
                    />
                    
                    {decks.length > 0 && (
                      <>
                        <View style={{ marginTop: 20 }} />
                        {decks.filter(deck => deck.id !== 'all-deck').map((deck) => (
                          <TouchableOpacity
                            key={deck.id}
                            style={styles.deckCheckItem}
                            onPress={() => toggleDeckSelection(deck.id)}
                          >
                            <View style={styles.checkboxContainer}>
                              <View style={[
                                styles.checkbox,
                                selectedDecks.has(deck.id) && styles.checkboxSelected
                              ]}>
                                {selectedDecks.has(deck.id) && (
                                  <Ionicons name="checkmark" size={16} color="white" />
                                )}
                              </View>
                              <View style={[
                                styles.deckColorIndicator,
                                { backgroundColor: deck.color || "#007AFF" }
                              ]} />
                              <Text style={styles.deckCheckText}>{deck.name}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity 
                          style={styles.saveTextButton}
                          onPress={handleSaveToDeck}
                        >
                          <Text style={styles.saveButtonText}>Save to Deck</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.userMessageBox}>
                    <Text style={styles.userMessageText}>{userMessage}</Text>
                  </View>
                  <View style={styles.loadingBox}>
                    <Text style={styles.loadingText}>Thinking...</Text>
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Type a word or phrase in Spanish.</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => setIsMainInputFocused(true)}
            onBlur={() => setIsMainInputFocused(false)}
            placeholderTextColor="#666"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="paper-plane" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <FlashcardModal
          visible={modalVisible}
          userMessage={editableFront}
          response={editableBack}
          onSave={handleFlashcardSaved}
          onCancel={() => setModalVisible(false)}
          selectedDeckIds={Array.from(selectedDecks)}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  
  responseContainer: {
    flex: 1,
    padding: 15,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
    color: "#333",
  },
  editableInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: "#f9f9f9",
  },
  editableFrontInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  userMessageBox: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  userMessageText: {
    fontSize: 16,
    lineHeight: 24,
    color: "white",
  },
  loadingBox: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
    maxWidth: "80%",
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
    fontStyle: "italic",
  },
  emptyState: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveTextButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  
  deckCheckItem: {
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
  },
  deckColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  deckCheckText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
});
