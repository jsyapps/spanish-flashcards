import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: Date;
  deckId?: string; // Optional for backward compatibility
}

export interface FlashcardWithDeck extends Flashcard {
  deckId: string; // Required for deck-aware operations
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Storage keys
const FLASHCARDS_KEY = 'flashcards';
const DECKS_KEY = 'decks';
const STORAGE_VERSION_KEY = 'storage_version';
const CURRENT_STORAGE_VERSION = '2';

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

// Deck CRUD Operations
export const saveDeck = async (name: string, description?: string, color?: string): Promise<Deck> => {
  try {
    const deck: Deck = {
      id: Date.now().toString(),
      name,
      description,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingDecks = await getDecks();
    const updatedDecks = [...existingDecks, deck];
    
    await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(updatedDecks));
    return deck;
  } catch (error) {
    console.error('Error saving deck:', error);
    throw error;
  }
};

export const getDecks = async (): Promise<Deck[]> => {
  try {
    const decksJson = await AsyncStorage.getItem(DECKS_KEY);
    if (decksJson) {
      const decks = JSON.parse(decksJson);
      // Convert date strings back to Date objects
      return decks.map((deck: any) => ({
        ...deck,
        createdAt: new Date(deck.createdAt),
        updatedAt: new Date(deck.updatedAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting decks:', error);
    return [];
  }
};

export const updateDeck = async (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>): Promise<void> => {
  try {
    const existingDecks = await getDecks();
    const deckIndex = existingDecks.findIndex(deck => deck.id === id);
    
    if (deckIndex === -1) {
      throw new Error(`Deck with id ${id} not found`);
    }
    
    const updatedDeck = {
      ...existingDecks[deckIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    const updatedDecks = [...existingDecks];
    updatedDecks[deckIndex] = updatedDeck;
    
    await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(updatedDecks));
  } catch (error) {
    console.error('Error updating deck:', error);
    throw error;
  }
};

export const deleteDeck = async (id: string): Promise<void> => {
  try {
    const existingDecks = await getDecks();
    const updatedDecks = existingDecks.filter(deck => deck.id !== id);
    
    await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(updatedDecks));
    
    // Also remove any flashcards associated with this deck
    const existingFlashcards = await getFlashcards();
    const updatedFlashcards = existingFlashcards.filter(card => card.deckId !== id);
    
    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
  } catch (error) {
    console.error('Error deleting deck:', error);
    throw error;
  }
};

export const getDeckById = async (id: string): Promise<Deck | null> => {
  try {
    const decks = await getDecks();
    return decks.find(deck => deck.id === id) || null;
  } catch (error) {
    console.error('Error getting deck by id:', error);
    return null;
  }
};

// Deck-aware Flashcard Operations
export const saveFlashcardToDeck = async (front: string, back: string, deckId: string): Promise<FlashcardWithDeck> => {
  try {
    // Verify deck exists
    const deck = await getDeckById(deckId);
    if (!deck) {
      throw new Error(`Deck with id ${deckId} not found`);
    }

    const flashcard: FlashcardWithDeck = {
      id: Date.now().toString(),
      front,
      back,
      createdAt: new Date(),
      deckId,
    };

    const existingFlashcards = await getFlashcards();
    const updatedFlashcards = [...existingFlashcards, flashcard];
    
    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
    return flashcard;
  } catch (error) {
    console.error('Error saving flashcard to deck:', error);
    throw error;
  }
};

export const getFlashcardsByDeck = async (deckId: string): Promise<FlashcardWithDeck[]> => {
  try {
    const allFlashcards = await getFlashcards();
    return allFlashcards.filter(card => card.deckId === deckId) as FlashcardWithDeck[];
  } catch (error) {
    console.error('Error getting flashcards by deck:', error);
    return [];
  }
};

export const moveFlashcardToDeck = async (flashcardId: string, newDeckId: string): Promise<void> => {
  try {
    // Verify new deck exists
    const deck = await getDeckById(newDeckId);
    if (!deck) {
      throw new Error(`Deck with id ${newDeckId} not found`);
    }

    const existingFlashcards = await getFlashcards();
    const flashcardIndex = existingFlashcards.findIndex(card => card.id === flashcardId);
    
    if (flashcardIndex === -1) {
      throw new Error(`Flashcard with id ${flashcardId} not found`);
    }
    
    const updatedFlashcards = [...existingFlashcards];
    updatedFlashcards[flashcardIndex] = {
      ...updatedFlashcards[flashcardIndex],
      deckId: newDeckId,
    };
    
    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
  } catch (error) {
    console.error('Error moving flashcard to deck:', error);
    throw error;
  }
};

export const getFlashcardsWithoutDeck = async (): Promise<Flashcard[]> => {
  try {
    const allFlashcards = await getFlashcards();
    return allFlashcards.filter(card => !card.deckId);
  } catch (error) {
    console.error('Error getting flashcards without deck:', error);
    return [];
  }
};

export const getDeckStats = async (deckId: string): Promise<{ cardCount: number; lastStudied?: Date }> => {
  try {
    const flashcards = await getFlashcardsByDeck(deckId);
    return {
      cardCount: flashcards.length,
      // TODO: Add lastStudied when study tracking is implemented
    };
  } catch (error) {
    console.error('Error getting deck stats:', error);
    return { cardCount: 0 };
  }
};

// Storage Versioning and Migration
export const getStorageVersion = async (): Promise<string> => {
  try {
    const version = await AsyncStorage.getItem(STORAGE_VERSION_KEY);
    return version || '1'; // Default to version 1 for existing installations
  } catch (error) {
    console.error('Error getting storage version:', error);
    return '1';
  }
};

export const setStorageVersion = async (version: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_VERSION_KEY, version);
  } catch (error) {
    console.error('Error setting storage version:', error);
    throw error;
  }
};

export const createDefaultDeck = async (): Promise<Deck> => {
  try {
    const defaultDeck = await saveDeck(
      'My Flashcards',
      undefined,
      '#007AFF'
    );
    return defaultDeck;
  } catch (error) {
    console.error('Error creating default deck:', error);
    throw error;
  }
};

export const migrateToDecks = async (): Promise<void> => {
  try {
    const currentVersion = await getStorageVersion();
    
    if (currentVersion >= CURRENT_STORAGE_VERSION) {
      console.log('Storage already up to date');
      return;
    }
    
    console.log('Starting migration to decks...');
    
    // Backup existing flashcards
    const existingFlashcards = await getFlashcards();
    if (existingFlashcards.length > 0) {
      await AsyncStorage.setItem('flashcards_backup', JSON.stringify(existingFlashcards));
    }
    
    // Create default deck only if there are existing flashcards
    if (existingFlashcards.length > 0) {
      const defaultDeck = await createDefaultDeck();
      
      // Migrate flashcards to default deck
      const migratedFlashcards = existingFlashcards.map(card => ({
        ...card,
        deckId: defaultDeck.id,
      }));
      
      await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(migratedFlashcards));
      console.log(`Migrated ${existingFlashcards.length} flashcards to default deck`);
    }
    
    // Update storage version
    await setStorageVersion(CURRENT_STORAGE_VERSION);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    
    // Attempt to restore from backup
    try {
      const backup = await AsyncStorage.getItem('flashcards_backup');
      if (backup) {
        await AsyncStorage.setItem(FLASHCARDS_KEY, backup);
        console.log('Restored flashcards from backup');
      }
    } catch (restoreError) {
      console.error('Error restoring from backup:', restoreError);
    }
    
    throw error;
  }
};

export const initializeStorage = async (): Promise<void> => {
  try {
    await migrateToDecks();
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
};

// Data Validation and Error Handling
export const validateDeckName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Deck name is required' };
  }
  
  if (name.trim().length === 0) {
    return { isValid: false, error: 'Deck name cannot be empty' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Deck name must be 50 characters or less' };
  }
  
  return { isValid: true };
};

export const validateDeckDescription = (description?: string): { isValid: boolean; error?: string } => {
  if (description && typeof description !== 'string') {
    return { isValid: false, error: 'Description must be a string' };
  }
  
  if (description && description.length > 200) {
    return { isValid: false, error: 'Description must be 200 characters or less' };
  }
  
  return { isValid: true };
};

export const validateDeckColor = (color?: string): { isValid: boolean; error?: string } => {
  if (color && typeof color !== 'string') {
    return { isValid: false, error: 'Color must be a string' };
  }
  
  if (color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return { isValid: false, error: 'Color must be a valid hex color (e.g., #007AFF)' };
  }
  
  return { isValid: true };
};

export const checkDeckNameExists = async (name: string, excludeId?: string): Promise<boolean> => {
  try {
    const decks = await getDecks();
    return decks.some(deck => 
      deck.name.toLowerCase() === name.toLowerCase() && 
      deck.id !== excludeId
    );
  } catch (error) {
    console.error('Error checking deck name exists:', error);
    return false;
  }
};

export const validateAndSaveDeck = async (
  name: string, 
  description?: string, 
  color?: string
): Promise<{ success: boolean; deck?: Deck; error?: string }> => {
  try {
    // Validate name
    const nameValidation = validateDeckName(name);
    if (!nameValidation.isValid) {
      return { success: false, error: nameValidation.error };
    }
    
    // Validate description
    const descriptionValidation = validateDeckDescription(description);
    if (!descriptionValidation.isValid) {
      return { success: false, error: descriptionValidation.error };
    }
    
    // Validate color
    const colorValidation = validateDeckColor(color);
    if (!colorValidation.isValid) {
      return { success: false, error: colorValidation.error };
    }
    
    // Check for duplicate name
    const nameExists = await checkDeckNameExists(name);
    if (nameExists) {
      return { success: false, error: 'A deck with this name already exists' };
    }
    
    // Save deck
    const deck = await saveDeck(name.trim(), description?.trim(), color);
    return { success: true, deck };
  } catch (error) {
    console.error('Error validating and saving deck:', error);
    return { success: false, error: 'Failed to save deck' };
  }
};

export const validateAndUpdateDeck = async (
  id: string,
  updates: Partial<Omit<Deck, 'id' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate name if provided
    if (updates.name !== undefined) {
      const nameValidation = validateDeckName(updates.name);
      if (!nameValidation.isValid) {
        return { success: false, error: nameValidation.error };
      }
      
      // Check for duplicate name
      const nameExists = await checkDeckNameExists(updates.name, id);
      if (nameExists) {
        return { success: false, error: 'A deck with this name already exists' };
      }
      
      updates.name = updates.name.trim();
    }
    
    // Validate description if provided
    if (updates.description !== undefined) {
      const descriptionValidation = validateDeckDescription(updates.description);
      if (!descriptionValidation.isValid) {
        return { success: false, error: descriptionValidation.error };
      }
      
      updates.description = updates.description?.trim();
    }
    
    // Validate color if provided
    if (updates.color !== undefined) {
      const colorValidation = validateDeckColor(updates.color);
      if (!colorValidation.isValid) {
        return { success: false, error: colorValidation.error };
      }
    }
    
    // Update deck
    await updateDeck(id, updates);
    return { success: true };
  } catch (error) {
    console.error('Error validating and updating deck:', error);
    return { success: false, error: 'Failed to update deck' };
  }
};