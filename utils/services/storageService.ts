import AsyncStorage from '@react-native-async-storage/async-storage';
import { Flashcard, Deck } from '../storage';
import { validateFlashcardInput, validateDeckInput } from '../validation/flashcardValidation';
import { AppError, StorageError, ValidationError, getErrorMessage } from '../errorHandling';

interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export class FlashcardStorageService {
  private static readonly FLASHCARDS_KEY = 'flashcards';
  
  static async saveFlashcard(front: string, back: string): Promise<ServiceResult> {
    try {
      // Validate input
      const validation = validateFlashcardInput(front, back);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const flashcard: Flashcard = {
        id: Date.now().toString(),
        front: front.trim(),
        back: back.trim(),
        createdAt: new Date(),
      };

      const existingFlashcards = await this.getFlashcards();
      const updatedFlashcards = [...existingFlashcards, flashcard];
      
      await AsyncStorage.setItem(this.FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
      
      return { success: true, data: flashcard };
    } catch (error) {
      console.error('Error saving flashcard:', error);
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }

  static async getFlashcards(): Promise<Flashcard[]> {
    try {
      const flashcardsJson = await AsyncStorage.getItem(this.FLASHCARDS_KEY);
      if (!flashcardsJson) return [];

      const storedFlashcards = JSON.parse(flashcardsJson);
      return storedFlashcards.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
      }));
    } catch (error) {
      console.error('Error getting flashcards:', error);
      return [];
    }
  }

  static async deleteFlashcard(id: string): Promise<ServiceResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Flashcard ID is required'
        };
      }

      const existingFlashcards = await this.getFlashcards();
      const updatedFlashcards = existingFlashcards.filter(card => card.id !== id);
      
      if (existingFlashcards.length === updatedFlashcards.length) {
        return {
          success: false,
          error: 'Flashcard not found'
        };
      }
      
      await AsyncStorage.setItem(this.FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
}

export class DeckStorageService {
  private static readonly DECKS_KEY = 'decks';

  static async saveDeck(name: string, description?: string): Promise<ServiceResult<Deck>> {
    try {
      // Validate input
      const validation = validateDeckInput(name, description);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check for duplicate names
      const existingDecks = await this.getDecks();
      const duplicateName = existingDecks.find(deck => 
        deck.name.toLowerCase() === name.trim().toLowerCase()
      );
      
      if (duplicateName) {
        return {
          success: false,
          error: 'A deck with this name already exists'
        };
      }

      const now = new Date();
      const deck: Deck = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description?.trim(),
        createdAt: now,
        updatedAt: now,
      };

      const updatedDecks = [...existingDecks, deck];
      await AsyncStorage.setItem(this.DECKS_KEY, JSON.stringify(updatedDecks));
      
      return { success: true, data: deck };
    } catch (error) {
      console.error('Error saving deck:', error);
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }

  static async getDecks(): Promise<Deck[]> {
    try {
      const decksJson = await AsyncStorage.getItem(this.DECKS_KEY);
      if (!decksJson) return [];

      const storedDecks = JSON.parse(decksJson);
      return storedDecks.map((deck: any) => ({
        ...deck,
        createdAt: new Date(deck.createdAt),
        updatedAt: new Date(deck.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting decks:', error);
      return [];
    }
  }

  static async deleteDeck(id: string): Promise<ServiceResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Deck ID is required'
        };
      }

      const existingDecks = await this.getDecks();
      const updatedDecks = existingDecks.filter(deck => deck.id !== id);
      
      if (existingDecks.length === updatedDecks.length) {
        return {
          success: false,
          error: 'Deck not found'
        };
      }
      
      await AsyncStorage.setItem(this.DECKS_KEY, JSON.stringify(updatedDecks));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting deck:', error);
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
}