import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, router } from "expo-router";
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
import { LoadingScreen } from "../../../components/LoadingScreen";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, CARD_SHADOW } from "../../../constants/theme";
import { commonStyles } from "../../../styles/common";
import FlashcardModal from "../../../components/FlashcardModal";
import {
  deleteFlashcard,
  Flashcard,
  getFlashcards,
  getFlashcardsByDeck,
  initializeStorage,
  saveFlashcard,
  saveFlashcardToDeck
} from "../../../utils/storage";

export default function FlashcardsScreen() {
  const navigation = useNavigation();
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();
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

  const loadFlashcards = React.useCallback(async (shouldShuffle = true) => {
    try {
      await initializeStorage();
      let cards: Flashcard[];
      
      if (!deckId) {
        cards = await getFlashcards();
      } else {
        cards = await getFlashcardsByDeck(deckId);
      }
      
      const finalCards = shouldShuffle ? shuffleArray(cards) : cards;
      setFlashcards(finalCards);
      setCurrentIndex(0);
      setShowBack(showAllBacks);
    } catch (error) {
      console.error("Error loading flashcards:", error);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useFocusEffect(
    React.useCallback(() => {
      loadFlashcards(true);
    }, [loadFlashcards])
  );

  // Set up header button
  React.useLayoutEffect(() => {
    if (flashcards.length > 0) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity 
            
            onPress={() => router.push({
              pathname: '/decks/manage-flashcards',
              params: { 
                deckId: deckId || 'all-deck'
              }
            })}
          >
            <Ionicons name="list" size={24} color="#007AFF" />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => null,
      });
    }
  }, [navigation, flashcards.length, deckId]);

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


  const openEditModal = () => {
    setEditModalVisible(true);
  };

  const handleEditSave = async (front: string, back: string, cardId: string) => {
    try {
      await deleteFlashcard(cardId);
      
      if (deckId && deckId !== 'all-deck') {
        await saveFlashcardToDeck(front, back, deckId);
      } else {
        await saveFlashcard(front, back);
      }
      
      setEditModalVisible(false);
      
      // Update the current card in place instead of reloading all flashcards
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[currentIndex] = {
        ...updatedFlashcards[currentIndex],
        front,
        back
      };
      setFlashcards(updatedFlashcards);
    } catch (error) {
      console.error('Error updating flashcard:', error);
    }
  };


  const currentCard = flashcards[currentIndex];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  if (loading) {
    return <LoadingScreen message="Loading flashcards..." />;
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {flashcards.length === 0 ? (
        <View style={commonStyles.centerContent}>
          <Ionicons name="library-outline" size={64} color={COLORS.EMPTY_ICON} />
          <Text style={commonStyles.emptyText}>No flashcards yet</Text>
          <Text style={commonStyles.emptySubtext}>
            Ask about Spanish to create flashcards!
          </Text>
        </View>
      ) : (
        <View style={styles.cardContainer}>
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

          <View style={styles.cardProgress}>
            <Text style={styles.progressText}>
              {currentIndex + 1} of {flashcards.length}
            </Text>
          </View>
                
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[commonStyles.outlineButton, currentIndex === 0 && commonStyles.outlineButtonDisabled]}
              onPress={goToPreviousCard}
              disabled={currentIndex === 0}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={currentIndex === 0 ? COLORS.DISABLED : COLORS.PRIMARY} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={commonStyles.outlineButton} 
              onPress={flipAllCards}
            >
              <Ionicons name="sync" size={18} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={commonStyles.outlineButton} 
              onPress={openEditModal}
            >
              <Ionicons name="pencil" size={18} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[commonStyles.outlineButton, { borderColor: COLORS.DANGER }]} 
              onPress={() => handleDeleteFlashcard(currentCard.id)}
            >
              <Ionicons name="trash" size={18} color={COLORS.DANGER} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.outlineButton, currentIndex === flashcards.length - 1 && commonStyles.outlineButtonDisabled]}
              onPress={goToNextCard}
              disabled={currentIndex === flashcards.length - 1}
            >
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={currentIndex === flashcards.length - 1 ? COLORS.DISABLED : COLORS.PRIMARY} 
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
          onSave={(front, back) => handleEditSave(front, back, currentCard.id)}
          onCancel={() => setEditModalVisible(false)}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    padding: SPACING.XL,
    justifyContent: "center",
  },
  cardWrapper: {
    position: "relative",
  },
  cardProgress: {
    alignItems: "center",
    marginTop: SPACING.XXXL,
  },
  progressText: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.GRAY,
    fontWeight: "bold",
  },
  flashcard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XXL,
    padding: SPACING.XL,
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.PRIMARY,
    shadowColor: CARD_SHADOW.color,
    shadowOffset: CARD_SHADOW.offset,
    shadowOpacity: CARD_SHADOW.opacity,
    shadowRadius: CARD_SHADOW.radius,
    elevation: CARD_SHADOW.elevation,
    alignSelf: "center",
    overflow: "visible",
  },
  cardLabel: {
    fontSize: FONT_SIZE.LG,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginBottom: SPACING.XL,
  },
  frontText: {
    color: COLORS.DARK_GRAY,
    textAlign: "center",
    flex: 1,
    textAlignVertical: "center",
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XL,
    fontWeight: "bold",
    fontSize: FONT_SIZE.XXXL,
  },
  backTextContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    overflow: "visible",
  },
  backText: {
    color: COLORS.DARK_GRAY,
    textAlign: "left",
    fontWeight: "normal",
    fontSize: FONT_SIZE.XL,
    lineHeight: 22,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  flipHint: {
    fontSize: FONT_SIZE.MD,
    color: COLORS.GRAY,
    fontStyle: "italic",
    marginBottom: SPACING.SM,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.LG,
    marginTop: SPACING.XL,
    paddingHorizontal: SPACING.XL,
  },
  
});