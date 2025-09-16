import { GenesisData, GameEventType, GameEvent, Agent, Biome, Structure, Creature, AgentAppearance } from '../types';

export class MarkovChain {
  private chain: Map<string, Map<string, number>> = new Map();
  private starters: string[] = [];

  private getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  private getWeightedRandom(freqMap: Map<string, number>): string {
    const totalWeight = [...freqMap.values()].reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    for (const [word, weight] of freqMap.entries()) {
        random -= weight;
        if (random <= 0) return word;
    }
    return [...freqMap.keys()].pop() || '';
  }

  public train(text: string): void {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 3) return;
    this.starters.push(`${words[0]} ${words[1]}`);
    for (let i = 0; i < words.length - 2; i++) {
      const key = `${words[i]} ${words[i+1]}`;
      const nextWord = words[i + 2];
      if (!this.chain.has(key)) this.chain.set(key, new Map());
      const freqMap = this.chain.get(key)!;
      freqMap.set(nextWord, (freqMap.get(nextWord) || 0) + 1);
      if (words[i+1].endsWith('.') && words[i+3]) {
         this.starters.push(`${words[i+2]} ${words[i+3]}`);
      }
    }
  }

  public generate(length: number): string {
    if (this.starters.length === 0) return "Model not sufficiently trained.";
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
        [word1, word2] = [word2, nextWord];
      }
      if (word2.endsWith('.')) break;
    }
    let sentence = result.join(' ');
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    if (!/[.?!]$/.test(sentence)) sentence += '.';
    return sentence.replace(/\s+([.,?!])/g, '$1');
  }
}

const corpus = `
The colony vessel 'Odyssey' is a ghost, a shattered memory against the bruised purple sky of Kepler-186f. We, the survivors, are the dream's final, ragged breath. Our cryo-pods were scattered like seeds across a valley filled with colossal, glowing fungi, their ethereal luminescence a constant, haunting watchlight in our new world. The very air thrums with a strange energy. We must build a new society from the scrap of our fallen starship. We must survive the unknown threats. Near the crash site stands a monolith of obsidian-like material. It radiates a low-frequency hum. Resources are a constant worry. Food is scarce. We have named our fledgling settlement 'Haven', a simple word that carries the weight of all our hopes. The nights are the hardest. They are never truly dark. Colonists reported vivid dreams: visions of sprawling cities deep beneath the planet's crust.
`;

const femaleFirstNames = ["Anya", "Zara", "Nia", "Elara"];
const maleFirstNames = ["Kenji", "Liam", "Javier", "Roric"];
const lastNames = ["Volkov", "Tanaka", "Singh", "Al-Jamil", "Ortega", "Corbin", "Li", "Falke"];

const narrativeGenerator = new MarkovChain();
narrativeGenerator.train(corpus);

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const generateUniqueName = (gender: 'male' | 'female'): string => {
    const first = gender === 'male'
        ? maleFirstNames[getRandomInt(0, maleFirstNames.length - 1)]
        : femaleFirstNames[getRandomInt(0, femaleFirstNames.length - 1)];
    const last = lastNames[getRandomInt(0, lastNames.length - 1)];
    return `${first} ${last}`;
};

const generateAgent = (id: number, worldWidth: number, worldHeight: number): Agent => {
    const x = Math.random() * worldWidth;
    const y = Math.random() * worldHeight;
    const gender = getRandomInt(0, 1) === 0 ? 'male' : 'female';
    const isMoving = true;

    const appearance: AgentAppearance = {
      spritesheet: gender === 'male' ? 'colonist_male_1' : 'colonist_female_1',
    };

    return {
        id: `agent-${id}`,
        name: generateUniqueName(gender),
        gender: gender,
        task: getRandomInt(0, 1) === 0 ? 'Foraging' : 'Idle',
        mood: getRandomInt(60, 90),
        hunger: getRandomInt(5, 20),
        personality: { creativity: getRandomInt(1, 10), pragmatism: getRandomInt(1, 10), social: getRandomInt(1, 10) },
        skills: { foraging: getRandomInt(1, 5), woodcutting: getRandomInt(1, 5), crafting: getRandomInt(1, 5) },
        relationships: {},
        x, y,
        targetX: Math.random() * worldWidth,
        targetY: Math.random() * worldHeight,
        isMoving: isMoving,
        appearance,
        direction: 'S',
        animationState: isMoving ? 'walk' : 'idle',
        animationFrame: 0,
        animationTick: 0,
    };
};

let worldElementIdCounter = 0;
const generateWorldElement = (type: 'biome' | 'structure' | 'creature'): Biome | Structure | Creature => {
    const name = capitalize(narrativeGenerator.generate(getRandomInt(2,4)).replace('.', ''));
    const description = narrativeGenerator.generate(getRandomInt(10, 20));
    const id = `${type}-${worldElementIdCounter++}`; // FIX: Use a guaranteed unique counter
    if (type === 'creature') {
        const temperaments: Creature['temperament'][] = ['DOCILE', 'NEUTRAL', 'HOSTILE'];
        return { id, name, description, temperament: temperaments[getRandomInt(0, 2)] };
    }
    if (type === 'structure') {
        const types: Structure['type'][] = ['SHELTER', 'LANDMARK', 'STORAGE'];
        return { id, name, description, type: types[getRandomInt(0, 2)] };
    }
    return { id, name, description };
}

export async function generateGenesis(): Promise<GenesisData> {
    worldElementIdCounter = 0; // Reset counter for each new world
    const agentCount = getRandomInt(3, 5);
    const agents = Array.from({ length: agentCount }, (_, i) => generateAgent(i + 1, 50, 50));
    
    const startingEvent: GameEvent = {
        id: `event-genesis-0`,
        timestamp: Date.now(),
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
