import { SimulationState, Agent } from '../types.ts';
import { runColonyAI } from './colonyAI.ts';

const COLONY_AI_TICK_INTERVAL = 100; // Run colony AI every 100 ticks (5 seconds)

/**
 * The main simulation tick function.
 * This is the heart of the simulation, updating the state of all agents and the world.
 * @param state The current simulation state.
 * @returns The new simulation state after one tick.
 */
export function tick(state: SimulationState): SimulationState {
    let newState = { ...state, tick: state.tick + 1 };

    // Update all agents
    newState.agents = newState.agents.map(agent => updateAgent(agent, newState));
    
    // Run high-level colony AI periodically for performance
    if (newState.tick % COLONY_AI_TICK_INTERVAL === 0) {
        newState = runColonyAI(newState);
    }
    
    // Future logic can be added here:
    // - Resource consumption (e.g., agents eating food)
    // - Environmental events
    // - Building progress updates
    
    return newState;
}

/**
 * Updates a single agent's state for one tick.
 * @param agent The agent to update.
 * @param state The current simulation state.
 * @returns The updated agent.
 */
function updateAgent(agent: Agent, state: SimulationState): Agent {
    let newAgent = { ...agent };

    // Decrement state timer
    if (newAgent.state_timer > 0) {
      newAgent.state_timer -= 1;
    }

    // Simple Finite State Machine (FSM) for agent behavior
    if (newAgent.state_timer <= 0) {
        // Simple AI: Wander around. A real implementation would use a behavior tree or goal-oriented system.
        const shouldWander = Math.random() > 0.2;
        if (shouldWander && newAgent.state === 'idle') {
            newAgent.state = 'walking';
            const destX = Math.max(0, Math.min(state.world.width - 1, newAgent.x + (Math.random() - 0.5) * 10));
            const destY = Math.max(0, Math.min(state.world.height - 1, newAgent.y + (Math.random() - 0.5) * 10));
            newAgent.destination = { x: destX, y: destY };
            newAgent.state_timer = 1000; // Give it plenty of time to get there
        } else {
            newAgent.state = 'idle';
            newAgent.destination = null;
            newAgent.state_timer = Math.random() * 200 + 50; // idle for 2.5-12.5 seconds
        }
    }

    // Movement logic for walking agents
    if (newAgent.state === 'walking' && newAgent.destination) {
        const dx = newAgent.destination.x - newAgent.x;
        const dy = newAgent.destination.y - newAgent.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.1) {
            // Arrived at destination
            newAgent.state = 'idle';
            newAgent.destination = null;
            newAgent.state_timer = Math.random() * 100 + 50;
        } else {
            // Move towards destination
            const moveSpeed = 0.05; // tiles per tick
            newAgent.x += (dx / dist) * moveSpeed;
            newAgent.y += (dy / dist) * moveSpeed;
        }
    }
    
    return newAgent;
}
