/// <reference lib="webworker" />

// --- TYPE DEFINITIONS (from types.ts) ---
// Duplicated here because as a Blob worker, it can't import modules.
// In a real build system, this would be bundled.

const GameEventType = {
  NARRATIVE: 'NARRATIVE',
  AGENT: 'AGENT',
  SYSTEM: 'SYSTEM',
};

// These interfaces are for TypeScript's benefit during development.
// They don't exist in the final JavaScript, so we just need to declare them.
interface GameEvent {
  id: string;
  type: string; // Simplified to string for worker context
  title: string;
  description: string;
  timestamp: number;
  isAiGenerated?: boolean;
}

interface Personality {
  creativity: number;
  pragmatism: number;
  social: number;
}

interface Skills {
  foraging: number;
  woodcutting: number;
  crafting: number;
}

interface Agent {
  id: string;
  name: string;
  task: string;
  mood: number;
  hunger: number;
  personality: Personality;
  skills: Skills;
  relationships: Record<string, number>;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isMoving: boolean;
  direction: 'down' | 'up' | 'left' | 'right';
}

interface ColonyResources {
  food: number;
  wood: number;
  stability: number;
}

interface CulturalValues {
  collectivism: number;
  pragmatism: number;
  spirituality: number;
}

interface SimulationState {
  agents: Agent[];
  resources: ColonyResources;
  culturalValues: CulturalValues;
  events: GameEvent[];
  day: number;
  isPaused: boolean;
}

interface GenesisData {
    colonyName: string;
    startingEvent: {
      title: string;
      description: string;
    };
    initialResources: {
      food: number;
      wood: number;
    };
    culturalValues: CulturalValues;
    agentPersonalities: {
      name: string;
      creativity: number;
      pragmatism: number;
      social: number;
    }[];
}


// --- SIMULATION LOGIC ---

// Simple unique ID generator
const uuidv4 = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const TICK_RATE = 100; // ms per tick
const TICKS_PER_DAY = 500;
const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 600;
const AGENT_SPEED = 0.5;

let state: SimulationState;
let simulationInterval: number | null = null;
let tickCount = 0;

function initialize(genesisData: GenesisData): void {
  const initialAgents: Agent[] = genesisData.agentPersonalities.map((p) => ({
    id: uuidv4(),
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
    x: Math.random() * (WORLD_WIDTH - 50) + 25, // Start away from edges
    y: Math.random() * (WORLD_HEIGHT - 50) + 25,
    targetX: -1,
    targetY: -1,
    isMoving: false,
    direction: 'down',
  }));

  const startingEvent: GameEvent = {
    id: uuidv4(),
    type: GameEventType.NARRATIVE,
    title: genesisData.startingEvent.title,
    description: genesisData.startingEvent.description,
    timestamp: Date.now(),
    isAiGenerated: true,
  };

  state = {
    agents: initialAgents,
    resources: {
      ...genesisData.initialResources,
      stability: 100,
    },
    culturalValues: genesisData.culturalValues,
    events: [startingEvent],
    day: 1,
    isPaused: true,
  };
}

function updateAgent(agent: Agent): Agent {
  // Update needs
  agent.hunger = Math.min(100, agent.hunger + 0.05);
  agent.mood = Math.max(0, agent.mood - 0.01); // Base mood decay

  if (agent.hunger > 70) {
      agent.mood = Math.max(0, agent.mood - 0.1);
  }

  // Handle tasks
  if (agent.task === 'Idle' && !agent.isMoving) {
    // Simple AI: decide on a new task
    if (agent.hunger > 50 && state.resources.food > 0) {
        agent.task = 'Eating';
    } else if (state.resources.food < 50) {
        agent.task = 'Foraging';
        assignRandomTarget(agent);
    } else if (state.resources.wood < 80) {
        agent.task = 'Woodcutting';
        assignRandomTarget(agent);
    } else {
        agent.task = 'Wandering';
        assignRandomTarget(agent);
    }
  }

  // Task execution
  switch (agent.task) {
    case 'Foraging':
      if (!agent.isMoving) {
        state.resources.food += 0.1 + (agent.skills.foraging / 10);
        agent.task = 'Idle'; // Finish task and wait for next decision
      }
      break;
    case 'Woodcutting':
      if (!agent.isMoving) {
        state.resources.wood += 0.1 + (agent.skills.woodcutting / 10);
        agent.task = 'Idle';
      }
      break;
    case 'Eating':
        if (state.resources.food >= 1) {
            state.resources.food -= 1;
            agent.hunger = Math.max(0, agent.hunger - 30);
            agent.mood = Math.min(100, agent.mood + 10);
        }
        agent.task = 'Idle';
      break;
    case 'Wandering':
        if (!agent.isMoving) {
            agent.task = 'Idle';
        }
        break;
  }

  // Handle movement
  if (agent.isMoving) {
    const dx = agent.targetX - agent.x;
    const dy = agent.targetY - agent.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < AGENT_SPEED * 2) {
      agent.x = agent.targetX;
      agent.y = agent.targetY;
      agent.isMoving = false;
    } else {
      const angle = Math.atan2(dy, dx);
      agent.x += Math.cos(angle) * AGENT_SPEED;
      agent.y += Math.sin(angle) * AGENT_SPEED;
      
      // Update direction for animation
      if (Math.abs(dx) > Math.abs(dy)) {
          agent.direction = dx > 0 ? 'right' : 'left';
      } else {
          agent.direction = dy > 0 ? 'down' : 'up';
      }
    }
  }
  
  return agent;
}

function assignRandomTarget(agent: Agent) {
    agent.targetX = Math.random() * (WORLD_WIDTH - 50) + 25;
    agent.targetY = Math.random() * (WORLD_HEIGHT - 50) + 25;
    agent.isMoving = true;
}

function tick(): void {
  if (!state || state.isPaused) {
    return;
  }
  
  tickCount++;
  if (tickCount >= TICKS_PER_DAY) {
      tickCount = 0;
      state.day++;
      // Daily resource consumption
      const foodConsumed = state.agents.length;
      state.resources.food = Math.max(0, state.resources.food - foodConsumed);

      if (state.resources.food <= 0) {
          state.agents.forEach(a => a.hunger += 10); // get hungry if no food
          state.resources.stability -= 5;
      }
  }

  state.agents = state.agents.map(updateAgent);
  
  self.postMessage({ type: 'STATE_UPDATE', payload: state });
}

function startSimulation(): void {
  if (simulationInterval === null) {
    simulationInterval = self.setInterval(tick, TICK_RATE);
  }
}

function stopSimulation(): void {
  if (simulationInterval !== null) {
    self.clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

self.onmessage = (e: MessageEvent): void => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INITIALIZE_SIMULATION':
      initialize(payload as GenesisData);
      self.postMessage({ type: 'STATE_UPDATE', payload: state });
      break;
    case 'TOGGLE_PAUSE':
      if (state) {
        state.isPaused = !state.isPaused;
        if (state.isPaused) {
          stopSimulation();
        } else {
          startSimulation();
        }
        // Send state update to reflect pause status immediately
        self.postMessage({ type: 'STATE_UPDATE', payload: state });
      }
      break;
  }
};
