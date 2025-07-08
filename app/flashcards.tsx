import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import FlashcardModal from "../components/FlashcardModal";
import { clearAllFlashcards, deleteFlashcard, Flashcard, getFlashcards } from "../utils/storage";

export default function FlashcardsScreen() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [showAllBacks, setShowAllBacks] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const shuffleArray = (array: Flashcard[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadFlashcards = async (shouldShuffle = true) => {
    try {
      const cards = await getFlashcards();
      const finalCards = shouldShuffle ? shuffleArray(cards) : cards;
      setFlashcards(finalCards);
      setCurrentIndex(0);
      setShowBack(showAllBacks);
    } catch (error) {
      console.error("Error loading flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFlashcards(true); // Always shuffle when tab is focused
    }, [])
  );

  const handleDeleteFlashcard = async (id: string) => {
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
              await deleteFlashcard(id);
              
              // Update the local state
              const updatedCards = flashcards.filter(card => card.id !== id);
              setFlashcards(updatedCards);
              
              // Adjust current index if necessary
              if (updatedCards.length === 0) {
                setCurrentIndex(0);
              } else if (currentIndex >= updatedCards.length) {
                setCurrentIndex(updatedCards.length - 1);
              }
              
              setShowBack(showAllBacks);
            } catch (error) {
              console.error("Error deleting flashcard:", error);
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Flashcards",
      "Are you sure you want to delete all flashcards? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllFlashcards();
              await loadFlashcards(true);
            } catch (error) {
              console.error("Error clearing flashcards:", error);
            }
          },
        },
      ]
    );
  };

  const flipCard = () => {
    setShowBack(!showBack);
  };

  const flipAllCards = () => {
    setShowAllBacks(!showAllBacks);
    setShowBack(!showAllBacks);
  };

  const goToNextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowBack(showAllBacks);
    }
  };

  const goToPreviousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowBack(showAllBacks);
    }
  };

  const shuffleCards = () => {
    const shuffledCards = shuffleArray(flashcards);
    setFlashcards(shuffledCards);
    setCurrentIndex(0);
    setShowBack(showAllBacks);
  };

  const openEditModal = () => {
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    setEditModalVisible(false);
    // Reload flashcards to get the updated data, but don't shuffle
    await loadFlashcards(false);
  };

  const currentCard = flashcards[currentIndex];


  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
     

      {flashcards.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="library-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No flashcards yet</Text>
          <Text style={styles.emptySubtext}>
            Start a conversation in the Chat tab to create flashcards!
          </Text>
        </View>
      ) : (
        <View style={styles.cardContainer}>
          <View style={styles.cardProgress}>
            <Text style={styles.progressText}>
              {currentIndex + 1} of {flashcards.length}
            </Text>
          </View>

          <View style={styles.cardWrapper}>
            <TouchableOpacity 
              style={[styles.flashcard, { 
                width: screenWidth * 0.9, 
                height: screenHeight * 0.55 
              }]} 
              onPress={flipCard}
            >
              <Text style={styles.cardLabel}>
                {showBack ? "Back:" : "Front:"}
              </Text>
              {showBack ? (
                <View style={styles.backTextContainer}>
                  <Text style={styles.backText}>
                    {currentCard.back}
                  </Text>
                </View>
              ) : (
                <Text style={styles.frontText}>
                  {currentCard.front}
                </Text>
              )}
              <Text style={styles.flipHint}>
                {showBack ? "Tap to see front" : "Tap to see back"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
              onPress={goToPreviousCard}
              disabled={currentIndex === 0}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={currentIndex === 0 ? "#ccc" : "#007AFF"} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.flipCardButton} 
              onPress={flipAllCards}
            >
              <Ionicons name="sync" size={18} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.editCardButton} 
              onPress={openEditModal}
            >
              <Ionicons name="pencil" size={18} color="#007AFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteCardButton} 
              onPress={() => handleDeleteFlashcard(currentCard.id)}
            >
              <Ionicons name="trash" size={18} color="#dc3545" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, currentIndex === flashcards.length - 1 && styles.navButtonDisabled]}
              onPress={goToNextCard}
              disabled={currentIndex === flashcards.length - 1}
            >
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={currentIndex === flashcards.length - 1 ? "#ccc" : "#007AFF"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {currentCard && (
        <FlashcardModal
          visible={editModalVisible}
          userMessage={currentCard.front}
          response={currentCard.back}
          onSave={handleEditSave}
          onCancel={() => setEditModalVisible(false)}
          editingCardId={currentCard.id}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  
  shuffleButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  clearButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  cardContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  cardWrapper: {
    position: "relative",
  },
  cardActions: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  flipCardButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  editCardButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  deleteCardButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#dc3545",
  },
  cardProgress: {
    alignItems: "center",
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  flashcard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    alignSelf: "center",
    overflow: "visible",
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 20,
  },
  frontText: {
    color: "#333",
    textAlign: "center",
    flex: 1,
    textAlignVertical: "center",
    paddingHorizontal: 10,
    paddingVertical: 20,
    fontWeight: "bold",
    fontSize: 25,
  },
  backTextContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    paddingHorizontal: 15,
    paddingVertical: 10,
    overflow: "visible",
  },
  backText: {
    color: "#333",
    textAlign: "left",
    fontWeight: "normal",
    fontSize: 18,
    lineHeight: 22,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  flipHint: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 30,
    paddingHorizontal: 20,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  navButtonDisabled: {
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  navButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  navButtonTextDisabled: {
    color: "#ccc",
  },
});