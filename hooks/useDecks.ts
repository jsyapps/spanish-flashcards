import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { 
  Deck, 
  getDecks, 
  getDeckStats, 
  validateAndSaveDeck, 
  validateAndUpdateDeck, 
  deleteDeck,
  initializeStorage 
} from '../utils/storage';

interface DeckWithStats extends Deck {
  cardCount: number;
}

interface UseDecksResult {
  decks: Deck[];
  decksWithStats: DeckWithStats[];
  loading: boolean;
  error: string | null;
  loadDecks: () => Promise<void>;
  loadDecksWithStats: () => Promise<void>;
  createDeck: (name: string, description?: string) => Promise<boolean>;
  updateDeck: (id: string, updates: Partial<Deck>) => Promise<boolean>;
  removeDeck: (id: string) => Promise<boolean>;
  refreshDecks: () => Promise<void>;
}

export const useDecks = (): UseDecksResult => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [decksWithStats, setDecksWithStats] = useState<DeckWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await initializeStorage();
      const deckList = await getDecks();
      
      // Sort by most recent (updatedAt) first
      const sortedDecks = deckList.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      setDecks(sortedDecks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load decks';
      setError(errorMessage);
      console.error('Error loading decks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDecksWithStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await initializeStorage();
      const deckList = await getDecks();
      
      // Get stats for each deck
      const decksWithStatsData = await Promise.all(
        deckList.map(async (deck) => {
          const stats = await getDeckStats(deck.id);
          return {
            ...deck,
            cardCount: stats.cardCount,
          };
        })
      );
      
      setDecks(deckList);
      setDecksWithStats(decksWithStatsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load decks with stats';
      setError(errorMessage);
      console.error('Error loading decks with stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDeck = useCallback(async (name: string, description?: string): Promise<boolean> => {
    try {
      setError(null);
      
      if (!name.trim()) {
        Alert.alert('Error', 'Deck name is required');
        return false;
      }

      const result = await validateAndSaveDeck(name.trim(), description);
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to create deck');
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deck';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  const updateDeck = useCallback(async (id: string, updates: Partial<Deck>): Promise<boolean> => {
    try {
      setError(null);
      
      if (updates.name && !updates.name.trim()) {
        Alert.alert('Error', 'Deck name cannot be empty');
        return false;
      }

      const result = await validateAndUpdateDeck(id, updates);
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to update deck');
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update deck';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  const removeDeck = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await deleteDeck(id);
      
      // Update local state optimistically
      setDecks(prev => prev.filter(deck => deck.id !== id));
      setDecksWithStats(prev => prev.filter(deck => deck.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete deck';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  const refreshDecks = useCallback(async () => {
    await loadDecksWithStats();
  }, [loadDecksWithStats]);

  return {
    decks,
    decksWithStats,
    loading,
    error,
    loadDecks,
    loadDecksWithStats,
    createDeck,
    updateDeck,
    removeDeck,
    refreshDecks,
  };
};