import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState, useCallback } from "react";
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
import { BORDER_RADIUS, COLORS, FONT_SIZE, FONT_WEIGHT, SHADOW, SPACING } from "../../../constants/theme";
import { commonStyles } from "../../../styles/common";
import {
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

  const loadDecks = useCallback(async () => {
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
  }, []);

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



  const openCreateModal = useCallback(() => {
    setEditingDeck(undefined);
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback((deck: Deck) => {
    setEditingDeck(deck);
    setModalVisible(true);
  }, []);

  const handleModalSave = useCallback(async () => {
    setModalVisible(false);
    setEditingDeck(undefined);
    await loadDecks(); // Reload decks
  }, [loadDecks]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    setEditingDeck(undefined);
  }, []);

  const handleModalDelete = useCallback(async (deckId: string) => {
    setModalVisible(false);
    setEditingDeck(undefined);
    await loadDecks(); // Reload decks after deletion
  }, [loadDecks]);

  const handleDeckPress = useCallback((deck: DeckWithStats) => {
    router.push({
      pathname: '/decks/flashcards',
      params: { 
        deckId: deck.id,
        title: deck.name
      }
    });
  }, []);

  const renderDeckItem = useCallback(({ item }: { item: DeckWithStats }) => (
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
          <TouchableOpacity 
            style={styles.dotsButton}
            onPress={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.GRAY} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.deckStats}>
        <View style={styles.statItem}>
          <Ionicons name="albums" size={16} color={COLORS.GRAY_600} />
          <Text style={styles.statText}>{item.cardCount} cards</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleDeckPress, openEditModal]);

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
        <View style={commonStyles.centerContent}>
          <Ionicons name="list-outline" size={64} color={COLORS.EMPTY_ICON} />
          <Text style={commonStyles.emptyText}>No decks yet</Text>
          <Text style={commonStyles.emptySubtext}>
            Create your first deck to organize your flashcards!
          </Text>
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
        onDelete={handleModalDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.XXXXL,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.GRAY,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
  emptyText: {
    fontSize: FONT_SIZE.XXXL,
    color: COLORS.GRAY_800,
    marginTop: SPACING.XXL,
    textAlign: "center",
    fontWeight: FONT_WEIGHT.SEMIBOLD,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.GRAY,
    marginTop: SPACING.MD,
    textAlign: "center",
    fontWeight: FONT_WEIGHT.REGULAR,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: COLORS.DANGER,
    paddingHorizontal: SPACING.XXXL + 2,
    paddingVertical: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    marginTop: SPACING.XXXL + 2,
    ...SHADOW.MD,
  },
  createButtonText: {
    color: COLORS.WHITE,
    fontSize: FONT_SIZE.XL,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    letterSpacing: 0.5,
  },
  listContainer: {
    padding: SPACING.LG,
  },
  deckItem: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.LG,
    padding: SPACING.XL,
    marginBottom: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW.MD,
  },
  deckItemPressed: {
    backgroundColor: COLORS.BACKGROUND,
    transform: [{ scale: 0.98 }],
    ...SHADOW.SM,
  },
  deckHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.LG,
  },
  deckInfo: {
    flex: 1,
    justifyContent: "center",
  },
  deckName: {
    fontSize: FONT_SIZE.XXL,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.GRAY_800,
    letterSpacing: 0.3,
  },
  deckActions: {
    flexDirection: "row",
    gap: SPACING.MD,
  },
  actionButton: {
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.LG,
    backgroundColor: COLORS.GRAY_100,
    ...SHADOW.SM,
    elevation: 1,
  },
  actionButtonPressed: {
    backgroundColor: COLORS.GRAY_200,
    transform: [{ scale: 0.95 }],
  },
  dotsButton: {
    padding: SPACING.SM,
  },
  deckStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.SM,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS + 2,
    borderRadius: BORDER_RADIUS.SM,
  },
  statText: {
    fontSize: FONT_SIZE.MD + 1,
    color: COLORS.GRAY_600,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
  createdDate: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.GRAY_500,
  },
  headerButton: {
    marginRight: SPACING.LG,
    padding: SPACING.XS,
  },
});