// types.ts

export const GameEventType = {
  NARRATIVE: 'NARRATIVE',
  AGENT: 'AGENT',
  SYSTEM: 'SYSTEM',
} as const;
export type GameEventType = typeof GameEventType[keyof typeof GameEventType];

export interface GameEvent {
  id: string;
  type: GameEventType;
  title: string;
  description: string;
  timestamp: number;
  isAiGenerated?: boolean;
}

export interface Personality {
  creativity: number;
  pragmatism: number;
  social: number;
}

export interface Skills {
  foraging: number;
  woodcutting: number;
  crafting: number;
}

export type AgentDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

/**
 * Mendefinisikan komposisi visual seorang agen.
 * Untuk sistem full-body, ini hanya menunjuk ke spritesheet yang digunakan.
 */
export interface AgentAppearance {
  spritesheet: string; // Kunci untuk spritesheet di assetMapping
}

export interface Agent {
  id: string;
  name: string;
  gender: 'male' | 'female';
  task: string;
  mood: number;
  hunger: number;
  personality: Personality;
  skills: Skills;
  relationships: Record<string, number>;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isMoving: boolean;
  appearance: AgentAppearance;
  direction: AgentDirection;
  animationState: 'idle' | 'walk';
  animationFrame: number;
  animationTick: number; // Counter untuk mengontrol kecepatan animasi
}

export interface ColonyResources {
  food: number;
  wood: number;
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

export interface WorldData {
  biomes: Biome[];
  structures: Structure[];
  creatures: Creature[];
  width: number;
  height: number;
}

// Single source of truth for the entire simulation
export interface SimulationState {
  agents: Agent[];
  resources: ColonyResources;
  culturalValues: CulturalValues;
  events: GameEvent[];
  world: WorldData;
  day: number;
  tick: number; // Ticks within the current day
  isPaused: boolean;
}

// The data structure returned by the AI for world genesis
export interface GenesisData {
  agents: Agent[];
  startingEvent: GameEvent;
  culturalValues: CulturalValues;
  biomes: Biome[];
  structures: Structure[];
  creatures: Creature[];
}
