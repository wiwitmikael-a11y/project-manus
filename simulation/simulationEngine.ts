
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

    // --- Pembaruan Statistik Agen ---
    // Energi terkuras lebih cepat saat tidak diam
    const energyDepletionRate = newAgent.state === 'idle' ? 0.005 : 0.02;
    newAgent.energy.current = Math.max(0, newAgent.energy.current - energyDepletionRate);

    // Simple Finite State Machine (FSM) untuk perilaku agen
    if (newAgent.state_timer <= 0) {
        // Jika energi rendah, coba untuk istirahat (menjadi diam)
        if (newAgent.energy.current < 20) {
             newAgent.state = 'idle';
             newAgent.destination = null;
             newAgent.state_timer = 300; // Istirahat selama 15 detik
        } else {
            const shouldWander = Math.random() > 0.2;
            if (shouldWander && newAgent.state === 'idle') {
                newAgent.state = 'walking';
                const destX = Math.max(0, Math.min(state.world.width - 1, newAgent.x + (Math.random() - 0.5) * 10));
                const destY = Math.max(0, Math.min(state.world.height - 1, newAgent.y + (Math.random() - 0.5) * 10));
                newAgent.destination = { x: destX, y: destY };
                newAgent.state_timer = 1000; // Beri banyak waktu untuk sampai
            } else {
                newAgent.state = 'idle';
                newAgent.destination = null;
                newAgent.state_timer = Math.random() * 200 + 50; // diam selama 2.5-12.5 detik
            }
        }
    }
    
    // Jika diam, perlahan pulihkan energi
    if (newAgent.state === 'idle') {
        newAgent.energy.current = Math.min(newAgent.energy.max, newAgent.energy.current + 0.05);
    }

    // Logika pergerakan untuk agen yang berjalan
    if (newAgent.state === 'walking' && newAgent.destination) {
        const dx = newAgent.destination.x - newAgent.x;
        const dy = newAgent.destination.y - newAgent.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.1) {
            // Tiba di tujuan
            newAgent.state = 'idle';
            newAgent.destination = null;
            newAgent.state_timer = Math.random() * 100 + 50;
        } else {
            // Bergerak menuju tujuan
            const moveSpeed = 0.05; // petak per tick
            newAgent.x += (dx / dist) * moveSpeed;
            newAgent.y += (dy / dist) * moveSpeed;
        }
    }
    
    return newAgent;
}
