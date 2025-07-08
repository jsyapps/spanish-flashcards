import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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

  const renderDeckItem = ({ item }: { item: DeckWithStats }) => (
    <View style={styles.deckItem}>
      <View style={styles.deckHeader}>
        <View style={[styles.colorIndicator, { backgroundColor: item.color || "#007AFF" }]} />
        <View style={styles.deckInfo}>
          <Text style={styles.deckName}>{item.name}</Text>
        </View>
        <View style={styles.deckActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={16} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteDeck(item)}
          >
            <Ionicons name="trash" size={16} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.deckStats}>
        <View style={styles.statItem}>
          <Ionicons name="library" size={16} color="#666" />
          <Text style={styles.statText}>{item.cardCount} cards</Text>
        </View>
        <Text style={styles.createdDate}>
          Created {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
    </View>
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
    backgroundColor: "#f5f5f5",
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
  createButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
  },
  deckItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deckHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  deckInfo: {
    flex: 1,
    justifyContent: "center",
  },
  deckName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  deckActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
  },
  deckStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: "#666",
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