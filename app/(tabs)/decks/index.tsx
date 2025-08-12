import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
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
import DeckModal from "../../../components/DeckModal";
import { 
  deleteDeck, 
  Deck, 
  getDeckStats, 
  getDecks, 
  initializeStorage 
} from "../../../utils/storage";

interface DeckWithStats extends Deck {
  cardCount: number;
}

export default function DecksScreen() {
  const navigation = useNavigation();
  const [decks, setDecks] = useState<DeckWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | undefined>();

  const loadDecks = async () => {
    try {
      await initializeStorage(); // Ensure migration is complete
      const deckList = await getDecks();
      
      // Get stats for each deck
      const decksWithStats = await Promise.all(
        deckList.map(async (deck) => {
          const stats = await getDeckStats(deck.id);
          return {
            ...deck,
            cardCount: stats.cardCount,
          };
        })
      );
      
      setDecks(decksWithStats);
    } catch (error) {
      console.error("Error loading decks:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDecks();
    }, [])
  );

  // Set up header button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={openCreateModal}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


  const handleDeleteDeck = async (deck: DeckWithStats) => {
    Alert.alert(
      "Delete Deck",
      `Are you sure you want to delete "${deck.name}"? This will also delete all ${deck.cardCount} flashcards in this deck.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDeck(deck.id);
              await loadDecks(); // Reload decks
            } catch (error) {
              console.error("Error deleting deck:", error);
              Alert.alert("Error", "Failed to delete deck");
            }
          },
        },
      ]
    );
  };

  const openCreateModal = () => {
    setEditingDeck(undefined);
    setModalVisible(true);
  };

  const openEditModal = (deck: Deck) => {
    setEditingDeck(deck);
    setModalVisible(true);
  };

  const handleModalSave = async () => {
    setModalVisible(false);
    setEditingDeck(undefined);
    await loadDecks(); // Reload decks
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingDeck(undefined);
  };

  const handleDeckPress = (deck: DeckWithStats) => {
    router.push({
      pathname: '/decks/flashcards',
      params: { 
        deckId: deck.id,
        title: deck.name
      }
    });
  };

  const renderDeckItem = ({ item }: { item: DeckWithStats }) => (
    <TouchableOpacity 
      style={styles.deckItem}
      onPress={() => handleDeckPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.deckHeader}>
        <View style={styles.deckInfo}>
          <Text style={styles.deckName}>{item.name}</Text>
        </View>
        <View style={styles.deckActions}>
          {item.id !== 'all-deck' && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  openEditModal(item);
                }}
              >
                <Ionicons name="pencil" size={16} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteDeck(item);
                }}
              >
                <Ionicons name="trash" size={16} color="#dc3545" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      
      <View style={styles.deckStats}>
        <View style={styles.statItem}>
          <Ionicons name="library" size={16} color="#666" />
          <Text style={styles.statText}>{item.cardCount} cards</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading decks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {decks.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="albums-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No decks yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first deck to organize your flashcards!
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={openCreateModal}
          >
            <Text style={styles.createButtonText}>Create Deck</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={decks}
          renderItem={renderDeckItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <DeckModal
        visible={modalVisible}
        deck={editingDeck}
        onSave={handleModalSave}
        onCancel={handleModalCancel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#F7FAFC",
  },
  loadingText: {
    fontSize: 18,
    color: "#718096",
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 24,
    color: "#2D3748",
    marginTop: 24,
    textAlign: "center",
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#718096",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  listContainer: {
    padding: 16,
  },
  deckItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deckItemPressed: {
    backgroundColor: "#F7FAFC",
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deckHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  deckInfo: {
    flex: 1,
    justifyContent: "center",
  },
  deckName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3748",
    letterSpacing: 0.3,
  },
  deckActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonPressed: {
    backgroundColor: "#EDF2F7",
    transform: [{ scale: 0.95 }],
  },
  deckStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F7FAFC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statText: {
    fontSize: 15,
    color: "#4A5568",
    fontWeight: "500",
  },
  createdDate: {
    fontSize: 12,
    color: "#999",
  },
  headerButton: {
    marginRight: 16,
    padding: 4,
  },
});