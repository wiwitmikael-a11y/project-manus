
// simulation/simulationEngine.ts
// Fix: Added .ts extension to resolve module import error.
import { SimulationState, Agent } from '../types.ts';
// Fix: Added .ts extension to resolve module import error.
import { spritesheetMapping } from '../assets/assetMapping.ts';

const AGENT_SPEED = 0.05; // Tiles per tick
const TICKS_PER_HOUR = 600; // 10 ticks/sec * 60 seconds = 600 ticks. 1 minute real-time = 1 hour game-time.

function updateAgent(agent: Agent, state: SimulationState): Agent {
  let newAgent = { ...agent };

  // --- Animation ---
  newAgent.animationTick = (newAgent.animationTick + 1);
  
  const animData = spritesheetMapping[newAgent.spritesheetKey].animations[newAgent.animationState];
  if (animData && newAgent.animationTick >= animData.speed) {
    newAgent.animationTick = 0;
    newAgent.animationFrame = (newAgent.animationFrame + 1) % animData.frames;
  }

  // --- Movement ---
  if (newAgent.isMoving) {
    const dx = newAgent.targetX - newAgent.x;
    const dy = newAgent.targetY - newAgent.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < AGENT_SPEED) {
      newAgent.x = newAgent.targetX;
      newAgent.y = newAgent.targetY;
      newAgent.isMoving = false;
      newAgent.animationState = 'idle';
      newAgent.animationFrame = 0;
      newAgent.animationTick = 0;
    } else {
      const angle = Math.atan2(dy, dx);
      newAgent.x += Math.cos(angle) * AGENT_SPEED;
      newAgent.y += Math.sin(angle) * AGENT_SPEED;
      newAgent.direction = angle;
      newAgent.animationState = 'walk';
    }
  } else {
    // --- Simple AI: Wander around ---
    if (Math.random() < 0.005) { // Low chance each tick to start wandering
      newAgent.isMoving = true;
      const wanderDistance = Math.random() * 5 + 2;
      const wanderAngle = Math.random() * Math.PI * 2;
      newAgent.targetX = Math.max(0, Math.min(state.world.width, newAgent.x + Math.cos(wanderAngle) * wanderDistance));
      newAgent.targetY = Math.max(0, Math.min(state.world.height, newAgent.y + Math.sin(wanderAngle) * wanderDistance));
    }
  }

  return newAgent;
}

function updateTime(state: SimulationState): SimulationState {
    const newState = { ...state };
    newState.tick += 1;

    if (newState.tick >= TICKS_PER_HOUR) {
        newState.tick = 0;
        newState.hour += 1;
        
        // --- Resource Consumption (per hour) ---
        const foodConsumption = newState.agents.length * 0.1;
        newState.resources = {
            ...newState.resources,
            food: Math.max(0, newState.resources.food - foodConsumption)
        };
    }
    
    if (newState.hour >= 24) {
        newState.hour = 0;
        newState.day += 1;
    }

    if (newState.hour >= 20 || newState.hour < 6) {
        newState.timeOfDay = 'night';
    } else {
        newState.timeOfDay = 'day';
    }

    return newState;
}


export function runSimulationTick(state: SimulationState): SimulationState {
  if (state.isPaused) {
    return state;
  }

  // Deep copy agents array for modification
  const updatedAgents = state.agents.map(agent => updateAgent(agent, state));
  
  let newState: SimulationState = {
    ...state,
    agents: updatedAgents,
  };

  newState = updateTime(newState);
  
  return newState;
}
