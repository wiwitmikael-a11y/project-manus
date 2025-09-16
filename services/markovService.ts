// services/markovService.ts
import { Agent, CulturalValues, GameEvent, GameEventType, Gender } from '../types.ts';
import { generateWorldElements, GeneratedWorldElements } from './geminiService.ts';

const MALE_NAMES = ["Arion", "Bran", "Cael", "Darian", "Eron"];
const FEMALE_NAMES = ["Lyra", "Seraphina", "Elara", "Rhea", "Gwen"];

function generateRandomAgent(id: string, name: string, gender: Gender): Agent {
  return {
    id,
    name,
    gender,
    spritesheetKey: gender === 'male' ? 'colonist_male_1' : 'colonist_female_1',
    x: Math.random() * 5 + 22.5, // Spawn near center
    y: Math.random() * 5 + 22.5,
    isMoving: false,
    targetX: 0,
    targetY: 0,
    animationState: 'idle',
    animationFrame: 0,
    animationTick: 0,
    direction: Math.random() * Math.PI * 2,
    relationships: {},
  };
}

export interface GenesisData extends GeneratedWorldElements {
    agents: Agent[];
    culturalValues: CulturalValues;
    startingEvent: GameEvent;
}

export async function generateGenesis(): Promise<GenesisData> {
    // Generate world elements (biomes, structures, creatures) using Gemini
    const worldElements = await generateWorldElements();

    // Procedurally generate starting agents
    const agents: Agent[] = [];
    const numAgents = 3;
    const usedNames = new Set<string>();

    for (let i = 0; i < numAgents; i++) {
        const gender: Gender = Math.random() > 0.5 ? 'male' : 'female';
        const namePool = gender === 'male' ? MALE_NAMES : FEMALE_NAMES;
        let name;
        do {
            name = namePool[Math.floor(Math.random() * namePool.length)];
        } while (usedNames.has(name));
        usedNames.add(name);
        
        agents.push(generateRandomAgent(`agent_${i}`, name, gender));
    }

    // Initialize relationships
    for (const agent of agents) {
        for (const otherAgent of agents) {
            if (agent.id !== otherAgent.id) {
                agent.relationships[otherAgent.id] = Math.random() * 40 + 30; // Neutral starting relationships
            }
        }
    }

    // Generate starting cultural values
    const culturalValues: CulturalValues = {
        collectivism: Math.random() * 30 + 35, // 35-65
        pragmatism: Math.random() * 40 + 40, // 40-80
        spirituality: Math.random() * 20 + 10, // 10-30
    };

    // Create the first narrative event
    const startingEvent: GameEvent = {
        id: `event-${Date.now()}`,
        type: GameEventType.NARRATIVE,
        title: "The Awakening",
        description: `A small group of survivors, drawn together by fate, find themselves in the shadow of a forgotten ruin. Their journey begins now.`,
        timestamp: Date.now(),
        isAiGenerated: true,
    };

    return {
        ...worldElements,
        agents,
        culturalValues,
        startingEvent,
    };
}
