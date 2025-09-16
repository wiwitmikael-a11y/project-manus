// Fix: Implement the simulation logic within the web worker.
import { Agent, GameEvent, GameEventType, SimulationState } from './types';
import { GenesisData } from './services/geminiService';

let state: SimulationState | null = null;
let simulationInterval: number | null = null;

const SIMULATION_SPEED = 2000; // ms per day

function initialize(genesisData: GenesisData) {
    const agents: Agent[] = genesisData.agentPersonalities.map((p, i) => ({
        id: `agent-${i}`,
        name: p.name,
        task: 'Idle',
        mood: 70,
        hunger: 0,
        personality: {
            creativity: p.creativity,
            pragmatism: p.pragmatism,
            social: p.social,
        },
        skills: {
            foraging: Math.floor(Math.random() * 5) + 1,
            woodcutting: Math.floor(Math.random() * 5) + 1,
            crafting: Math.floor(Math.random() * 5) + 1,
        },
        x: Math.random() * 400 + 50,
        y: Math.random() * 200 + 50,
        targetX: Math.random() * 400 + 50,
        targetY: Math.random() * 200 + 50,
    }));

    const genesisEvent: GameEvent = {
        id: `event-${Date.now()}`,
        type: GameEventType.NARRATIVE,
        title: genesisData.startingEvent.title,
        description: genesisData.startingEvent.description,
        timestamp: Date.now(),
        isAiGenerated: true,
    };

    state = {
        agents,
        resources: {
            ...genesisData.initialResources,
            stability: 75,
        },
        culturalValues: genesisData.culturalValues,
        events: [genesisEvent],
        day: 1,
        isPaused: true,
    };
    
    // Post initial state
    postMessage({ type: 'STATE_UPDATE', payload: state });
}

function tick() {
    if (!state || state.isPaused) return;

    // Update Day
    state.day += 1;

    // Update Agents
    state.agents.forEach(agent => {
        // Basic needs
        agent.hunger += 5;
        if (agent.hunger > 70) {
            agent.mood -= 10;
        } else if (agent.hunger < 20) {
            agent.mood += 2;
        }
        agent.mood = Math.max(0, Math.min(100, agent.mood));

        // Task assignment
        if (agent.hunger > 60 && state.resources.food > 0) {
            agent.task = 'Eating';
            state.resources.food -= 1;
            agent.hunger -= 30;
        } else if (state.resources.food < 20) {
            agent.task = 'Foraging';
            state.resources.food += 2 + agent.skills.foraging * 0.1;
        } else {
            agent.task = 'Woodcutting';
            state.resources.wood += 1 + agent.skills.woodcutting * 0.1;
        }

        // Move agents around for visualization
        if (Math.random() > 0.8) {
             agent.targetX = Math.random() * 400 + 50;
             agent.targetY = Math.random() * 200 + 50;
        }
    });

    // Update resources and stability (simple decay)
    state.resources.stability -= 0.2;
    state.resources.stability = Math.max(0, Math.min(100, state.resources.stability));
    
    postMessage({ type: 'STATE_UPDATE', payload: { ...state } });
}

function startSimulation() {
    if (!simulationInterval) {
        simulationInterval = setInterval(tick, SIMULATION_SPEED);
    }
}

function stopSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
}

onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;
    switch (type) {
        case 'INITIALIZE_SIMULATION':
            initialize(payload as GenesisData);
            break;
        case 'TOGGLE_PAUSE':
            if (state) {
                state.isPaused = !state.isPaused;
                if (state.isPaused) {
                    stopSimulation();
                } else {
                    startSimulation();
                }
                 // Send state update to reflect paused status immediately
                postMessage({ type: 'STATE_UPDATE', payload: { ...state } });
            }
            break;
    }
};

// This is required to make this file a module.
export {};
