// simulation.worker.ts

// Since this is a worker, we can't use TS module imports directly.
// The types are for documentation and structural compatibility.
// Copied from types.ts for use within the worker.
const GameEventType = {
  NARRATIVE: 'NARRATIVE',
  AGENT: 'AGENT',
  SYSTEM: 'SYSTEM',
};


/**
 * @typedef {import('./types').SimulationState} SimulationState
 * @typedef {import('./types').Agent} Agent
 * @typedef {import('./types').GenesisData} GenesisData
 * @typedef {import('./types').GameEvent} GameEvent
 */

/** @type {SimulationState | null} */
let state = null;
let gameLoop = null;
const TICK_RATE = 100; // ms per tick, 10 ticks per second
const WORLD_BOUNDS = { width: 1000, height: 1000 };

/** @param {GenesisData} genesisData */
function initialize(genesisData) {
    const initialAgents = genesisData.agentPersonalities.map((p, index) => ({
        id: self.crypto.randomUUID(),
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
            foraging: Math.floor(Math.random() * 10) + 1,
            woodcutting: Math.floor(Math.random() * 10) + 1,
            crafting: Math.floor(Math.random() * 10) + 1,
        },
        relationships: {},
        x: 450 + index * 50, // Start near center
        y: 500,
        targetX: 450 + index * 50,
        targetY: 500,
        isMoving: false,
        direction: 'down',
    }));

    state = {
        agents: initialAgents,
        resources: {
            food: genesisData.initialResources.food,
            wood: genesisData.initialResources.wood,
            stability: 100,
        },
        culturalValues: genesisData.culturalValues,
        events: [
            {
                id: self.crypto.randomUUID(),
                type: GameEventType.NARRATIVE,
                title: genesisData.startingEvent.title,
                description: genesisData.startingEvent.description,
                timestamp: Date.now(),
                isAiGenerated: true,
            }
        ],
        day: 1,
        isPaused: true,
    };
    
    postStateUpdate();
}

function postStateUpdate() {
    if (state) {
        // postMessage natively uses the structured clone algorithm.
        postMessage({ type: 'STATE_UPDATE', payload: state });
    }
}

/** @param {Agent} agent */
function updateAgentPosition(agent) {
    if (!agent.isMoving) {
        // Simple random movement for now
        if (Math.random() < 0.01) { // 1% chance to start moving each tick
            agent.isMoving = true;
            agent.targetX = agent.x + (Math.random() - 0.5) * 100;
            agent.targetY = agent.y + (Math.random() - 0.5) * 100;

            // Clamp to world bounds
            agent.targetX = Math.max(0, Math.min(WORLD_BOUNDS.width, agent.targetX));
            agent.targetY = Math.max(0, Math.min(WORLD_BOUNDS.height, agent.targetY));
        }
        return;
    }
    
    const speed = 1; // pixels per tick
    const dx = agent.targetX - agent.x;
    const dy = agent.targetY - agent.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < speed) {
        agent.x = agent.targetX;
        agent.y = agent.targetY;
        agent.isMoving = false;
        agent.task = 'Idle'; // Reset task when destination is reached
    } else {
        agent.x += (dx / distance) * speed;
        agent.y += (dy / distance) * speed;
        
        // Update direction
        if (Math.abs(dx) > Math.abs(dy)) {
            agent.direction = dx > 0 ? 'right' : 'left';
        } else {
            agent.direction = dy > 0 ? 'down' : 'up';
        }
    }
}


/** @param {Agent} agent */
function updateAgent(agent) {
    // Update needs
    agent.hunger += 0.05; // Hunger increases over time
    if (agent.hunger > 100) agent.hunger = 100;

    // Basic AI: if hungry, find food
    if (agent.hunger > 70 && state && state.resources.food > 0) {
        state.resources.food -= 1;
        agent.hunger = 0;
        agent.mood = Math.min(100, agent.mood + 10);
    }
    
    // Decrease mood if hungry
    if (agent.hunger > 80) {
        agent.mood -= 0.1;
    }
    if (agent.mood < 0) agent.mood = 0;

    // Update position
    updateAgentPosition(agent);
}


function gameTick() {
    if (!state || state.isPaused) return;

    state.agents.forEach(updateAgent);
    
    // Other global updates can go here

    postStateUpdate();
}

function togglePause() {
    if (state) {
        state.isPaused = !state.isPaused;
        postStateUpdate();
    }
}

self.onmessage = (e) => {
    const { type, payload } = e.data;
    switch (type) {
        case 'INITIALIZE_SIMULATION':
            initialize(payload);
            break;
        case 'TOGGLE_PAUSE':
            togglePause();
            break;
    }
};

// Start the game loop
gameLoop = self.setInterval(gameTick, TICK_RATE);
