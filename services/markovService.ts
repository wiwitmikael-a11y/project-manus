import { GenesisData, GameEventType, GameEvent, Agent, Biome, Structure, Creature, AgentAppearance } from '../types';
import { generateWorldElements, GeneratedWorldElements } from './geminiService';

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
The silence of the wasteland is a heavy blanket, broken only by the wind whistling through the skeletons of skyscrapers. This is what's left after 'The Fall'. We are the ghosts haunting the ruins of the Old World. Our shelter is a patched-up husk of a pre-Fall building, a small flicker of light in a dead city. Every sunrise is a victory, every can of food a treasure. We scavenge through the rust and dust, always listening for the skittering of mutated things in the shadows. Radiation pockets make the Geiger counter an unwelcome friend. The old highways are now just graveyards of steel. We found a stash of old books, their pages brittle, telling stories of a time before the sky burned. That world is gone. This one is ours to survive. We named our camp 'The Bastion', a defiant cry against the emptiness. The nights are long and filled with strange howls.
`;

const femaleFirstNames = ["Sarah", "Maya", "Elena", "Abby", "Zoe"];
const maleFirstNames = ["Joel", "Alex", "Marco", "David", "Leo"];
const lastNames = ["Miller", "Chen", "Grimes", "Sato", "Reyes", "Williams"];

const narrativeGenerator = new MarkovChain();
narrativeGenerator.train(corpus);

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- Konfigurasi Penampilan Agen ---
const MALE_SPRITESHEET = 'colonist_male_1';
const FEMALE_SPRITESHEET = 'colonist_female_1';

const generateUniqueName = (gender: 'male' | 'female'): string => {
    const first = gender === 'male'
        ? getRandom(maleFirstNames)
        : getRandom(femaleFirstNames);
    const last = getRandom(lastNames);
    return `${first} ${last}`;
};

const generateAgent = (id: number, worldWidth: number, worldHeight: number): Agent => {
    const x = Math.random() * worldWidth;
    const y = Math.random() * worldHeight;
    const gender = getRandomInt(0, 1) === 0 ? 'male' : 'female';
    const isMoving = false; // Mulai dengan tidak bergerak

    const spritesheet = gender === 'male' ? MALE_SPRITESHEET : FEMALE_SPRITESHEET;

    const appearance: AgentAppearance = {
      spritesheet,
    };

    return {
        id: `agent-${id}`,
        name: generateUniqueName(gender),
        gender: gender,
        task: 'Idle', // Mulai dengan task Idle, biarkan AI yang menentukan
        mood: getRandomInt(40, 70),
        hunger: getRandomInt(15, 30),
        personality: { creativity: getRandomInt(1, 10), pragmatism: getRandomInt(1, 10), social: getRandomInt(1, 10) },
        skills: { foraging: getRandomInt(1, 5), woodcutting: getRandomInt(1, 5), crafting: getRandomInt(1, 5) },
        relationships: {},
        x, y,
        targetX: x,
        targetY: y,
        isMoving: isMoving,
        appearance,
        direction: 'SE', // Default direction to match sprites
        animationState: isMoving ? 'walk' : 'idle',
        animationFrame: 0,
        animationTick: 0,
    };
};

let worldElementIdCounter = 0;
const addId = <T extends { name: string; description: string }>(element: T, type: string): T & { id: string } => ({
    ...element,
    id: `${type}-${worldElementIdCounter++}`,
});


export async function generateGenesis(): Promise<GenesisData> {
    worldElementIdCounter = 0;
    
    const worldElements = await generateWorldElements();
    
    const agentCount = getRandomInt(3, 5);
    const agents = Array.from({ length: agentCount }, (_, i) => generateAgent(i + 1, 50, 50));
    
    const startingEvent: GameEvent = {
        id: `event-genesis-0`,
        timestamp: Date.now(),
        type: GameEventType.NARRATIVE,
        title: "The First Day",
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
        biomes: worldElements.biomes.map(b => addId(b, 'biome')),
        structures: worldElements.structures.map(s => addId(s, 'structure')),
        creatures: worldElements.creatures.map(c => addId(c, 'creature')),
    };
    
    return genesisData;
}
