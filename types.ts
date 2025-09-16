// Fix: Replace TypeScript enum with a const object for JavaScript compatibility in the worker.
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

export interface Agent {
  id: string;
  name: string;
  task: string;
  mood: number;
  hunger: number;
  personality: Personality;
  skills: Skills;
  relationships: Record<string, number>; // Affinity score with other agents by ID
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isMoving: boolean;
  direction: 'down' | 'up' | 'left' | 'right';
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

export interface SimulationState {
  agents: Agent[];
  resources: ColonyResources;
  culturalValues: CulturalValues;
  events: GameEvent[];
  day: number;
  isPaused: boolean;
}