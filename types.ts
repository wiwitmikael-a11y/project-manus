// types.ts

export type Gender = 'male' | 'female';

export interface Agent {
  id: string;
  name: string;
  gender: Gender;
  x: number;
  y: number;
  sprite: string;
  state: 'idle' | 'moving' | 'working';
  state_timer: number;
  destination: { x: number; y: number } | null;
  path: { x: number; y: number }[] | null;
  task: AgentTask | null;
}

export interface AgentTask {
  type: 'gather' | 'build' | 'research' | 'explore';
  targetId: string; // ID of resource node, structure blueprint, etc.
}

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

export interface Biome {
    id: string;
    name: string;
    description: string;
}

export type StructureType = 'SHELTER' | 'LANDMARK' | 'STORAGE' | 'RESEARCH' | 'DEFENSE';

export interface Structure {
    id: string;
    name: string;
    description: string;
    type: StructureType;
}

export type CreatureTemperament = 'DOCILE' | 'NEUTRAL' | 'HOSTILE';

export interface Creature {
    id: string;
    name: string;
    description: string;
    temperament: CreatureTemperament;
}

export type ResourceNodeType = 'fallen_tree' | 'scrap_pile';

export interface ResourceNode {
    id: string;
    type: ResourceNodeType;
    x: number;
    y: number;
    amount: number;
}

export type LootContainerType = 'ruined_car' | 'debris_pile';

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
    width: number;
    height: number;
    tileMap: number[][];
    biomes: Biome[];
    structures: Structure[];
    creatures: Creature[];
    resourceNodes: ResourceNode[];
    lootContainers: LootContainer[];
    placedStructures: PlacedStructure[];
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


// From gameConstants
export interface ResearchProject {
  id: string;
  name: string;
  description: string;
  cost: number;
  requiredProjectIds: string[];
  unlocksBlueprintId: string | null;
}

export interface ResourceCost {
  resource: keyof Omit<ColonyResources, 'stability' | 'researchPoints'>;
  amount: number;
}

export interface StructureDefinition {
  id: string;
  name: string;
  description: string;
  cost: ResourceCost[];
  type: StructureType;
}
