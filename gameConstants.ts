// gameConstants.ts
import { StructureDefinition, ResearchProject, StructureType } from './types.ts';

// Research Projects
export const RESEARCH_TREE: ResearchProject[] = [
  {
    id: 'basic_shelter',
    name: 'Basic Shelter Construction',
    description: 'Understand the fundamentals of creating simple, effective shelters from debris.',
    cost: 50, // Research points
    requiredProjectIds: [],
    unlocksBlueprintId: 'storage_1', // Unlocks the ability to build storage
  },
  {
    id: 'communal_thinking',
    name: 'Communal Thinking',
    description: 'Develop a dedicated space for collaborative problem-solving and innovation.',
    cost: 100,
    requiredProjectIds: ['basic_shelter'],
    unlocksBlueprintId: 'research_bench_1',
  },
  {
    id: 'food_preservation',
    name: 'Food Preservation',
    description: 'Discover methods to smoke and salt food, reducing spoilage and creating a stable food supply.',
    cost: 75,
    requiredProjectIds: ['basic_shelter'],
    unlocksBlueprintId: null, // This might unlock a different type of structure or item later
  },
];

// Building Definitions (previously Blueprints)
export const STRUCTURE_DEFINITION_DB: Record<string, StructureDefinition> = {
    'shelter_1': {
        id: 'shelter_1',
        name: 'Makeshift Lean-To',
        description: 'A simple shelter made from scavenged wood and scrap. Provides minimal protection from the elements.',
        cost: [{ resource: 'wood', amount: 10 }, { resource: 'scrap', amount: 5 }],
        type: 'SHELTER'
    },
    'storage_1': {
        id: 'storage_1',
        name: 'Scrap Crate',
        description: 'A crude wooden crate for storing excess resources.',
        cost: [{ resource: 'wood', amount: 8 }],
        type: 'STORAGE'
    },
    'research_bench_1': {
        id: 'research_bench_1',
        name: 'Research Bench',
        description: 'A dedicated workspace for tinkering and discovery, enabling colony research.',
        cost: [{ resource: 'wood', amount: 15 }, { resource: 'scrap', amount: 15 }],
        type: 'RESEARCH'
    },
};
