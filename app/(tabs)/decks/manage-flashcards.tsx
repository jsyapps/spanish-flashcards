import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import FlashcardModal from "../../../components/FlashcardModal";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { BORDER_RADIUS, COLORS, FONT_SIZE, SPACING } from "../../../constants/theme";
import { commonStyles } from "../../../styles/common";
import {
  deleteFlashcard,
  Flashcard,
  getFlashcards,
  getFlashcardsByDeck,
  initializeStorage,
  saveFlashcard,
  saveFlashcardToDeck
} from "../../../utils/storage";

export default function ManageFlashcardsScreen() {
  const navigation = useNavigation();
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const loadFlashcards = React.useCallback(async () => {
    try {
      await initializeStorage();
      let cards: Flashcard[];
      
      if (!deckId || deckId === 'all-deck') {
        cards = await getFlashcards();
      } else {
        cards = await getFlashcardsByDeck(deckId);
      }
      
      setFlashcards(cards);
    } catch (error) {
      console.error("Error loading flashcards:", error);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useFocusEffect(
    React.useCallback(() => {
      loadFlashcards();
    }, [loadFlashcards])
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
            } catch (error) {
              console.error("Error deleting flashcard:", error);
              Alert.alert("Error", "Failed to delete flashcard");
            }
          },
        },
      ]
    );
  };

  const handleEditFlashcard = (card: Flashcard) => {
    setEditingCard(card);
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
      setEditingCard(null);
      
      // Update the current card in the list
      const updatedFlashcards = flashcards.map(card => 
        card.id === cardId 
          ? { ...card, front, back }
          : card
      );
      setFlashcards(updatedFlashcards);
    } catch (error) {
      console.error('Error updating flashcard:', error);
      Alert.alert("Error", "Failed to update flashcard");
    }
  };

  const renderFlashcard = ({ item, index }: { item: Flashcard; index: number }) => (
    <>
      <View style={styles.flashcardItem}>
        <Text style={styles.frontText}>{item.front}</Text>
        <View style={styles.flashcardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditFlashcard(item)}
          >
            <Ionicons name="pencil" size={16} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteFlashcard(item.id)}
          >
            <Ionicons name="trash" size={16} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>
      {index < flashcards.length - 1 && <View style={styles.separator} />}
    </>
  );

  if (loading) {
    return <LoadingScreen message="Loading flashcards..." />;
  }

  return (
    <SafeAreaView style={[commonStyles.container, styles.container]}>
      {flashcards.length === 0 ? (
        <View style={commonStyles.centerContent}>
          <Ionicons name="library-outline" size={64} color={COLORS.EMPTY_ICON} />
          <Text style={commonStyles.emptyText}>No flashcards yet</Text>
          <Text style={commonStyles.emptySubtext}>
            Start a conversation in the Chat tab to create flashcards!
          </Text>
        </View>
      ) : (
        <View style={styles.containerBox}>
          <FlatList
            data={flashcards}
            renderItem={({ item, index }) => renderFlashcard({ item, index })}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {editingCard && (
        <FlashcardModal
          visible={editModalVisible}
          userMessage={editingCard.front}
          response={editingCard.back}
          onSave={(front, back) => handleEditSave(front, back, editingCard.id)}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingCard(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
  },
  containerBox: {
    backgroundColor: COLORS.WHITE,
    margin: SPACING.LG,
    borderRadius: BORDER_RADIUS.XL,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
    backgroundColor: COLORS.WHITE,
  },
  flashcardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  frontText: {
    fontSize: FONT_SIZE.LG,
    fontWeight: "bold",
    color: COLORS.DARK_GRAY,
    lineHeight: 24,
    flex: 1,
    marginRight: SPACING.MD,
  },
  flashcardActions: {
    flexDirection: "row",
    gap: SPACING.SM,
  },
  actionButton: {
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginHorizontal: SPACING.LG,
  },
});