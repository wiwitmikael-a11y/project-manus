// simulation/colonyAI.ts
import { SimulationState } from "../types.ts";
import { RESEARCH_TREE, STRUCTURE_DEFINITION_DB } from "../gameConstants.ts";

/**
 * High-level AI that makes decisions for the colony.
 * This runs less frequently than the main simulation tick.
 * @param state The current simulation state.
 * @returns The updated simulation state with new goals or decisions.
 */
export function runColonyAI(state: SimulationState): SimulationState {
    let newState = { ...state };

    // --- Research AI ---
    // If research is active, check for completion
    const currentProject = RESEARCH_TREE.find(p => p.id === newState.activeResearchId);
    if (currentProject && newState.resources.researchPoints >= currentProject.cost) {
        newState.completedResearchIds.push(currentProject.id);
        
        // Check if this research unlocks a new blueprint and add it to known blueprints
        if (currentProject.unlocksBlueprintId && !newState.knownBlueprintIds.includes(currentProject.unlocksBlueprintId)) {
            newState.knownBlueprintIds.push(currentProject.unlocksBlueprintId);
        }
        
        newState.activeResearchId = null;
        newState.resources.researchPoints = 0; // Reset for the next project
    }
    
    // If no research is active, pick a new one.
    if (!newState.activeResearchId) {
        const researchBenchExists = newState.world.placedStructures.some(s => s.blueprintId === 'research_bench_1' && s.isComplete);
        
        if (researchBenchExists) {
            // Find the first available research project that hasn't been completed
            const nextProject = RESEARCH_TREE.find(p => 
                !newState.completedResearchIds.includes(p.id) &&
                p.requiredProjectIds.every(reqId => newState.completedResearchIds.includes(reqId))
            );

            if (nextProject) {
                newState.activeResearchId = nextProject.id;
            }
        }
    }


    // --- Building AI (placeholder) ---
    // e.g., If no research bench, and we know the blueprint, and have resources, queue one up.
    const hasResearchBench = newState.world.placedStructures.some(s => s.blueprintId === 'research_bench_1');
    if (!hasResearchBench && newState.knownBlueprintIds.includes('research_bench_1')) {
        const blueprint = STRUCTURE_DEFINITION_DB['research_bench_1'];
        const canAfford = blueprint.cost.every(c => newState.resources[c.resource] >= c.amount);

        if (canAfford) {
            // In a real implementation, this would create a build task for an agent.
            // For now, we'll just log it.
            console.log("Colony AI wants to build a Research Bench.");
        }
    }

    return newState;
}