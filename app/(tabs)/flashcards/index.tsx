import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
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
import FlashcardModal from "../../../components/FlashcardModal";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { BORDER_RADIUS, COLORS, FONT_SIZE, FONT_WEIGHT, SHADOW, SPACING } from "../../../constants/theme";
import { commonStyles } from "../../../styles/common";
import {
  deleteFlashcard,
  Flashcard,
  getFlashcards,
  initializeStorage,
  saveFlashcard
} from "../../../utils/storage";

export default function AllFlashcardsScreen() {
  const navigation = useNavigation();
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
  }, [showAllBacks]);

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
            onPress={() => router.push('/flashcards/manage')}
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
  }, [navigation, flashcards.length]);

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
      await saveFlashcard(front, back);
      
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
          <Ionicons name="albums-outline" size={64} color={COLORS.EMPTY_ICON} />
          <Text style={commonStyles.emptyText}>No flashcards yet</Text>
          
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
              {showBack ? (
                <View style={styles.backTextContainer}>
                  <Text style={styles.backText}>
                    {currentCard.back}
                  </Text>
                </View>
              ) : (
                <View style={styles.frontTextContainer}>
                  <Text style={styles.frontText}>
                    {currentCard.front}
                  </Text>
                </View>
              )}
              <View style={styles.flipHintContainer}>
                <Text style={styles.flipHint}>
                  {showBack ? "Tap to see front" : "Tap to see back"}
                </Text>
              </View>
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
          cardId={currentCard.id}
          onSave={(front, back) => handleEditSave(front, back, currentCard.id)}
          onCancel={() => {
            setEditModalVisible(false);
            // Refresh flashcards after modal closes
            loadFlashcards(false);
          }}
          onDeckChange={(cardId, deckIds) => {
            // Refresh flashcards after deck associations change
            loadFlashcards(false);
          }}
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
    padding: SPACING.XXXL,
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.PRIMARY,
    ...SHADOW.XL,
    alignSelf: "center",
    overflow: "visible",
  },
  flashcardPressed: {
    ...SHADOW.LG,
    transform: [{ scale: 0.98 }],
    borderColor: COLORS.PRIMARY_DARK,
  },
  cardLabel: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.PRIMARY,
    marginBottom: SPACING.XL,
    letterSpacing: 0.5,
  },
  frontTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
  },
  frontText: {
    color: COLORS.GRAY_800,
    textAlign: "center",
    fontWeight: FONT_WEIGHT.BOLD,
    fontSize: FONT_SIZE.XXXXL,
    letterSpacing: 0.3,
    lineHeight: 36,
  },
  backTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.LG,
    overflow: "visible",
  },
  backText: {
    color: COLORS.GRAY_800,
    textAlign: "left",
    fontWeight: FONT_WEIGHT.REGULAR,
    fontSize: FONT_SIZE.XXL,
    lineHeight: 28,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  flipHintContainer: {
    position: "absolute",
    bottom: SPACING.XXL,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  flipHint: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.GRAY_500,
    fontStyle: "italic",
    fontWeight: FONT_WEIGHT.MEDIUM,
    letterSpacing: 0.2,
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