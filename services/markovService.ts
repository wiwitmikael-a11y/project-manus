// Layanan ini menggunakan AI Markov Chain lokal untuk menghasilkan semua data naratif dan dunia.

import { GenesisData, GameEventType, GameEvent, Agent, Biome, Structure, Creature, ColonyResources } from '../types';

/**
 * Generator teks Markov Chain yang ditingkatkan menggunakan bigram untuk konteks yang lebih baik.
 * Ia belajar dari korpus teks dengan melihat pasangan kata dan frekuensinya, memungkinkannya menghasilkan
 * teks baru yang lebih mirip dengan gaya dan alur logika aslinya.
 */
export class MarkovChain {
  // Key: "kata1 kata2", Value: Map<"kata_berikutnya", frekuensi>
  private chain: Map<string, Map<string, number>>;
  private starters: string[];

  constructor() {
    this.chain = new Map();
    this.starters = [];
  }

  /**
   * Mendapatkan elemen acak dari sebuah array.
   */
  private getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  /**
   * Memilih kata secara acak dari peta frekuensi berdasarkan bobotnya.
   */
  private getWeightedRandom(freqMap: Map<string, number>): string {
    let totalWeight = 0;
    for (const weight of freqMap.values()) {
        totalWeight += weight;
    }

    let random = Math.random() * totalWeight;

    for (const [word, weight] of freqMap.entries()) {
        random -= weight;
        if (random <= 0) {
            return word;
        }
    }
    
    // Fallback untuk memastikan nilai selalu dikembalikan
    return [...freqMap.keys()].pop() || '';
  }


  /**
   * Melatih model pada korpus teks yang diberikan menggunakan model bigram (2 kata)
   * dan mencatat frekuensi setiap kata berikutnya.
   */
  public train(text: string): void {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 3) return;

    this.starters.push(`${words[0]} ${words[1]}`);

    for (let i = 0; i < words.length - 2; i++) {
      const key = `${words[i]} ${words[i+1]}`;
      const nextWord = words[i + 2];

      if (!this.chain.has(key)) {
        this.chain.set(key, new Map());
      }
      const freqMap = this.chain.get(key)!;
      freqMap.set(nextWord, (freqMap.get(nextWord) || 0) + 1);

      if (words[i+1].endsWith('.') && words[i+3]) {
         this.starters.push(`${words[i+2]} ${words[i+3]}`);
      }
    }
  }

  /**
   * Menghasilkan string teks baru berdasarkan model bigram berbobot yang telah dilatih.
   */
  public generate(length: number): string {
    if (this.starters.length === 0) {
      return "Model not sufficiently trained.";
    }

    let [word1, word2] = this.getRandom(this.starters).split(' ');
    let result = [word1, word2];

    for (let i = 2; i < length; i++) {
      const key = `${word1} ${word2}`;
      const nextWordFreq = this.chain.get(key);
      
      if (!nextWordFreq || nextWordFreq.size === 0) {
        [word1, word2] = this.getRandom(this.starters).split(' ');
      } else {
        const nextWord = this.getWeightedRandom(nextWordFreq);
        result.push(nextWord);
        word1 = word2;
        word2 = nextWord;
      }
      
      if (word2.endsWith('.')) {
          break;
      }
    }
    
    let sentence = result.join(' ');
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    if (!sentence.endsWith('.') && !sentence.endsWith('?') && !sentence.endsWith('!')) {
        sentence += '.';
    }
    sentence = sentence.replace(/\s+([.,?!])/g, '$1');
    return sentence;
  }
}

// --- CORPUS: Sumber pengetahuan untuk AI lokal kita ---
const corpus = `
The colony vessel 'Odyssey' is a ghost, a shattered memory against the bruised purple sky of Kepler-186f. We, the survivors, are the dream's final, ragged breath. Our cryo-pods were scattered like seeds across a valley filled with colossal, glowing fungi, their ethereal luminescence a constant, haunting watchlight in our new world. The very air thrums with a strange energy, a palpable resonance that tickles the back of the neck and whispers of untold power and immense danger. We must build a new society from the scrap of our fallen starship. We must survive the unknown threats of this alien biome. We must become a new kind of human.

Near the crash site stands a monolith of obsidian-like material, its surface impossibly smooth and absorbing all light. It radiates a low-frequency hum that vibrates in our bones. Anya, our lead xenobotanist, believes it's a marker, a piece of a larger puzzle. Kenji, the pragmatist and chief engineer, suspects it's a dormant power source, one that could solve all our energy problems or vaporize us instantly. Our limited tools can't even scratch its surface. We are children poking at a sleeping god.

Resources are a constant worry. Food is scarce, though the forests are teeming with life. The native Hexa-Loom Weavers spin edible, protein-rich silk, and the hardy Puna Beetles offer a crunchy, if unappetizing, source of nutrition. We have named our fledgling settlement 'Haven', a simple word that carries the weight of all our hopes. It is a promise we make to ourselves with every new wall we raise.

The nights are the hardest. They are never truly dark, filled with the soft glow of the moss and the clicking, chittering sounds of unseen creatures moving in the undergrowth. Several colonists have reported vivid, disturbing dreams: visions of sprawling, geometric cities deep beneath the planet's crust and whispers in a language that feels both ancient and familiar. Is it the pressure of survival, or is the planet itself trying to communicate? The ship's AI, MANUS, remains silent. Its core logic matrix, our guide and protector, was shattered in the crash. We are adrift in a sea of stars, truly on our own.
`;

const firstNames = ["Anya", "Kenji", "Liam", "Zara", "Javier", "Nia", "Roric", "Elara"];
const lastNames = ["Volkov", "Tanaka", "Singh", "Al-Jamil", "Ortega", "Corbin", "Li", "Falke"];

// --- Model AI ---
const narrativeGenerator = new MarkovChain();
narrativeGenerator.train(corpus);

// --- Fungsi Bantuan ---
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const generateUniqueName = (): string => {
    const first = firstNames[getRandomInt(0, firstNames.length - 1)];
    const last = lastNames[getRandomInt(0, lastNames.length - 1)];
    return `${first} ${last}`;
};

const generateAgent = (id: number): Omit<Agent, 'x' | 'y' | 'targetX' | 'targetY' | 'isMoving' | 'relationships'> => ({
    id: `agent-${id}`,
    name: generateUniqueName(),
    task: getRandomInt(0, 1) === 0 ? 'Foraging' : 'Idle',
    mood: getRandomInt(60, 90),
    hunger: getRandomInt(5, 20),
    personality: {
        creativity: getRandomInt(1, 10),
        pragmatism: getRandomInt(1, 10),
        social: getRandomInt(1, 10),
    },
    skills: {
        foraging: getRandomInt(1, 5),
        woodcutting: getRandomInt(1, 5),
        crafting: getRandomInt(1, 5),
    },
});

const generateWorldElement = (type: 'biome' | 'structure' | 'creature'): Biome | Structure | Creature => {
    const name = capitalize(narrativeGenerator.generate(2).replace('.', ''));
    const description = narrativeGenerator.generate(getRandomInt(10, 20));

    if (type === 'creature') {
        const temperaments: Creature['temperament'][] = ['DOCILE', 'NEUTRAL', 'HOSTILE'];
        return { name, description, temperament: temperaments[getRandomInt(0, 2)] };
    }
    if (type === 'structure') {
        const types: Structure['type'][] = ['SHELTER', 'LANDMARK', 'STORAGE'];
        return { name, description, type: types[getRandomInt(0, 2)] };
    }
    return { name, description };
}

/**
 * Menghasilkan keadaan awal dunia menggunakan AI Markov Chain lokal.
 */
export async function generateGenesis(): Promise<GenesisData> {
    const agentCount = getRandomInt(3, 5);
    const agents = Array.from({ length: agentCount }, (_, i) => generateAgent(i + 1));
    
    const startingEvent: Omit<GameEvent, 'id' | 'timestamp'> = {
        type: GameEventType.NARRATIVE,
        title: capitalize(narrativeGenerator.generate(getRandomInt(3, 5)).replace('.', '')),
        description: narrativeGenerator.generate(getRandomInt(15, 25)),
        isAiGenerated: true,
    };

    const genesisData: GenesisData = {
        agents,
        startingEvent,
        culturalValues: {
            collectivism: getRandomInt(40, 70),
            pragmatism: getRandomInt(40, 70),
            spirituality: getRandomInt(20, 50),
        },
        biomes: Array.from({ length: getRandomInt(2, 3) }, () => generateWorldElement('biome') as Biome),
        structures: Array.from({ length: getRandomInt(1, 2) }, () => generateWorldElement('structure') as Structure),
        creatures: Array.from({ length: getRandomInt(2, 3) }, () => generateWorldElement('creature') as Creature),
    };
    
    return Promise.resolve(genesisData);
}

type DynamicEventPayload = {
    day: number;
    resources: ColonyResources;
    events: GameEvent[];
};

/**
 * Menghasilkan peristiwa dinamis baru menggunakan AI Markov Chain lokal.
 */
export async function generateDynamicEvent(payload: DynamicEventPayload): Promise<Omit<GameEvent, 'id' | 'timestamp' | 'isAiGenerated'>> {
    const eventTypes: GameEventType[] = [GameEventType.NARRATIVE, GameEventType.AGENT, GameEventType.SYSTEM];
    
    const event = {
        type: eventTypes[getRandomInt(0, 2)],
        title: capitalize(narrativeGenerator.generate(getRandomInt(4, 6)).replace('.', '')),
        description: narrativeGenerator.generate(getRandomInt(15, 25)),
    };

    return Promise.resolve(event);
}