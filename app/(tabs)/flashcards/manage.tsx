import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
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

export default function ManageAllFlashcardsScreen() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadFlashcards = React.useCallback(async () => {
    try {
      await initializeStorage();
      const cards = await getFlashcards();
      setFlashcards(cards);
    } catch (error) {
      console.error("Error loading flashcards:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFlashcards();
    }, [loadFlashcards])
  );

  // Filter flashcards based on search query
  const filteredFlashcards = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return flashcards;
    }
    return flashcards.filter(card =>
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [flashcards, searchQuery]);

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
      await saveFlashcard(front, back);
      
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
      {index < filteredFlashcards.length - 1 && <View style={styles.separator} />}
    </>
  );

  if (loading) {
    return <LoadingScreen message="Loading flashcards..." />;
  }

  return (
    <SafeAreaView style={[commonStyles.container, styles.container]}>
        {flashcards.length === 0 ? (
          <View style={commonStyles.centerContent}>
            <Ionicons name="albums-outline" size={64} color={COLORS.EMPTY_ICON} />
            <Text style={commonStyles.emptyText}>No flashcards yet</Text>
            <Text style={commonStyles.emptySubtext}>
              Start a conversation in the Ask tab to create flashcards!
            </Text>
          </View>
        ) : (
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={COLORS.GRAY} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search flashcards..."
                  placeholderTextColor={COLORS.GRAY}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => setSearchQuery("")}
                  >
                    <Ionicons name="close-circle" size={20} color={COLORS.GRAY} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Flashcards List */}
            {filteredFlashcards.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={48} color={COLORS.EMPTY_ICON} />
                <Text style={styles.noResultsText}>No matching flashcards</Text>
                <Text style={styles.noResultsSubtext}>
                  Try a different search term
                </Text>
              </View>
            ) : (
              <View style={styles.containerBox}>
                <FlatList
                  data={filteredFlashcards}
                  renderItem={({ item, index }) => renderFlashcard({ item, index })}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            )}
          </>
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
    backgroundColor: COLORS.BACKGROUND,
  },
  searchContainer: {
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.LG,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XXL,
    paddingLeft: SPACING.LG,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  searchBarFocused: {
    borderColor: COLORS.PRIMARY,
    ...SHADOW.MD,
  },
  searchIcon: {
    marginRight: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.LG,
    color: COLORS.GRAY_800,
    paddingLeft: SPACING.SM,
    paddingRight: SPACING.LG,
    paddingVertical: SPACING.MD,
    fontWeight: FONT_WEIGHT.REGULAR,
    backgroundColor: "transparent",
  },
  clearButton: {
    marginLeft: SPACING.MD,
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  containerBox: {
    
    maxHeight: '86%',
    backgroundColor: COLORS.WHITE,
    marginHorizontal: SPACING.LG,
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.XL,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    ...SHADOW.LG,
  },
  listContainer: {
    backgroundColor: COLORS.WHITE,
  },
  flashcardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.SM,
    backgroundColor: COLORS.WHITE,
  },
  flashcardItemHover: {
    backgroundColor: COLORS.GRAY_50,
  },
  frontText: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.GRAY_800,
    lineHeight: 24,
    flex: 1,
    marginRight: SPACING.LG,
  },
  flashcardActions: {
    flexDirection: "row",
    gap: SPACING.MD,
  },
  actionButton: {
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    backgroundColor: COLORS.GRAY_100,
    ...SHADOW.SM,
  },
  actionButtonPressed: {
    backgroundColor: COLORS.GRAY_200,
    transform: [{ scale: 0.95 }],
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: SPACING.XL,
  },
  noResultsContainer: {
    padding: SPACING.XXXXL,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.GRAY_50,
    margin: SPACING.LG,
    borderRadius: BORDER_RADIUS.XL,
  },
  noResultsText: {
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.GRAY_600,
    marginTop: SPACING.LG,
    textAlign: "center",
  },
  noResultsSubtext: {
    fontSize: FONT_SIZE.LG,
    fontWeight: FONT_WEIGHT.REGULAR,
    color: COLORS.GRAY_500,
    marginTop: SPACING.SM,
    textAlign: "center",
  },
});