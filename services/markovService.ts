// This is a new file

/**
 * A simple Markov Chain text generator.
 * It learns from a corpus of text and can generate new text that mimics the style and patterns of the original.
 * This allows for more coherent and context-aware procedural generation than simple word randomization.
 */
export class MarkovChain {
  private chain: Map<string, string[]>;
  private starters: string[];

  constructor() {
    this.chain = new Map();
    this.starters = [];
  }

  /**
   * Gets a random element from an array.
   * @param arr The array to pick from.
   * @returns A random element from the array.
   */
  private getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Trains the model on a given text corpus.
   * @param text The source text to learn from.
   */
  public train(text: string): void {
    const words = text.split(/\s+/);
    if (words.length < 2) return;

    // Identify potential sentence starters
    this.starters.push(words[0]);
    for (let i = 0; i < words.length - 1; i++) {
      const currentWord = words[i];
      const nextWord = words[i + 1];

      if (currentWord.endsWith('.')) {
          if (nextWord) {
            this.starters.push(nextWord);
          }
      }

      if (!this.chain.has(currentWord)) {
        this.chain.set(currentWord, []);
      }
      this.chain.get(currentWord)?.push(nextWord);
    }
  }

  /**
   * Generates a new text string based on the trained model.
   * @param length The approximate number of words for the generated text.
   * @returns A new, generated string.
   */
  public generate(length: number): string {
    if (this.starters.length === 0) {
      return "Model not trained.";
    }

    let currentWord = this.getRandom(this.starters);
    let result = [currentWord];

    for (let i = 1; i < length; i++) {
      const nextWords = this.chain.get(currentWord);
      if (!nextWords || nextWords.length === 0) {
        // If we hit a dead end, start a new sentence.
        currentWord = this.getRandom(this.starters);
      } else {
        currentWord = this.getRandom(nextWords);
      }
      result.push(currentWord);
      
      // Stop if a sentence naturally ends.
      if (currentWord.endsWith('.')) {
          break;
      }
    }
    
    // Simple cleanup for a more readable output
    let sentence = result.join(' ');
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    if (!sentence.endsWith('.')) {
        sentence += '.';
    }
    return sentence;
  }
}
