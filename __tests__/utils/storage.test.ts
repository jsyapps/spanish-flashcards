import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeStorage,
  saveFlashcard,
  getFlashcards,
  deleteFlashcard,
  saveDeck,
  getDecks,
  deleteDeck,
  saveFlashcardToDeck,
  getFlashcardsByDeck,
  saveFlashcardToMultipleDecks,
} from '../../utils/storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('Storage Utils', () => {
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeStorage', () => {
    it('should initialize storage with default deck', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      await initializeStorage();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'storage_version',
        '4'
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'decks',
        expect.stringContaining('All Flashcards')
      );
    });

    it('should not initialize if already current version', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('4');

      await initializeStorage();

      expect(mockAsyncStorage.setItem).not.toHaveBeenCalledWith(
        'storage_version',
        '4'
      );
    });
  });

  describe('Flashcard operations', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'flashcards') {
          return Promise.resolve('[]');
        }
        if (key === 'flashcard_deck_associations') {
          return Promise.resolve('[]');
        }
        return Promise.resolve(null);
      });
    });

    it('should save a flashcard', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await saveFlashcard('hola', 'hello');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcards',
        expect.stringContaining('hola')
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcard_deck_associations',
        expect.any(String)
      );
    });

    it('should get flashcards', async () => {
      const mockFlashcards = [
        { id: '1', front: 'hola', back: 'hello', createdAt: Date.now() }
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockFlashcards));

      const result = await getFlashcards();

      expect(result).toEqual(mockFlashcards);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('flashcards');
    });

    it('should delete a flashcard', async () => {
      const mockFlashcards = [
        { id: '1', front: 'hola', back: 'hello', createdAt: Date.now() },
        { id: '2', front: 'gato', back: 'cat', createdAt: Date.now() }
      ];
      const mockAssociations = [
        { flashcardId: '1', deckId: 'deck1' },
        { flashcardId: '2', deckId: 'deck1' }
      ];

      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'flashcards') {
          return Promise.resolve(JSON.stringify(mockFlashcards));
        }
        if (key === 'flashcard_deck_associations') {
          return Promise.resolve(JSON.stringify(mockAssociations));
        }
        return Promise.resolve(null);
      });

      await deleteFlashcard('1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcards',
        expect.not.stringContaining('hola')
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcard_deck_associations',
        expect.any(String)
      );
    });
  });

  describe('Deck operations', () => {
    beforeEach(() => {
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'decks') {
          return Promise.resolve('[]');
        }
        return Promise.resolve(null);
      });
    });

    it('should save a deck', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await saveDeck('My Deck');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'decks',
        expect.stringContaining('My Deck')
      );
    });

    it('should get decks', async () => {
      const mockDecks = [
        { id: '1', name: 'My Deck', createdAt: Date.now() }
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDecks));

      const result = await getDecks();

      expect(result).toEqual(mockDecks);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('decks');
    });

    it('should delete a deck', async () => {
      const mockDecks = [
        { id: '1', name: 'My Deck', createdAt: Date.now() },
        { id: '2', name: 'Another Deck', createdAt: Date.now() }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockDecks));
      mockAsyncStorage.setItem.mockResolvedValue();

      await deleteDeck('1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'decks',
        expect.not.stringContaining('My Deck')
      );
    });
  });

  describe('Deck-flashcard associations', () => {
    it('should save flashcard to deck', async () => {
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'flashcards') {
          return Promise.resolve('[]');
        }
        if (key === 'flashcard_deck_associations') {
          return Promise.resolve('[]');
        }
        return Promise.resolve(null);
      });
      mockAsyncStorage.setItem.mockResolvedValue();

      await saveFlashcardToDeck('hola', 'hello', 'deck1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcards',
        expect.stringContaining('hola')
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcard_deck_associations',
        expect.stringContaining('deck1')
      );
    });

    it('should save flashcard to multiple decks', async () => {
      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'flashcards') {
          return Promise.resolve('[]');
        }
        if (key === 'flashcard_deck_associations') {
          return Promise.resolve('[]');
        }
        return Promise.resolve(null);
      });
      mockAsyncStorage.setItem.mockResolvedValue();

      await saveFlashcardToMultipleDecks('hola', 'hello', ['deck1', 'deck2']);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcards',
        expect.stringContaining('hola')
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'flashcard_deck_associations',
        expect.stringContaining('deck1')
      );
    });

    it('should get flashcards by deck', async () => {
      const mockFlashcards = [
        { id: '1', front: 'hola', back: 'hello', createdAt: Date.now() },
        { id: '2', front: 'gato', back: 'cat', createdAt: Date.now() }
      ];
      const mockAssociations = [
        { flashcardId: '1', deckId: 'deck1' },
        { flashcardId: '2', deckId: 'deck2' }
      ];

      mockAsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'flashcards') {
          return Promise.resolve(JSON.stringify(mockFlashcards));
        }
        if (key === 'flashcard_deck_associations') {
          return Promise.resolve(JSON.stringify(mockAssociations));
        }
        return Promise.resolve(null);
      });

      const result = await getFlashcardsByDeck('deck1');

      expect(result).toHaveLength(1);
      expect(result[0].front).toBe('hola');
    });
  });

  describe('Error handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await getFlashcards();

      expect(result).toEqual([]);
    });

    it('should handle malformed JSON data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const result = await getFlashcards();

      expect(result).toEqual([]);
    });
  });
});