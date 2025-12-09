// Import bad-words - handle both CommonJS and ES module formats
import * as BadWordsModule from 'bad-words';

// Get the Filter class (handle different export formats)
const Filter = (BadWordsModule as any).default || BadWordsModule.Filter || BadWordsModule;

// Create a filter instance (uses default profanity list)
const filter = new Filter();

// Check if a username contains profanity
export function containsProfanity(text: string): boolean {
  return filter.isProfane(text);
}

// Get a cleaned version of the text (with profanity replaced)
export function cleanProfanity(text: string): string {
  return filter.clean(text);
}

