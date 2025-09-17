// services/geminiService.ts - Simplified version
import { Biome, Creature, Structure } from '../types.ts';

export interface GeneratedWorldElements {
    biomes: Omit<Biome, 'id'>[];
    structures: Omit<Structure, 'id'>[];
    creatures: Omit<Creature, 'id'>[];
}

// Simplified service without heavy AI dependency for faster loading
export async function generateWorldElements(): Promise<GeneratedWorldElements> {
  // Return immediate fallback data for faster startup
  return {
    biomes: [
      { name: "Rusted Scrapyard", description: "A field of decaying pre-Fall vehicles and machinery." },
      { name: "Overgrown Plaza", description: "Nature reclaims what was once a bustling city center." }
    ],
    structures: [
      { name: "Makeshift Shack", description: "A crude shelter made from corrugated metal and scavenged planks.", type: 'SHELTER' },
      { name: "Collapsed Overpass", description: "The remains of a highway bridge, now a landmark and shelter.", type: 'LANDMARK' }
    ],
    creatures: [
      { name: "Giant Rad-Roach", description: "A disturbingly large and resilient insect that fears light.", temperament: 'NEUTRAL' },
      { name: "Scavenger Rat", description: "Mutated rodents that have grown bold and clever.", temperament: 'DOCILE' },
      { name: "Feral Dog", description: "Once domesticated, now wild and unpredictable.", temperament: 'HOSTILE' }
    ]
  };
}