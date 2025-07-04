import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { clearAllFlashcards, deleteFlashcard, Flashcard, getFlashcards } from "../utils/storage";
import FlashcardModal from "../components/FlashcardModal";

export default function FlashcardsScreen() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const shuffleArray = (array: Flashcard[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadFlashcards = async () => {
    try {
      const cards = await getFlashcards();
      const shuffledCards = shuffleArray(cards);
      setFlashcards(shuffledCards);
      setCurrentIndex(0);
      setShowBack(false);
    } catch (error) {
      console.error("Error loading flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFlashcards();
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
              
              setShowBack(false);
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
              await loadFlashcards();
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

  const goToNextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowBack(false);
    }
  };

  const goToPreviousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowBack(false);
    }
  };

  const shuffleCards = () => {
    const shuffledCards = shuffleArray(flashcards);
    setFlashcards(shuffledCards);
    setCurrentIndex(0);
    setShowBack(false);
  };

  const openEditModal = () => {
    setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    setEditModalVisible(false);
    // Reload flashcards to get the updated data
    await loadFlashcards();
  };

  const currentCard = flashcards[currentIndex];

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
            <View style={styles.cardActions}>
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
            </View>
            
            <TouchableOpacity style={styles.flashcard} onPress={flipCard}>
              <Text style={styles.cardLabel}>
                {showBack ? "Back:" : "Front:"}
              </Text>
              <Text style={styles.cardText}>
                {showBack ? currentCard.back : currentCard.front}
              </Text>
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
              <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, currentIndex === flashcards.length - 1 && styles.navButtonDisabled]}
              onPress={goToNextCard}
              disabled={currentIndex === flashcards.length - 1}
            >
              <Text style={[styles.navButtonText, currentIndex === flashcards.length - 1 && styles.navButtonTextDisabled]}>
                Next
              </Text>
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
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 1,
    flexDirection: "row",
    gap: 8,
  },
  editCardButton: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  deleteCardButton: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: "#dc3545",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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
    borderRadius: 15,
    padding: 30,
    marginHorizontal: 10,
    minHeight: 300,
    justifyContent: "flex-start",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 20,
  },
  cardText: {
    fontSize: 20,
    color: "#333",
    textAlign: "center",
    lineHeight: 28,
    marginVertical: 20,
    flexShrink: 1,
  },
  flipHint: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginTop: "auto",
    paddingTop: 20,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
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