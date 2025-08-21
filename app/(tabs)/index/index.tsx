import React, { useState, useCallback, useMemo } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import FlashcardModal from "../../../components/FlashcardModal";
import { 
  SearchBar, 
  RecentFlashcardsOverlay, 
  FlashcardCreationForm 
} from "../../../components/chat";
import { 
  WelcomeScreen, 
  LoadingMessage 
} from "../../../components/shared";
import { useDecks, useFlashcards, useModal } from "../../../hooks";
import { commonStyles } from "../../../styles/common";
import { SPACING } from "../../../constants/theme";
import { Flashcard, saveFlashcard, saveFlashcardToMultipleDecks } from "../../../utils/storage";
import { apiService } from "../../../utils/services/apiService";

export default function Index() {
  // Input and message state
  const [inputText, setInputText] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [response, setResponse] = useState("");
  const [editableFront, setEditableFront] = useState("");
  const [editableBack, setEditableBack] = useState("");

  // Focus states
  const [isMainInputFocused, setIsMainInputFocused] = useState(false);
  const [isFrontInputFocused, setIsFrontInputFocused] = useState(false);

  // Deck selection state
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(new Set());

  // Recent flashcards state
  const [showRecentOverlay, setShowRecentOverlay] = useState(false);

  // Custom hooks
  const { decks, loadDecks } = useDecks();
  const { flashcards: recentFlashcards, loadFlashcards: loadRecentFlashcards } = useFlashcards();
  const flashcardModal = useModal();
  const recentFlashcardModal = useModal<Flashcard>();

  const loadData = useCallback(async () => {
    await Promise.all([
      loadDecks(),
      loadRecentFlashcards(false), // Don't shuffle for recent cards
    ]);
  }, [loadDecks, loadRecentFlashcards]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData])
  );

  const toggleDeckSelection = useCallback((deckId: string) => {
    setSelectedDecks(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(deckId)) {
        newSelection.delete(deckId);
      } else {
        newSelection.add(deckId);
      }
      return newSelection;
    });
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const messageToSend = inputText.trim();
    setUserMessage(messageToSend);
    setResponse("");
    setInputText("");
    Keyboard.dismiss();
    
    try {
      const data = await apiService.sendChatMessage(messageToSend);
      setResponse(data.response);
      setEditableFront(messageToSend);
      setEditableBack(data.response);
      setSelectedDecks(new Set());
    } catch (error) {
      console.error('Error:', error);
      
      // Handle rate limit errors with more user-friendly messages
      if (error instanceof Error && error.name === 'RateLimitError') {
        Alert.alert(
          "Rate Limit Exceeded",
          error.message,
          [{ text: "OK" }]
        );
        // Don't show the error in the response for rate limits
        setUserMessage("");
        return;
      }
      
      const errorMessage = error instanceof Error 
        ? error.message
        : "Sorry, I couldn't get a response. Please try again.";
      setResponse(errorMessage);
      setEditableFront(messageToSend);
      setEditableBack(errorMessage);
      setSelectedDecks(new Set());
    }
  }, [inputText]);

  const handleSaveToDeck = useCallback(async () => {
    if (!editableFront.trim() || !editableBack.trim()) return;

    try {
      let successMessage = "";
      
      if (selectedDecks.size === 0) {
        await saveFlashcard(editableFront.trim(), editableBack.trim());
        successMessage = "Flashcard saved!";
      } else {
        const selectedDeckIds = Array.from(selectedDecks);
        await saveFlashcardToMultipleDecks(editableFront.trim(), editableBack.trim(), selectedDeckIds);
        
        const selectedDeckNames = Array.from(selectedDecks).map(deckId => {
          const deck = decks.find(d => d.id === deckId);
          return deck ? deck.name : 'Unknown Deck';
        });
        
        const deckText = selectedDeckNames.length === 1 
          ? selectedDeckNames[0] 
          : selectedDeckNames.join(', ');
        
        successMessage = `Flashcard saved to ${deckText}`;
      }
      
      Alert.alert(
        "Card Saved!",
        successMessage,
        [
          {
            text: "OK",
            onPress: () => {
              setUserMessage("");
              setResponse("");
              setEditableFront("");
              setEditableBack("");
              loadRecentFlashcards(false);
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
  }, [editableFront, editableBack, selectedDecks, decks, loadRecentFlashcards]);

  const handleSearchBarFocus = useCallback(() => {
    setIsMainInputFocused(true);
    setShowRecentOverlay(true);
  }, []);

  const handleSearchBarBlur = useCallback(() => {
    setIsMainInputFocused(false);
    setShowRecentOverlay(false);
  }, []);

  const handleSearchBarCancel = useCallback(() => {
    Keyboard.dismiss();
    setIsMainInputFocused(false);
    setShowRecentOverlay(false);
  }, []);

  const handleRecentFlashcardPress = useCallback((flashcard: Flashcard) => {
    recentFlashcardModal.open(flashcard);
  }, [recentFlashcardModal]);

  const handleRecentFlashcardSave = useCallback(() => {
    recentFlashcardModal.close();
    // Keep overlay visible and input focused for continued browsing
    loadRecentFlashcards(false);
  }, [recentFlashcardModal, loadRecentFlashcards]);

  const handleRecentFlashcardCancel = useCallback(() => {
    recentFlashcardModal.close();
    // Keep overlay visible and input focused for continued browsing
    loadRecentFlashcards(false);
  }, [recentFlashcardModal, loadRecentFlashcards]);

  const handleFrontFocus = useCallback(() => setIsFrontInputFocused(true), []);
  const handleFrontBlur = useCallback(() => setIsFrontInputFocused(false), []);

  const renderContent = useMemo(() => {
    if (userMessage) {
      if (response) {
        return (
          <>
            <FlashcardCreationForm
              editableFront={editableFront}
              editableBack={editableBack}
              onChangeFront={setEditableFront}
              onChangeBack={setEditableBack}
              decks={decks}
              selectedDecks={selectedDecks}
              onToggleDeck={toggleDeckSelection}
              onSave={handleSaveToDeck}
              isFrontInputFocused={isFrontInputFocused}
              onFrontFocus={handleFrontFocus}
              onFrontBlur={handleFrontBlur}
            />
          </>
        );
      } else {
        return <LoadingMessage userMessage={userMessage} />;
      }
    }
    
    return <WelcomeScreen />;
  }, [
    userMessage, 
    response, 
    editableFront, 
    editableBack, 
    decks, 
    selectedDecks, 
    toggleDeckSelection, 
    handleSaveToDeck, 
    isFrontInputFocused,
    handleFrontFocus,
    handleFrontBlur
  ]);

  // Get the first 10 most recent flashcards (memoized for performance)
  const recentFlashcardsToShow = useMemo(() => {
    return recentFlashcards
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [recentFlashcards]);

  return (
    <KeyboardAvoidingView 
      style={commonStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      enabled={isMainInputFocused}
    >
      <SafeAreaView style={commonStyles.container}>
        <ScrollView 
          style={{ flex: 1, padding: SPACING.LG }} 
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {renderContent}
        </ScrollView>
        
        <RecentFlashcardsOverlay
          visible={showRecentOverlay}
          flashcards={recentFlashcardsToShow}
          onFlashcardPress={handleRecentFlashcardPress}
        />
        
        <SearchBar
          inputText={inputText}
          onChangeText={setInputText}
          onSubmit={sendMessage}
          onFocus={handleSearchBarFocus}
          onBlur={handleSearchBarBlur}
          isMainInputFocused={isMainInputFocused}
          showRecentOverlay={showRecentOverlay}
          onCancel={handleSearchBarCancel}
        />

        <FlashcardModal
          visible={flashcardModal.visible}
          userMessage={editableFront}
          response={editableBack}
          onSave={(front, back) => {
            setEditableFront(front);
            setEditableBack(back);
            flashcardModal.close();
          }}
          onCancel={flashcardModal.close}
        />

        {recentFlashcardModal.data && (
          <FlashcardModal
            visible={recentFlashcardModal.visible}
            userMessage={recentFlashcardModal.data.front}
            response={recentFlashcardModal.data.back}
            cardId={recentFlashcardModal.data.id}
            onSave={handleRecentFlashcardSave}
            onCancel={handleRecentFlashcardCancel}
            onDeckChange={() => loadRecentFlashcards()}
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}