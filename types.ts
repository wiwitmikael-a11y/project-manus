// types.ts

export enum GameEventType {
  NARRATIVE = 'NARRATIVE',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM',
}

export interface GameEvent {
  id: string;
  timestamp: number;
  type: GameEventType;
  title: string;
  description: string;
  isAiGenerated?: boolean;
}

export type AgentDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface AgentAppearance {
  spritesheet: string;
}

export interface Agent {
  id: string;
  name: string;
  gender: 'male' | 'female';
  task: 'Idle' | 'Scavenging' | 'Harvesting' | 'Moving to Target';
  mood: number;
  hunger: number;
  personality: {
    creativity: number;
    pragmatism: number;
    social: number;
  };
  skills: {
    foraging: number;
    woodcutting: number;
    crafting: number;
  };
  relationships: Record<string, number>;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetNodeId?: string; // ID dari resource node yang dituju
  isMoving: boolean;
  appearance: AgentAppearance;
  direction: AgentDirection;
  animationState: 'idle' | 'walk';
  animationFrame: number;
  animationTick: number;
}

export interface ColonyResources {
  food: number;
  wood: number;
  scrap: number; // Menambahkan resource baru
  stability: number;
}

export interface CulturalValues {
  collectivism: number;
  pragmatism: number;
  spirituality: number;
}

export interface Biome {
  id: string;
  name: string;
  description: string;
}

export interface Structure {
  id: string;
  name: string;
  description: string;
  type: 'SHELTER' | 'LANDMARK' | 'STORAGE';
}

export interface Creature {
  id: string;
  name: string;
  description: string;
  temperament: 'DOCILE' | 'NEUTRAL' | 'HOSTILE';
}

// Fitur Baru: Node Sumber Daya Fisik di Peta
export type ResourceNodeType = 'fallen_tree' | 'scrap_pile';
export interface ResourceNode {
  id: string;
  type: ResourceNodeType;
  x: number;
  y: number;
  amount: number;
}

export interface WorldData {
  biomes: Biome[];
  structures: Structure[];
  creatures: Creature[];
  resourceNodes: ResourceNode[]; // Menyimpan semua node sumber daya
  width: number;
  height: number;
  tileMap: number[][] | null;
}

export interface SimulationState {
  agents: Agent[];
  resources: ColonyResources;
  culturalValues: CulturalValues;
  events: GameEvent[];
  world: WorldData;
  day: number;
  hour: number; // Fitur Baru: Waktu dalam jam (0-23)
  timeOfDay: 'day' | 'night'; // Fitur Baru: Status siang/malam
  tick: number;
  isPaused: boolean;
}

export interface GenesisData {
  agents: Agent[];
  startingEvent: GameEvent;
  culturalValues: CulturalValues;
  biomes: Biome[];
  structures: Structure[];
  creatures: Creature[];
}
