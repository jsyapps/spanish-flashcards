import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
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
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from "../../../constants/theme";
import { commonStyles } from "../../../styles/common";
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

  const loadDecks = React.useCallback(async () => {
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
  }, [selectedDecks.size]);

  useFocusEffect(
    React.useCallback(() => {
      loadDecks();
    }, [loadDecks])
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


  const handleSaveToDeck = async () => {
    if (editableFront.trim() && editableBack.trim() && selectedDecks.size > 0) {
      try {
        // Save to each selected deck
        for (const deckId of selectedDecks) {
          await saveFlashcardToDeck(editableFront.trim(), editableBack.trim(), deckId);
        }
        
        // Get deck names for alert
        const selectedDeckNames = Array.from(selectedDecks).map(deckId => {
          const deck = decks.find(d => d.id === deckId);
          return deck ? deck.name : 'Unknown Deck';
        });
        
        const deckText = selectedDeckNames.length === 1 
          ? selectedDeckNames[0] 
          : selectedDeckNames.join(', ');
        
        // Show success alert
        Alert.alert(
          "Card Saved!",
          `Flashcard saved to ${deckText}`,
          [
            {
              text: "OK",
              onPress: () => {
                // Reset to original screen
                setUserMessage("");
                setResponse("");
                setEditableFront("");
                setEditableBack("");
                
                // Reset to auto-select first deck for next flashcard
                if (decks.length > 0) {
                  setSelectedDecks(new Set([decks[0].id]));
                }
              }
            }
          ]
        );
      } catch (error) {
        console.error('Error saving flashcard:', error);
        Alert.alert(
          "Error",
          "Failed to save flashcard. Please try again.",
          [{ text: "OK" }]
        );
      }
    }
  };


  return (
    <KeyboardAvoidingView 
      style={commonStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      enabled={isMainInputFocused}
    >
      <SafeAreaView style={commonStyles.container}>
        
        
        <ScrollView style={styles.responseContainer} contentContainerStyle={styles.scrollContent}>
          {userMessage ? (
            <>
              {response ? (
                <>
                  <View style={commonStyles.card}>
                    <Text style={[commonStyles.modalLabel, { marginTop: 0 }]}>Front:</Text>
                    <TextInput
                      style={commonStyles.textInput}
                      value={editableFront}
                      onChangeText={setEditableFront}
                      multiline
                      textAlignVertical="top"
                    />
                    
                    <Text style={commonStyles.modalLabel}>Back:</Text>
                    <TextInput
                      style={commonStyles.multilineInput}
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
                                commonStyles.checkbox,
                                selectedDecks.has(deck.id) && commonStyles.checkboxSelected
                              ]}>
                                {selectedDecks.has(deck.id) && (
                                  <Ionicons name="checkmark" size={16} color={COLORS.WHITE} />
                                )}
                              </View>
                              <View style={[
                                styles.deckColorIndicator,
                                { backgroundColor: deck.color || COLORS.PRIMARY }
                              ]} />
                              <Text style={styles.deckCheckText}>{deck.name}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity 
                          style={[commonStyles.primaryButton, { marginTop: SPACING.XL }]}
                          onPress={handleSaveToDeck}
                        >
                          <Text style={commonStyles.primaryButtonText}>Save to Deck</Text>
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
            <View style={commonStyles.centerContent}>
              <Text style={commonStyles.emptyText}>Type a word or phrase in Spanish.</Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[commonStyles.textInput, styles.mainInput]}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => setIsMainInputFocused(true)}
            onBlur={() => setIsMainInputFocused(false)}
            placeholderTextColor={COLORS.GRAY}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="paper-plane" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>

        <FlashcardModal
          visible={modalVisible}
          userMessage={editableFront}
          response={editableBack}
          onSave={(front, back) => {
            setEditableFront(front);
            setEditableBack(back);
            setModalVisible(false);
          }}
          onCancel={() => setModalVisible(false)}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  responseContainer: {
    flex: 1,
    padding: SPACING.LG,
  },
  scrollContent: {
    flexGrow: 1,
  },
  userMessageBox: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.XXL,
    marginBottom: SPACING.SM,
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  userMessageText: {
    fontSize: FONT_SIZE.LG,
    lineHeight: 24,
    color: COLORS.WHITE,
  },
  loadingBox: {
    backgroundColor: COLORS.LOADING_BACKGROUND,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.XXL,
    alignSelf: "flex-start",
    maxWidth: "80%",
    marginBottom: SPACING.SM,
  },
  loadingText: {
    fontSize: FONT_SIZE.LG,
    lineHeight: 24,
    color: COLORS.GRAY,
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    padding: SPACING.LG,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    alignItems: "flex-end",
    paddingRight: SPACING.LG,
  },
  mainInput: {
    flex: 1,
    borderRadius: BORDER_RADIUS.XXL,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    marginRight: SPACING.SM,
    maxHeight: 100,
    minWidth: 0, // Prevents text overflow
  },
  sendButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.XXL,
  },
  deckCheckItem: {
    marginBottom: SPACING.SM,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.SM,
  },
  deckColorIndicator: {
    width: SPACING.MD,
    height: SPACING.MD,
    borderRadius: SPACING.SM,
    marginRight: SPACING.SM,
  },
  deckCheckText: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.DARK_GRAY,
    flex: 1,
  },
});
