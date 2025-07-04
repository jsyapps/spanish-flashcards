import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: Date;
}

const FLASHCARDS_KEY = 'flashcards';

export const saveFlashcard = async (front: string, back: string): Promise<void> => {
  try {
    const flashcard: Flashcard = {
      id: Date.now().toString(),
      front,
      back,
      createdAt: new Date(),
    };

    const existingFlashcards = await getFlashcards();
    const updatedFlashcards = [...existingFlashcards, flashcard];
    
    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
  } catch (error) {
    console.error('Error saving flashcard:', error);
    throw error;
  }
};

export const getFlashcards = async (): Promise<Flashcard[]> => {
  try {
    const flashcardsJson = await AsyncStorage.getItem(FLASHCARDS_KEY);
    if (flashcardsJson) {
      const flashcards = JSON.parse(flashcardsJson);
      // Convert date strings back to Date objects
      return flashcards.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting flashcards:', error);
    return [];
  }
};

export const deleteFlashcard = async (id: string): Promise<void> => {
  try {
    const existingFlashcards = await getFlashcards();
    const updatedFlashcards = existingFlashcards.filter(card => card.id !== id);
    
    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    throw error;
  }
};

export const clearAllFlashcards = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FLASHCARDS_KEY);
  } catch (error) {
    console.error('Error clearing flashcards:', error);
    throw error;
  }
};