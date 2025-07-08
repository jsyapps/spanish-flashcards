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
import { Deck, getDecks, initializeStorage } from "../../../utils/storage";

export default function Index() {
  const [inputText, setInputText] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [response, setResponse] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
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
      } catch (error) {
        console.error('Error:', error);
        setResponse("Sorry, I couldn't get a response. Please try again.");
      }
    }
  };

  const openFlashcardModal = () => {
    setModalVisible(true);
  };

  const handleFlashcardSaved = () => {
    setModalVisible(false);
    // Reset to auto-select first deck for next flashcard
    if (decks.length > 0) {
      setSelectedDecks(new Set([decks[0].id]));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={modalVisible ? undefined : (Platform.OS === "ios" ? "padding" : "height")}
        enabled={!modalVisible}
      >
        
        
        <ScrollView style={styles.responseContainer} contentContainerStyle={styles.scrollContent}>
          {userMessage ? (
            <>
              {response ? (
                <>
                  <View style={styles.flashcardBox}>
                    <TouchableOpacity 
                      style={styles.saveButton}
                      onPress={openFlashcardModal}
                    >
                      <Ionicons name="add-circle-outline" size={20} color="#28a745" />
                    </TouchableOpacity>
                    <Text style={styles.flashcardHeading}>{userMessage}</Text>
                    <Text style={styles.flashcardContent}>{response}</Text>
                  </View>
                  
                  {decks.length > 0 && (
                    <View style={styles.deckSelectionContainer}>
                      <Text style={styles.deckSelectionTitle}>Save to decks:</Text>
                      {decks.map((deck) => (
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
                    </View>
                  )}
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
          userMessage={userMessage}
          response={response}
          onSave={handleFlashcardSaved}
          onCancel={() => setModalVisible(false)}
          selectedDeckIds={Array.from(selectedDecks)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    justifyContent: "center",
  },
  flashcardBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#007AFF",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  flashcardHeading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "left",
  },
  flashcardContent: {
    fontSize: 18,
    lineHeight: 24,
    color: "#333",
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
    justifyContent: "center",
    alignItems: "center",
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
  saveButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 8,
    backgroundColor: "transparent",
    borderWidth: 0,
    zIndex: 1,
  },
  saveButtonText: {
    color: "#28a745",
    fontWeight: "bold",
    fontSize: 16,
  },
  deckSelectionContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deckSelectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
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
