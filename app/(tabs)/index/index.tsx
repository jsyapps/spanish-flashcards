import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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
import { BORDER_RADIUS, COLORS, FONT_SIZE, FONT_WEIGHT, SHADOW, SPACING } from "../../../constants/theme";
import { commonStyles } from "../../../styles/common";
import { Deck, Flashcard, getDecks, getFlashcards, initializeStorage, saveFlashcard, saveFlashcardToMultipleDecks } from "../../../utils/storage";

export default function Index() {
  const [inputText, setInputText] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [response, setResponse] = useState("");
  const [editableFront, setEditableFront] = useState("");
  const [editableBack, setEditableBack] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isMainInputFocused, setIsMainInputFocused] = useState(false);
  const [isFrontInputFocused, setIsFrontInputFocused] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(new Set());
  const [recentFlashcards, setRecentFlashcards] = useState<Flashcard[]>([]);
  const [showRecentOverlay, setShowRecentOverlay] = useState(false);
  const [selectedRecentFlashcard, setSelectedRecentFlashcard] = useState<Flashcard | null>(null);
  const [recentFlashcardModalVisible, setRecentFlashcardModalVisible] = useState(false);

  const loadDecks = React.useCallback(async () => {
    try {
      await initializeStorage();
      const deckList = await getDecks();
      setDecks(deckList);
    } catch (error) {
      console.error("Error loading decks:", error);
    }
  }, []);

  const loadRecentFlashcards = React.useCallback(async () => {
    try {
      const allFlashcards = await getFlashcards();
      // Sort by creation date (most recent first) and take first 10
      const recent = allFlashcards
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setRecentFlashcards(recent);
    } catch (error) {
      console.error("Error loading recent flashcards:", error);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDecks();
      loadRecentFlashcards();
    }, [loadDecks, loadRecentFlashcards])
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
        const response = await fetch('https://spanish-flashcards-api.vercel.app/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer spanish-flashcards-beta-2025-fbe169127c8a16226b1f7d23261646be',
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
        setSelectedDecks(new Set()); // Clear deck selection for new response
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error 
          ? `Sorry, I couldn't get a response. Error: ${error.message}`
          : "Sorry, I couldn't get a response. Please try again.";
        setResponse(errorMessage);
        setEditableFront(inputText.trim());
        setEditableBack(errorMessage);
        setSelectedDecks(new Set()); // Clear deck selection for error response
      }
    }
  };


  const handleSaveToDeck = async () => {
    if (editableFront.trim() && editableBack.trim()) {
      try {
        let successMessage = "";
        
        if (selectedDecks.size === 0) {
          // Save to general flashcard collection (no deck association)
          await saveFlashcard(editableFront.trim(), editableBack.trim());
          successMessage = "Flashcard saved!";
        } else {
          // Save to selected decks
          const selectedDeckIds = Array.from(selectedDecks);
          await saveFlashcardToMultipleDecks(editableFront.trim(), editableBack.trim(), selectedDeckIds);
          
          // Get deck names for alert
          const selectedDeckNames = Array.from(selectedDecks).map(deckId => {
            const deck = decks.find(d => d.id === deckId);
            return deck ? deck.name : 'Unknown Deck';
          });
          
          const deckText = selectedDeckNames.length === 1 
            ? selectedDeckNames[0] 
            : selectedDeckNames.join(', ');
          
          successMessage = `Flashcard saved to ${deckText}`;
        }
        
        // Show success alert
        Alert.alert(
          "Card Saved!",
          successMessage,
          [
            {
              text: "OK",
              onPress: () => {
                // Reset to original screen
                setUserMessage("");
                setResponse("");
                setEditableFront("");
                setEditableBack("");
                
                // Refresh recent flashcards to include the newly saved one
                loadRecentFlashcards();
                
                // Keep current deck selection for next flashcard
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
                    <TextInput
                      style={isFrontInputFocused ? styles.underlineInput : styles.frontTextNoUnderline}
                      value={editableFront}
                      onChangeText={setEditableFront}
                      onFocus={() => setIsFrontInputFocused(true)}
                      onBlur={() => setIsFrontInputFocused(false)}
                      multiline
                      textAlignVertical="top"
                    />
                    
                    <TextInput
                      style={[commonStyles.multilineInput, { marginTop: SPACING.LG }]}
                      value={editableBack}
                      onChangeText={setEditableBack}
                      multiline
                      textAlignVertical="top"
                    />
                    
                    {decks.length > 0 && (
                      <>
                        <View style={{ marginTop: 20 }} />
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
                    
                    <TouchableOpacity 
                      style={[commonStyles.primaryButton, { marginTop: SPACING.XL }]}
                      onPress={handleSaveToDeck}
                    >
                      <Text style={commonStyles.primaryButtonText}>
                        {selectedDecks.size > 0 ? 'Save to Deck' : 'Save'}
                      </Text>
                    </TouchableOpacity>
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
            <View style={styles.welcomeContainer}>
              <Image 
                source={require('../../../assets/images/icon-removebg-preview.png')} 
                style={styles.welcomeIcon}
                resizeMode="contain"
              />
              <Text style={styles.welcomeText}>
                Translate → Flashcard
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Recent Flashcards Overlay */}
        {showRecentOverlay && (
          <View style={styles.recentOverlay}>
            <Text style={styles.recentLabel}>Recent Flashcards</Text>
            {recentFlashcards.length > 0 ? (
              <View style={[styles.containerBox, { maxHeight: 260 }]}>
                <FlatList
                  data={recentFlashcards}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                  renderItem={({ item: flashcard }) => (
                    <TouchableOpacity
                      style={styles.flashcardItem}
                      onPress={() => {
                        setSelectedRecentFlashcard(flashcard);
                        setRecentFlashcardModalVisible(true);
                      }}
                    >
                      <Text style={styles.flashcardFront} numberOfLines={1}>
                        {flashcard.front}
                      </Text>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.listContainer}
                />
              </View>
            ) : null}
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons 
              name="search" 
              size={20} 
              color={COLORS.GRAY} 
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.mainInput]}
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => {
                setIsMainInputFocused(true);
                setShowRecentOverlay(true);
              }}
              onBlur={() => {
                setIsMainInputFocused(false);
                setShowRecentOverlay(false);
              }}
              onSubmitEditing={sendMessage}
              placeholder="Type Spanish or English"
              placeholderTextColor={COLORS.GRAY}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
              maxLength={500}
            />
          </View>
          {showRecentOverlay && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Keyboard.dismiss();
                setIsMainInputFocused(false);
                setShowRecentOverlay(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
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

        {/* Modal for editing recent flashcards */}
        {selectedRecentFlashcard && (
          <FlashcardModal
            visible={recentFlashcardModalVisible}
            userMessage={selectedRecentFlashcard.front}
            response={selectedRecentFlashcard.back}
            cardId={selectedRecentFlashcard.id}
            onSave={(front, back) => {
              setRecentFlashcardModalVisible(false);
              setSelectedRecentFlashcard(null);
              loadRecentFlashcards();
            }}
            onCancel={() => {
              setRecentFlashcardModalVisible(false);
              setSelectedRecentFlashcard(null);
              setShowRecentOverlay(false);
              setIsMainInputFocused(false);
              loadRecentFlashcards();
            }}
            onDeckChange={(cardId, deckIds) => {
              loadRecentFlashcards();
            }}
          />
        )}
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
    backgroundColor: COLORS.LIGHT_GRAY,
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
    position: "relative",
    padding: SPACING.LG,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.SM,
  },
  inputWrapper: {
    position: "relative",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.XXL,
    backgroundColor: COLORS.WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
    paddingLeft: SPACING.LG,
  },
  mainInput: {
    flex: 1,
    borderRadius: BORDER_RADIUS.XXL,
    paddingLeft: SPACING.SM,
    paddingRight: SPACING.LG,
    paddingVertical: SPACING.MD,
    maxHeight: 100,
    minWidth: 0,
    backgroundColor: "transparent",
    fontSize: FONT_SIZE.LG,
  },
  searchIcon: {
    marginRight: 0,
  },
  cancelButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.PRIMARY,
    fontWeight: FONT_WEIGHT.MEDIUM,
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
  recentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    paddingTop: SPACING.LG,
    backgroundColor: COLORS.BACKGROUND,
    
  },
  recentLabel: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.DARK_GRAY,
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  containerBox: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.XL,
    
    
    overflow: 'hidden',
    
    ...SHADOW.LG,
  },
  listContainer: {
    backgroundColor: COLORS.WHITE,
  },
  flashcardItem: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
    
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: SPACING.XL,
  },
  flashcardFront: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.DARK_GRAY,
  },
  emptyStateContainer: {
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.XL,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  emptyStateText: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.GRAY,
    fontWeight: FONT_WEIGHT.MEDIUM,
    textAlign: 'center',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 120,
    height: 120,
  },
  welcomeText: {
    fontSize: FONT_SIZE.XL,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginTop: SPACING.LG,
    paddingHorizontal: SPACING.LG,
    maxWidth: '90%',
  },
});
