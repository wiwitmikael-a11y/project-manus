import { SimulationState, Agent, GenesisData, GameEvent, AgentVitals, ColonyStats } from './types';

const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 600;
const TICK_RATE = 1000; // ms per tick
const DAY_LENGTH = 60; // ticks per day
const AI_EVENT_INTERVAL_DAYS = 3; // Request a new AI event every 3 days

let state: SimulationState = {
  agents: [],
  resources: { food: 50, wood: 20, stability: 80 },
  culturalValues: { collectivism: 50, pragmatism: 50, spirituality: 50 },
  events: [],
  day: 1,
  isPaused: true,
  biomes: [],
  structures: [],
  creatures: [],
};

let simulationInterval: number | null = null;
let tickCounter = 0;

function update() {
  if (state.isPaused) return;

  tickCounter++;
  // Daily updates
  if (tickCounter >= DAY_LENGTH) {
    tickCounter = 0;
    state.day++;
    
    // Daily food consumption
    const dailyFoodConsumption = state.agents.length * 0.5;
    state.resources.food = Math.max(0, state.resources.food - dailyFoodConsumption);

    state.agents.forEach(agent => {
        agent.hunger += 5; 
        if(agent.hunger > 80 || state.resources.food === 0) agent.mood -= 5;
    });

    // Request new AI event every few days
    if (state.day % AI_EVENT_INTERVAL_DAYS === 0) {
        self.postMessage({ 
            type: 'REQUEST_AI_EVENT', 
            payload: { 
                day: state.day, 
                resources: state.resources, 
                events: state.events.slice(-1) 
            }
        });
    }
    
    // Post daily stats update
     self.postMessage({ type: 'STATS_UPDATE', payload: {
        resources: state.resources,
        culturalValues: state.culturalValues,
        day: state.day,
     } as ColonyStats });
  }

  // Per-tick updates for agents
  state.agents.forEach(agent => {
    agent.hunger = Math.min(100, agent.hunger + 0.1);
    agent.mood = Math.max(0, agent.mood - 0.05);

    // Task-based AI
    if (agent.task === 'Foraging') {
        // Increase food, stay relatively still
        state.resources.food += 0.2; // Skill could affect this
        if (Math.random() < 0.02) {
             agent.isMoving = true;
             agent.targetX = agent.x + (Math.random() - 0.5) * 50;
             agent.targetY = agent.y + (Math.random() - 0.5) * 50;
        }
    }

    // Movement AI
    if (agent.isMoving) {
        const dx = agent.targetX - agent.x;
        const dy = agent.targetY - agent.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 2) {
            agent.isMoving = false;
        } else {
            agent.x += dx / dist;
            agent.y += dy / dist;
            if (Math.abs(dx) > Math.abs(dy)) {
                agent.direction = dx > 0 ? 'right' : 'left';
            } else {
                agent.direction = dy > 0 ? 'down' : 'up';
            }
        }
    } else if (agent.task === 'Idle') {
        // If idle, pick a new random target occasionally
        if (Math.random() < 0.01) {
            agent.isMoving = true;
            agent.targetX = Math.random() * WORLD_WIDTH;
            agent.targetY = Math.random() * WORLD_HEIGHT;
        }
    }
  });

  const agentVitals: AgentVitals[] = state.agents.map(a => ({
      id: a.id,
      x: a.x,
      y: a.y,
      direction: a.direction,
      isMoving: a.isMoving,
  }));

  self.postMessage({ type: 'AGENT_UPDATE', payload: agentVitals });
}

function startSimulation() {
  if (simulationInterval) return;
  simulationInterval = self.setInterval(update, TICK_RATE);
}

function stopSimulation() {
  if (simulationInterval) {
    self.clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

function initializeState(genesisData: GenesisData) {
    const initialAgents: Agent[] = genesisData.agents.map(a => ({
        ...a,
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        targetX: Math.random() * WORLD_WIDTH,
        targetY: Math.random() * WORLD_HEIGHT,
        isMoving: true,
        direction: 'down',
        relationships: {},
    }));

    state = {
      ...state,
      agents: initialAgents,
      events: [{
          ...genesisData.startingEvent,
          id: `event-${Date.now()}`,
          timestamp: Date.now(),
      }],
      culturalValues: genesisData.culturalValues,
      biomes: genesisData.biomes,
      structures: genesisData.structures,
      creatures: genesisData.creatures,
      isPaused: true,
    };
}

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INITIALIZE':
      initializeState(payload as GenesisData);
      self.postMessage({ type: 'INITIAL_STATE', payload: state });
      break;
    
    case 'ADD_EVENT':
        state.events.push(payload as GameEvent);
        self.postMessage({ type: 'NEW_EVENT', payload: payload as GameEvent });
        break;

    case 'TOGGLE_PAUSE':
      state.isPaused = !state.isPaused;
      if (state.isPaused) {
        stopSimulation();
      } else {
        startSimulation();
      }
      self.postMessage({ type: 'PAUSE_CHANGE', payload: state.isPaused });
      break;
  }
};
