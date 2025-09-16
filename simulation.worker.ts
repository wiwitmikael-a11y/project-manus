// Fix: Implement the simulation logic within the web worker.
import { Agent, GameEvent, GameEventType, SimulationState } from './types';
import { GenesisData } from './services/geminiService';

let state: SimulationState | null = null;
let gameLoop: ReturnType<typeof setInterval> | null = null;

const SIMULATION_SPEED = 2000; // ms per tick (not day anymore)
let tickCount = 0;
const TICKS_PER_DAY = 12;

function initialize(genesisData: GenesisData) {
    const agentList = genesisData.agentPersonalities.map((p, i) => ({
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
        relationships: {},
        x: Math.random() * 400 + 50,
        y: Math.random() * 200 + 50,
        targetX: Math.random() * 400 + 50,
        targetY: Math.random() * 200 + 50,
    }));

    // Initialize relationships
    for (const agent of agentList) {
        for (const other of agentList) {
            if (agent.id !== other.id) {
                agent.relationships[other.id] = 50; // Start with neutral affinity
            }
        }
    }

    const genesisEvent: GameEvent = {
        id: `event-${Date.now()}`,
        type: GameEventType.NARRATIVE,
        title: genesisData.startingEvent.title,
        description: genesisData.startingEvent.description,
        timestamp: Date.now(),
        isAiGenerated: true,
    };

    state = {
        agents: agentList,
        resources: {
            ...genesisData.initialResources,
            stability: 75,
        },
        culturalValues: genesisData.culturalValues,
        events: [genesisEvent],
        day: 1,
        isPaused: true,
    };
    
    postMessage({ type: 'STATE_UPDATE', payload: state });
}

function tick() {
    if (!state || state.isPaused) return;

    tickCount++;
    if (tickCount >= TICKS_PER_DAY) {
        state.day += 1;
        tickCount = 0;
    }

    state.agents.forEach(agent => {
        // --- Utility-based Decision Making ---
        const actions = [
            // Eat if very hungry
            { name: 'Eating', utility: agent.hunger > 60 && state.resources.food > 0 ? 0.9 : 0 },
            // Forage if food is low
            { name: 'Foraging', utility: state.resources.food < 20 ? 0.7 : 0.3 },
            // Interact if social and not too busy
            { name: 'Interacting', utility: (agent.personality.social / 100) * 0.5 * (1 - agent.hunger / 100) },
             // Woodcut as a default action
            { name: 'Woodcutting', utility: 0.2 },
        ];

        const bestAction = actions.reduce((a, b) => a.utility > b.utility ? a : b);
        agent.task = bestAction.name;
        
        // --- Action Execution ---
        switch(agent.task) {
            case 'Eating':
                state.resources.food -= 1;
                agent.hunger = Math.max(0, agent.hunger - 40);
                agent.mood = Math.min(100, agent.mood + 5);
                break;
            case 'Foraging':
                 state.resources.food += 1 + agent.skills.foraging * 0.1;
                 break;
            case 'Woodcutting':
                state.resources.wood += 0.5 + agent.skills.woodcutting * 0.1;
                break;
            case 'Interacting':
                const otherAgent = state.agents.find(a => a.id !== agent.id && a.task !== 'Interacting');
                if (otherAgent) {
                    agent.targetX = otherAgent.x;
                    agent.targetY = otherAgent.y;
                    
                    const dist = Math.sqrt(Math.pow(agent.x - otherAgent.x, 2) + Math.pow(agent.y - otherAgent.y, 2));
                    if (dist < 30) { // If they are close enough
                        const personalityDiff = Math.abs(agent.personality.pragmatism - otherAgent.personality.pragmatism) + Math.abs(agent.personality.social - otherAgent.personality.social);
                        const affinityChange = personalityDiff < 50 ? 2 : -1; // Simple compatibility check

                        agent.relationships[otherAgent.id] += affinityChange;
                        otherAgent.relationships[agent.id] += affinityChange;

                        agent.relationships[otherAgent.id] = Math.max(0, Math.min(100, agent.relationships[otherAgent.id]));
                        otherAgent.relationships[agent.id] = Math.max(0, Math.min(100, otherAgent.relationships[agent.id]));

                        const event: GameEvent = {
                            id: `event-${Date.now()}-${agent.id}`,
                            type: GameEventType.AGENT,
                            title: 'Social Interaction',
                            description: `${agent.name} and ${otherAgent.name} ${affinityChange > 0 ? 'had a pleasant chat.' : 'had a tense exchange.'} Their relationship changed.`,
                            timestamp: Date.now()
                        };
                        state.events.push(event);
                        agent.task = 'Idle'; // Stop interacting after one successful interaction
                    }
                }
                break;
        }


        // Basic needs update
        agent.hunger += 1;
        if (agent.hunger > 70) agent.mood -= 2;
        else if (agent.hunger < 20) agent.mood += 0.5;
        agent.mood = Math.max(0, Math.min(100, agent.mood));

        // Random movement for non-interacting agents
        if (agent.task !== 'Interacting' && Math.random() > 0.95) {
             agent.targetX = Math.random() * 400 + 50;
             agent.targetY = Math.random() * 200 + 50;
        }
    });

    state.resources.stability -= 0.1;
    state.resources.stability = Math.max(0, Math.min(100, state.resources.stability));
    
    postMessage({ type: 'STATE_UPDATE', payload: { ...state } });
}

function startSimulation() {
    if (!gameLoop) {
        gameLoop = setInterval(tick, SIMULATION_SPEED / 4); // Tick faster for smoother animation
    }
}

function stopSimulation() {
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
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
                postMessage({ type: 'STATE_UPDATE', payload: { ...state } });
            }
            break;
    }
};

export {};