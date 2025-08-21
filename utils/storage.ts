import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: Date;
}

export interface FlashcardDeckAssociation {
  flashcardId: string;
  deckId: string;
  addedAt: Date;
}

export interface FlashcardWithDecks extends Flashcard {
  deckIds: string[];
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
const FLASHCARD_DECK_ASSOCIATIONS_KEY = 'flashcard_deck_associations';
const STORAGE_VERSION_KEY = 'storage_version';
const CURRENT_STORAGE_VERSION = '4';
const SHUFFLED_ORDER_PREFIX = 'shuffled_order_';

// Types for parsed storage data
interface StoredFlashcard {
  id: string;
  front: string;
  back: string;
  createdAt: string; // JSON stores dates as strings
  deckId?: string; // Legacy property
}

interface StoredDeck {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredFlashcardDeckAssociation {
  flashcardId: string;
  deckId: string;
  addedAt: string;
}


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
      const storedFlashcards: StoredFlashcard[] = JSON.parse(flashcardsJson);
      // Convert date strings back to Date objects
      return storedFlashcards.map((card) => ({
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
export const saveDeck = async (name: string, description?: string): Promise<Deck> => {
  try {
    const deck: Deck = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Get only user-created decks (exclude the virtual "All flashcards" deck)
    const decksJson = await AsyncStorage.getItem(DECKS_KEY);
    const existingDecks = decksJson ? JSON.parse(decksJson) : [];
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
    const storedDecks: StoredDeck[] = decksJson ? JSON.parse(decksJson) : [];
    const userDecks = storedDecks.map((deck) => ({
      ...deck,
      createdAt: new Date(deck.createdAt),
      updatedAt: new Date(deck.updatedAt),
    }));
    
    return userDecks;
  } catch (error) {
    console.error('Error getting decks:', error);
    return [];
  }
};

export const updateDeck = async (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>): Promise<void> => {
  try {
    
    const decksJson = await AsyncStorage.getItem(DECKS_KEY);
    const existingDecks: any[] = decksJson ? JSON.parse(decksJson).map((deck: any) => ({
      ...deck,
      createdAt: new Date(deck.createdAt),
      updatedAt: new Date(deck.updatedAt),
    })) : [];
    
    const deckIndex = existingDecks.findIndex((deck: any) => deck.id === id);
    
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
    
    const decksJson = await AsyncStorage.getItem(DECKS_KEY);
    const existingDecks: any[] = decksJson ? JSON.parse(decksJson) : [];
    const updatedDecks = existingDecks.filter((deck: any) => deck.id !== id);
    
    await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(updatedDecks));
    
    // Get all associations to find orphaned flashcards
    const associations = await getFlashcardDeckAssociations();
    const associationsToDelete = associations.filter(assoc => assoc.deckId === id);
    const flashcardIdsInDeletedDeck = associationsToDelete.map(assoc => assoc.flashcardId);
    
    // Remove all associations with this deck
    const updatedAssociations = associations.filter(assoc => assoc.deckId !== id);
    await AsyncStorage.setItem(FLASHCARD_DECK_ASSOCIATIONS_KEY, JSON.stringify(updatedAssociations));
    
    // Find flashcards that are now orphaned (not associated with any remaining deck)
    const orphanedFlashcardIds = flashcardIdsInDeletedDeck.filter(flashcardId => 
      !updatedAssociations.some(assoc => assoc.flashcardId === flashcardId)
    );
    
    // Remove orphaned flashcards from all flashcards storage
    if (orphanedFlashcardIds.length > 0) {
      const existingFlashcards = await getFlashcards();
      const updatedFlashcards = existingFlashcards.filter(
        flashcard => !orphanedFlashcardIds.includes(flashcard.id)
      );
      await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
    }
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

// Flashcard-Deck Association Functions
export const getFlashcardDeckAssociations = async (): Promise<FlashcardDeckAssociation[]> => {
  try {
    const associationsJson = await AsyncStorage.getItem(FLASHCARD_DECK_ASSOCIATIONS_KEY);
    if (associationsJson) {
      const associations = JSON.parse(associationsJson);
      return associations.map((assoc: any) => ({
        ...assoc,
        addedAt: new Date(assoc.addedAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting flashcard deck associations:', error);
    return [];
  }
};

export const saveFlashcardDeckAssociation = async (flashcardId: string, deckId: string): Promise<void> => {
  try {
    const associations = await getFlashcardDeckAssociations();
    const existingAssociation = associations.find(
      assoc => assoc.flashcardId === flashcardId && assoc.deckId === deckId
    );
    
    if (!existingAssociation) {
      const newAssociation: FlashcardDeckAssociation = {
        flashcardId,
        deckId,
        addedAt: new Date(),
      };
      
      const updatedAssociations = [...associations, newAssociation];
      await AsyncStorage.setItem(FLASHCARD_DECK_ASSOCIATIONS_KEY, JSON.stringify(updatedAssociations));
    }
  } catch (error) {
    console.error('Error saving flashcard deck association:', error);
    throw error;
  }
};

// Updated Deck-aware Flashcard Operations
export const saveFlashcardToDeck = async (front: string, back: string, deckId: string): Promise<Flashcard> => {
  try {
    // Verify deck exists
    const deck = await getDeckById(deckId);
    if (!deck) {
      throw new Error(`Deck with id ${deckId} not found`);
    }

    const flashcard: Flashcard = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      front,
      back,
      createdAt: new Date(),
    };

    const existingFlashcards = await getFlashcards();
    const updatedFlashcards = [...existingFlashcards, flashcard];
    
    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
    
    // Create deck association
    await saveFlashcardDeckAssociation(flashcard.id, deckId);
    
    return flashcard;
  } catch (error) {
    console.error('Error saving flashcard to deck:', error);
    throw error;
  }
};

export const saveFlashcardToMultipleDecks = async (front: string, back: string, deckIds: string[]): Promise<Flashcard> => {
  try {
    // Create the flashcard once
    const flashcard: Flashcard = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      front,
      back,
      createdAt: new Date(),
    };

    const existingFlashcards = await getFlashcards();
    const updatedFlashcards = [...existingFlashcards, flashcard];
    
    await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
    
    // Create associations for all selected decks
    for (const deckId of deckIds) {
      const deck = await getDeckById(deckId);
      if (deck) {
        await saveFlashcardDeckAssociation(flashcard.id, deckId);
      }
    }
    
    return flashcard;
  } catch (error) {
    console.error('Error saving flashcard to multiple decks:', error);
    throw error;
  }
};

export const getFlashcardsByDeck = async (deckId: string): Promise<FlashcardWithDecks[]> => {
  try {
    const allFlashcards = await getFlashcards();
    const associations = await getFlashcardDeckAssociations();
    
    // Get flashcards associated with this specific deck
    const deckAssociations = associations.filter(assoc => assoc.deckId === deckId);
    const flashcardIds = deckAssociations.map(assoc => assoc.flashcardId);
    
    return allFlashcards
      .filter(card => flashcardIds.includes(card.id))
      .map(card => {
        const cardAssociations = associations.filter(assoc => assoc.flashcardId === card.id);
        return {
          ...card,
          deckIds: cardAssociations.map(assoc => assoc.deckId),
        };
      });
  } catch (error) {
    console.error('Error getting flashcards by deck:', error);
    return [];
  }
};

export const addFlashcardToDeck = async (flashcardId: string, deckId: string): Promise<void> => {
  try {
    const deck = await getDeckById(deckId);
    if (!deck) {
      throw new Error(`Deck with id ${deckId} not found`);
    }

    await saveFlashcardDeckAssociation(flashcardId, deckId);
  } catch (error) {
    console.error('Error adding flashcard to deck:', error);
    throw error;
  }
};

export const removeFlashcardFromDeck = async (flashcardId: string, deckId: string): Promise<void> => {
  try {
    const associations = await getFlashcardDeckAssociations();
    const updatedAssociations = associations.filter(
      assoc => !(assoc.flashcardId === flashcardId && assoc.deckId === deckId)
    );
    
    await AsyncStorage.setItem(FLASHCARD_DECK_ASSOCIATIONS_KEY, JSON.stringify(updatedAssociations));
  } catch (error) {
    console.error('Error removing flashcard from deck:', error);
    throw error;
  }
};

export const getFlashcardsWithoutDeck = async (): Promise<Flashcard[]> => {
  try {
    const allFlashcards = await getFlashcards();
    const associations = await getFlashcardDeckAssociations();
    
    const flashcardIdsWithDecks = new Set(associations.map(assoc => assoc.flashcardId));
    return allFlashcards.filter(card => !flashcardIdsWithDecks.has(card.id));
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
      undefined
    );
    return defaultDeck;
  } catch (error) {
    console.error('Error creating default deck:', error);
    throw error;
  }
};

export const createDefaultDecksIfNeeded = async (): Promise<void> => {
  try {
    // Check if default decks have ever been created (first install flag)
    const defaultDecksCreated = await AsyncStorage.getItem('default_decks_created');
    
    if (defaultDecksCreated === 'true') {
      // Default decks were already created once, don't recreate them
      return;
    }
    
    // Create English deck first (will be older)
    await saveDeck('🇺🇸 English', 'Learn basic English vocabulary');
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create Mexican slang deck second (will be newer and appear on top)
    const mexicanDeck = await saveDeck('🇲🇽 Mexican slang', 'Learn Mexican Spanish slang terms');
    
    // Add sample flashcards to Mexican slang deck
    await saveFlashcardToDeck('¿Qué onda, güey?', "What's up, dude?", mexicanDeck.id);
    await saveFlashcardToDeck('No mames, güey', "No way, dude!", mexicanDeck.id);
    await saveFlashcardToDeck('Qué padre', "How cool!", mexicanDeck.id);
    await saveFlashcardToDeck('Vete a la verga', "Way to go!", mexicanDeck.id);
    await saveFlashcardToDeck('Está cabrón', "That's tough/crazy!", mexicanDeck.id);
    
    // Mark that default decks have been created
    await AsyncStorage.setItem('default_decks_created', 'true');
  } catch (error) {
    console.error('Error creating default decks:', error);
    // Don't throw - this shouldn't break initialization
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
    
    // Migration from version 1, 2, or 3 to version 4 (new association model)
    if (currentVersion < '4') {
      console.log('Migrating to association-based model...');
      
      // Get flashcards that have deckId property (from old model)
      const flashcardsWithDecks = existingFlashcards.filter((card: any) => card.deckId);
      
      if (flashcardsWithDecks.length > 0) {
        // Create associations for existing deck assignments
        const associations: FlashcardDeckAssociation[] = flashcardsWithDecks.map((card: any) => ({
          flashcardId: card.id,
          deckId: card.deckId,
          addedAt: card.createdAt || new Date(),
        }));
        
        await AsyncStorage.setItem(FLASHCARD_DECK_ASSOCIATIONS_KEY, JSON.stringify(associations));
        
        // Remove deckId from flashcards (clean up old model)
        const cleanedFlashcards = existingFlashcards.map((card: any) => {
          const { deckId, ...cleanCard } = card;
          return cleanCard;
        });
        
        await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cleanedFlashcards));
        console.log(`Migrated ${associations.length} deck associations`);
      }
    }
    
    // Create default deck only if there are existing flashcards without deck associations and we're migrating from version 1
    if (existingFlashcards.length > 0 && currentVersion < '2') {
      const flashcardsWithoutDecks = existingFlashcards.filter((card: any) => !card.deckId);
      
      if (flashcardsWithoutDecks.length > 0) {
        const defaultDeck = await createDefaultDeck();
        
        // Create associations for flashcards without decks
        const associations: FlashcardDeckAssociation[] = flashcardsWithoutDecks.map((card: any) => ({
          flashcardId: card.id,
          deckId: defaultDeck.id,
          addedAt: card.createdAt || new Date(),
        }));
        
        const existingAssociations = await getFlashcardDeckAssociations();
        const allAssociations = [...existingAssociations, ...associations];
        
        await AsyncStorage.setItem(FLASHCARD_DECK_ASSOCIATIONS_KEY, JSON.stringify(allAssociations));
        console.log(`Created default deck and migrated ${flashcardsWithoutDecks.length} flashcards`);
      }
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
    await createDefaultDecksIfNeeded();
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
  description?: string
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
    
    
    // Check for duplicate name
    const nameExists = await checkDeckNameExists(name);
    if (nameExists) {
      return { success: false, error: 'A deck with this name already exists' };
    }
    
    // Save deck
    const deck = await saveDeck(name.trim(), description?.trim());
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
    
    
    // Update deck
    await updateDeck(id, updates);
    return { success: true };
  } catch (error) {
    console.error('Error validating and updating deck:', error);
    return { success: false, error: 'Failed to update deck' };
  }
};

// Shuffled Order Management
export const getShuffledCardOrder = async (orderKey: string): Promise<string[] | null> => {
  try {
    const stored = await AsyncStorage.getItem(SHUFFLED_ORDER_PREFIX + orderKey);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting shuffled card order:', error);
    return null;
  }
};

export const setShuffledCardOrder = async (orderKey: string, cardIds: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SHUFFLED_ORDER_PREFIX + orderKey, JSON.stringify(cardIds));
  } catch (error) {
    console.error('Error setting shuffled card order:', error);
  }
};

export const clearShuffledCardOrder = async (orderKey: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SHUFFLED_ORDER_PREFIX + orderKey);
  } catch (error) {
    console.error('Error clearing shuffled card order:', error);
  }
};

export const applyShuffledOrder = (cards: Flashcard[], cardIds: string[]): Flashcard[] => {
  const cardMap = new Map(cards.map(card => [card.id, card]));
  const orderedCards: Flashcard[] = [];
  
  // Add cards in the saved order
  for (const cardId of cardIds) {
    const card = cardMap.get(cardId);
    if (card) {
      orderedCards.push(card);
      cardMap.delete(cardId);
    }
  }
  
  // Add any new cards that weren't in the saved order
  orderedCards.push(...cardMap.values());
  
  return orderedCards;
};