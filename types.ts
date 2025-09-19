
// types.ts

// --- Enums and Primitive Types ---

export type Gender = 'male' | 'female';
export type AgentState = 'idle' | 'walking' | 'gathering' | 'building' | 'looting';
export type Temperament = 'DOCILE' | 'NEUTRAL' | 'HOSTILE';
export enum GameEventType { NARRATIVE, AGENT, SYSTEM }
export type StructureType = 'SHELTER' | 'LANDMARK' | 'STORAGE' | 'RESEARCH';
export type ResourceNodeType = 'fallen_tree' | 'scrap_pile' | 'berry_bush' | 'electronics_scrap';
export type LootContainerType = 'ruined_car' | 'debris_pile' | 'military_crate';

// --- Core Interfaces ---

export interface PathNode {
  x: number;
  y: number;
}

export interface Agent {
  id: string;
  name: string;
  gender: Gender;
  x: number; // world grid coordinates
  y: number; // world grid coordinates
  state: AgentState;
  state_timer: number;
  destination: { x: number; y: number } | null;
  path: PathNode[] | null;
  task: any | null; // More specific task types can be defined later
  health: { current: number; max: number; };
  morale: { current: number; max: number; };
  energy: { current: number; max: number; };
}

export interface ColonyResources {
  food: number;
  wood: number;
  scrap: number;
  stability: number; // Percentage
  researchPoints: number;
}

export interface GameEvent {
  id: string;
  timestamp: number;
  type: GameEventType;
  title: string;
  description: string;
  isAiGenerated: boolean;
}

// --- World Elements ---

export interface Biome {
  id: string;
  name: string;
  description: string;
}

export interface Structure {
  id: string;
  name: string;
  description: string;
  type: StructureType;
}

export interface Creature {
  id: string;
  name: string;
  description: string;
  temperament: Temperament;
}

export interface PlacedStructure {
    id: string;
    blueprintId: string;
    x: number;
    y: number;
    buildProgress: number;
    isComplete: boolean;
}

export interface ResourceNode {
    id: string;
    type: ResourceNodeType;
    x: number;
    y: number;
    amount: number;
}

export interface LootContainer {
    id: string;
    type: LootContainerType;
    x: number;
    y: number;
    isEmpty: boolean;
}

export interface WorldData {
    width: number;
    height: number;
    tileMap: number[][];
    resourceNodes: ResourceNode[];
    lootContainers: LootContainer[];
    placedStructures: PlacedStructure[];
    biomes: Biome[];
    structures: Structure[];
    creatures: Creature[];
}

// --- Colony State ---

export interface CulturalValues {
  collectivism: number;
  pragmatism: number;
  spirituality: number;
}

export interface SimulationState {
  tick: number;
  isPaused: boolean;
  agents: Agent[];
  resources: ColonyResources;
  events: GameEvent[];
  world: WorldData;
  culturalValues: CulturalValues;
  completedResearchIds: string[];
  knownBlueprintIds: string[];
  activeResearchId: string | null;
}

// --- Game Data Definitions ---

export interface ResearchProject {
    id: string;
    name: string;
    description: string;
    cost: number;
    requiredProjectIds: string[];
    unlocksBlueprintId: string | null;
}

export interface StructureDefinition {
    id: string;
    name: string;
    description: string;
    cost: { resource: keyof Omit<ColonyResources, 'stability' | 'researchPoints'>, amount: number }[];
    type: StructureType;
}
