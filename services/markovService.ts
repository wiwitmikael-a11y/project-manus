/**
 * An upgraded Markov Chain text generator using bigrams for better context.
 * It learns from a corpus of text by looking at pairs of words, allowing it to generate
 * new text that more closely mimics the style and logical flow of the original.
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
   */
  private getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Trains the model on a given text corpus using a bigram (2-word) model.
   */
  public train(text: string): void {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 3) return;

    // The first two words of the text can be a starter phrase.
    this.starters.push(`${words[0]} ${words[1]}`);

    for (let i = 0; i < words.length - 2; i++) {
      const key = `${words[i]} ${words[i+1]}`;
      const nextWord = words[i + 2];

      if (!this.chain.has(key)) {
        this.chain.set(key, []);
      }
      this.chain.get(key)?.push(nextWord);

      // If a word ends a sentence, the next two words can start a new one.
      if (words[i+1].endsWith('.')) {
          if (words[i+3]) {
             this.starters.push(`${words[i+2]} ${words[i+3]}`);
          }
      }
    }
  }

  /**
   * Generates a new text string based on the trained bigram model.
   */
  public generate(length: number): string {
    if (this.starters.length === 0) {
      return "Model not sufficiently trained.";
    }

    let [word1, word2] = this.getRandom(this.starters).split(' ');
    let result = [word1, word2];

    for (let i = 2; i < length; i++) {
      const key = `${word1} ${word2}`;
      const nextWords = this.chain.get(key);
      
      if (!nextWords || nextWords.length === 0) {
        // If we hit a dead end, start a new phrase from a known starter.
        [word1, word2] = this.getRandom(this.starters).split(' ');
      } else {
        const nextWord = this.getRandom(nextWords);
        result.push(nextWord);
        word1 = word2;
        word2 = nextWord;
      }
      
      // Stop if a sentence naturally ends.
      if (word2.endsWith('.')) {
          break;
      }
    }
    
    // Simple cleanup for a more readable output.
    let sentence = result.join(' ');
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    if (!sentence.endsWith('.') && !sentence.endsWith('?') && !sentence.endsWith('!')) {
        sentence += '.';
    }
    // Fix potential spacing issues with punctuation.
    sentence = sentence.replace(/\s+([.,?!])/g, '$1');
    return sentence;
  }
}