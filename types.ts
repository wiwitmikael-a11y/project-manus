// types.ts

export type Gender = 'male' | 'female';
export type Temperament = 'DOCILE' | 'NEUTRAL' | 'HOSTILE';
export type StructureType = 'SHELTER' | 'LANDMARK' | 'STORAGE' | 'CRAFTING' | 'RESEARCH';
export type AnimationState = 'idle' | 'walk' | 'forage' | 'build';
export type TimeOfDay = 'day' | 'night';
export type ResourceNodeType = 'fallen_tree' | 'scrap_pile';
export type LootContainerType = 'ruined_car' | 'debris_pile';

export enum GameEventType {
  NARRATIVE = 'NARRATIVE',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM',
}

export interface Agent {
  id: string;
  name: string;
  gender: Gender;
  spritesheetKey: string;
  x: number;
  y: number;
  isMoving: boolean;
  targetX: number;
  targetY: number;
  animationState: AnimationState;
  animationFrame: number;
  animationTick: number;
  direction: number; // Angle in radians
  relationships: { [agentId: string]: number };
}

export interface ColonyResources {
  food: number;
  wood: number;
  scrap: number;
  stability: number;
  researchPoints: number;
}

export interface CulturalValues {
  collectivism: number;
  pragmatism: number;
  spirituality: number;
}

export interface GameEvent {
  id: string;
  type: GameEventType;
  title: string;
  description: string;
  timestamp: number;
  isAiGenerated?: boolean;
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
    type: StructureType;
}

export interface Creature {
    id: string;
    name: string;
    description: string;
    temperament: Temperament;
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

export interface PlacedStructure {
    id: string;
    blueprintId: string;
    x: number;
    y: number;
    buildProgress: number;
    isComplete: boolean;
}

export interface WorldData {
  biomes: Biome[];
  structures: Structure[];
  creatures: Creature[];
  resourceNodes: ResourceNode[];
  lootContainers: LootContainer[];
  placedStructures: PlacedStructure[];
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
  hour: number;
  timeOfDay: TimeOfDay;
  tick: number;
  isPaused: boolean;
  knownBlueprintIds: string[];
  activeResearchId: string | null;
  completedResearchIds: string[];
}

// Mendefinisikan struktur data untuk setiap bangunan yang dapat dibangun.
export interface StructureDefinition {
    id: string;
    name: string;
    description: string;
    cost: { resource: 'wood' | 'scrap', amount: number }[];
    type: StructureType;
}

// Mendefinisikan struktur data untuk setiap proyek riset.
export interface ResearchProject {
    id: string;
    name: string;
    description: string;
    cost: number; // Research points
    requiredProjectIds: string[];
    unlocksBlueprintId: string | null; // ID dari StructureDefinition yang dibuka
}
