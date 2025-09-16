// simulation/simulationEngine.ts

// FIX: Import Agent type to correctly type agent objects within the simulation engine.
import { SimulationState, TimeOfDay, Agent } from '../types.ts';

const TICKS_PER_HOUR = 60; // e.g., 60 ticks is one game hour
const HOURS_PER_DAY = 24;

/**
 * Updates the game clock.
 * @param state The current simulation state.
 * @returns The updated simulation state.
 */
function updateTime(state: SimulationState): SimulationState {
    const newState = { ...state };
    newState.tick = (newState.tick + 1) % TICKS_PER_HOUR;

    if (newState.tick === 0) {
        newState.hour = (newState.hour + 1);
        if (newState.hour >= HOURS_PER_DAY) {
            newState.hour = 0;
            newState.day += 1;
        }
    }
    
    // Determine Time of Day
    if (newState.hour >= 6 && newState.hour < 20) {
        newState.timeOfDay = 'day';
    } else {
        newState.timeOfDay = 'night';
    }

    return newState;
}

/**
 * Updates the position of all agents.
 * @param state The current simulation state.
 * @returns The updated simulation state.
 */
function updateAgentMovement(state: SimulationState): SimulationState {
    const AGENT_SPEED = 0.05; // tiles per tick

    // FIX: Add a return type annotation to the map callback to ensure returned objects conform to the Agent type.
    const newAgents = state.agents.map((agent): Agent => {
        if (!agent.isMoving) {
            // Simple random walk for now when idle
            if (Math.random() < 0.01) { // 1% chance to start moving
                 return {
                    ...agent,
                    isMoving: true,
                    targetX: agent.x + (Math.random() - 0.5) * 5,
                    targetY: agent.y + (Math.random() - 0.5) * 5,
                    animationState: 'walk',
                 };
            }
            return agent;
        }

        const dx = agent.targetX - agent.x;
        const dy = agent.targetY - agent.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < AGENT_SPEED) {
            return { ...agent, x: agent.targetX, y: agent.targetY, isMoving: false, animationState: 'idle' };
        }

        const newX = agent.x + (dx / distance) * AGENT_SPEED;
        const newY = agent.y + (dy / distance) * AGENT_SPEED;
        const newDirection = Math.atan2(dy, dx);

        return { ...agent, x: newX, y: newY, direction: newDirection };
    });

    return { ...state, agents: newAgents };
}

/**
 * Runs a single tick of the simulation.
 * @param state The current simulation state.
 * @returns The new simulation state after one tick.
 */
export function runSimulationTick(state: SimulationState): SimulationState {
    if (state.isPaused) {
        return state;
    }

    let newState = { ...state };
    newState = updateTime(newState);
    newState = updateAgentMovement(newState);
    // Other systems like resource consumption, agent needs, etc. would go here.

    return newState;
}