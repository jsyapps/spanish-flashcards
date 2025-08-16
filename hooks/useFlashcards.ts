import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { 
  Flashcard, 
  getFlashcards, 
  deleteFlashcard, 
  saveFlashcard, 
  saveFlashcardToMultipleDecks,
  initializeStorage 
} from '../utils/storage';

interface UseFlashcardsResult {
  flashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  loadFlashcards: (shouldShuffle?: boolean) => Promise<void>;
  saveNewFlashcard: (front: string, back: string, deckIds?: string[]) => Promise<boolean>;
  removeFlashcard: (id: string) => Promise<boolean>;
  refreshFlashcards: () => Promise<void>;
}

export const useFlashcards = (): UseFlashcardsResult => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shuffleArray = useCallback((array: Flashcard[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const loadFlashcards = useCallback(async (shouldShuffle = true) => {
    try {
      setLoading(true);
      setError(null);
      
      await initializeStorage();
      const cards = await getFlashcards();
      
      const finalCards = shouldShuffle ? shuffleArray(cards) : cards;
      setFlashcards(finalCards);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load flashcards';
      setError(errorMessage);
      console.error('Error loading flashcards:', err);
    } finally {
      setLoading(false);
    }
  }, [shuffleArray]);

  const saveNewFlashcard = useCallback(async (front: string, back: string, deckIds?: string[]): Promise<boolean> => {
    try {
      setError(null);
      
      if (!front.trim() || !back.trim()) {
        Alert.alert('Error', 'Both front and back text are required');
        return false;
      }

      if (deckIds && deckIds.length > 0) {
        await saveFlashcardToMultipleDecks(front.trim(), back.trim(), deckIds);
      } else {
        await saveFlashcard(front.trim(), back.trim());
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save flashcard';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  const removeFlashcard = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await deleteFlashcard(id);
      
      // Update local state optimistically
      setFlashcards(prev => prev.filter(card => card.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete flashcard';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return false;
    }
  }, []);

  const refreshFlashcards = useCallback(async () => {
    await loadFlashcards(false); // Don't shuffle on refresh
  }, [loadFlashcards]);

  return {
    flashcards,
    loading,
    error,
    loadFlashcards,
    saveNewFlashcard,
    removeFlashcard,
    refreshFlashcards,
  };
};