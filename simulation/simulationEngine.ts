// simulation/simulationEngine.ts
// Fix: Added .ts extension to resolve module import error.
import { SimulationState, Agent } from '../types.ts';

const AGENT_SPEED = 0.1; // tiles per tick

function updateAgent(agent: Agent, state: SimulationState): Agent {
  let newAgent = { ...agent };
  newAgent.state_timer -= 1;

  // State machine for agent behavior
  switch (newAgent.state) {
    case 'idle':
      if (newAgent.state_timer <= 0) {
        // Find a random destination to wander to
        const destX = newAgent.x + (Math.random() - 0.5) * 20;
        const destY = newAgent.y + (Math.random() - 0.5) * 20;
        newAgent.destination = { x: destX, y: destY };
        newAgent.state = 'moving';
      }
      break;

    case 'moving':
      if (!newAgent.destination) {
        newAgent.state = 'idle';
        newAgent.state_timer = Math.random() * 200 + 50; // idle for 5-25 seconds
        break;
      }
      
      const dx = newAgent.destination.x - newAgent.x;
      const dy = newAgent.destination.y - newAgent.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        newAgent.destination = null;
        newAgent.state = 'idle';
        newAgent.state_timer = Math.random() * 200 + 50;
      } else {
        newAgent.x += (dx / distance) * AGENT_SPEED;
        newAgent.y += (dy / distance) * AGENT_SPEED;
        
        // Clamp to world bounds
        newAgent.x = Math.max(0, Math.min(state.world.width - 1, newAgent.x));
        newAgent.y = Math.max(0, Math.min(state.world.height - 1, newAgent.y));
      }
      break;
    
    // TODO: Implement 'working' state logic (gathering, building, etc.)
    case 'working':
      // Placeholder: after some time, go back to idle.
      if (newAgent.state_timer <= 0) {
        newAgent.state = 'idle';
        newAgent.state_timer = Math.random() * 100;
      }
      break;
  }

  return newAgent;
}

/**
 * Runs one tick of the simulation.
 * @param state The current simulation state.
 * @returns The new simulation state after the tick.
 */
export function runSimulationTick(state: SimulationState): SimulationState {
  const newState = { ...state };
  newState.tick += 1;

  // Update agents
  newState.agents = newState.agents.map(agent => updateAgent(agent, newState));

  // Update resources (example: passive food consumption)
  if (newState.tick % 100 === 0) { // Every 10 seconds
    newState.resources.food -= newState.agents.length * 0.1;
    if (newState.resources.food < 0) newState.resources.food = 0;
  }
  
  // Update research points if a project is active
  const researchBench = newState.world.placedStructures.find(s => s.blueprintId === 'research_bench_1' && s.isComplete);
  if (newState.activeResearchId && researchBench) {
      newState.resources.researchPoints += 0.1; // Gain 0.1 RP per tick
  }

  return newState;
}
