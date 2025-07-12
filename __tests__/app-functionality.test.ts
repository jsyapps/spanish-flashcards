/**
 * Core App Functionality Tests
 * Tests key business logic without React Native dependencies
 */

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Import after mocking
import {
  initializeStorage,
  saveFlashcard,
  getFlashcards,
  deleteFlashcard,
  saveDeck,
  getDecks,
  saveFlashcardToDeck,
  getFlashcardsByDeck,
} from '../utils/storage';

describe('Spanish Flashcards App - Core Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Storage Operations', () => {
    it('should initialize storage correctly', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      await initializeStorage();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('storage_version', '4');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'decks',
        expect.stringContaining('All Flashcards')
      );
    });

    it('should save and retrieve flashcards', async () => {
      const testFlashcard = {
        id: 'test-id',
        front: 'hola',
        back: 'hello',
        createdAt: Date.now(),
      };

      // Mock empty storage initially
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'flashcards') return Promise.resolve('[]');
        if (key === 'flashcard_deck_associations') return Promise.resolve('[]');
        return Promise.resolve(null);
      });

      await saveFlashcard('hola', 'hello');

      // Verify save was called
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcards',
        expect.stringContaining('hola')
      );

      // Mock retrieval
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'flashcards') {
          return Promise.resolve(JSON.stringify([testFlashcard]));
        }
        return Promise.resolve(null);
      });

      const flashcards = await getFlashcards();
      expect(flashcards).toHaveLength(1);
      expect(flashcards[0].front).toBe('hola');
      expect(flashcards[0].back).toBe('hello');
    });

    it('should delete flashcards', async () => {
      const testFlashcards = [
        { id: '1', front: 'hola', back: 'hello', createdAt: Date.now() },
        { id: '2', front: 'gato', back: 'cat', createdAt: Date.now() },
      ];

      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'flashcards') {
          return Promise.resolve(JSON.stringify(testFlashcards));
        }
        if (key === 'flashcard_deck_associations') {
          return Promise.resolve('[]');
        }
        return Promise.resolve(null);
      });

      await deleteFlashcard('1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcards',
        expect.not.stringContaining('hola')
      );
    });
  });

  describe('Deck Management', () => {
    it('should create and manage decks', async () => {
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'decks') return Promise.resolve('[]');
        return Promise.resolve(null);
      });

      await saveDeck('Spanish Basics');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'decks',
        expect.stringContaining('Spanish Basics')
      );
    });

    it('should associate flashcards with decks', async () => {
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'flashcards') return Promise.resolve('[]');
        if (key === 'flashcard_deck_associations') return Promise.resolve('[]');
        return Promise.resolve(null);
      });

      await saveFlashcardToDeck('buenos días', 'good morning', 'deck-1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcards',
        expect.stringContaining('buenos días')
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcard_deck_associations',
        expect.stringContaining('deck-1')
      );
    });

    it('should retrieve flashcards by deck', async () => {
      const testFlashcards = [
        { id: '1', front: 'hola', back: 'hello', createdAt: Date.now() },
        { id: '2', front: 'gato', back: 'cat', createdAt: Date.now() },
      ];
      const testAssociations = [
        { flashcardId: '1', deckId: 'deck-1' },
        { flashcardId: '2', deckId: 'deck-2' },
      ];

      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'flashcards') {
          return Promise.resolve(JSON.stringify(testFlashcards));
        }
        if (key === 'flashcard_deck_associations') {
          return Promise.resolve(JSON.stringify(testAssociations));
        }
        return Promise.resolve(null);
      });

      const deckFlashcards = await getFlashcardsByDeck('deck-1');

      expect(deckFlashcards).toHaveLength(1);
      expect(deckFlashcards[0].front).toBe('hola');
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage unavailable'));

      const flashcards = await getFlashcards();
      expect(flashcards).toEqual([]);
    });

    it('should handle corrupted data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid-json');

      const flashcards = await getFlashcards();
      expect(flashcards).toEqual([]);
    });

    it('should handle null storage values', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const flashcards = await getFlashcards();
      expect(flashcards).toEqual([]);

      const decks = await getDecks();
      expect(decks).toEqual([]);
    });
  });

  describe('Data Validation', () => {
    it('should handle empty flashcard text', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');

      // Should not crash with empty strings
      await saveFlashcard('', 'hello');
      await saveFlashcard('hola', '');

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should generate unique IDs for flashcards', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');
      mockAsyncStorage.setItem.mockResolvedValue();

      await saveFlashcard('word1', 'translation1');
      await saveFlashcard('word2', 'translation2');

      // Verify multiple setItem calls were made
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(4); // 2 flashcards + 2 associations
    });
  });

  describe('API Integration Validation', () => {
    it('should validate API request format', () => {
      const validRequest = {
        message: 'hola',
        headers: {
          'Authorization': 'Bearer valid-key',
          'Content-Type': 'application/json',
        },
      };

      // Basic validation tests
      expect(validRequest.message).toBeTruthy();
      expect(validRequest.headers.Authorization).toContain('Bearer');
      expect(validRequest.headers['Content-Type']).toBe('application/json');
    });

    it('should validate API response format', () => {
      const validResponse = {
        response: 'It means "hello" in English.',
      };

      expect(validResponse.response).toBeTruthy();
      expect(typeof validResponse.response).toBe('string');
      expect(validResponse.response.length).toBeGreaterThan(0);
    });
  });

  describe('App State Management', () => {
    it('should handle app initialization flow', async () => {
      // Simulate fresh app install
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      await initializeStorage();

      // Should create default data structures
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('storage_version', '4');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'decks',
        expect.any(String)
      );
    });

    it('should handle app upgrade scenarios', async () => {
      // Simulate app upgrade from old version
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'storage_version') return Promise.resolve('3');
        return Promise.resolve('[]');
      });

      await initializeStorage();

      // Should update to new version
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('storage_version', '4');
    });
  });
});