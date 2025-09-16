
import { useEffect, useReducer, useCallback, useRef } from 'react';
import { SimulationState, Agent, GenesisData, GameEvent } from '../types';
import { generateGenesis, generateDynamicEvent } from '../services/geminiService';

const TICK_RATE = 1000; // ms per tick
const DAY_LENGTH = 60; // ticks per day
const AI_EVENT_INTERVAL_DAYS = 3; // Request a new AI event every 3 days
const WORLD_WIDTH = 50; // Map dimensions in tiles
const WORLD_HEIGHT = 50; // Map dimensions in tiles

// Helper to keep coordinates within map bounds
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

type SimulationAction =
  | { type: 'INITIALIZE_SUCCESS'; payload: SimulationState }
  | { type: 'INITIALIZE_FAILURE'; payload: string }
  | { type: 'UPDATE_STATE'; payload: SimulationState }
  | { type: 'SET_PAUSED'; payload: boolean };

const initialState: {
  state: SimulationState | null;
  isLoading: boolean;
  error: string | null;
} = {
  state: null,
  isLoading: true,
  error: null,
};

function simulationReducer(
  state: typeof initialState,
  action: SimulationAction
): typeof initialState {
  switch (action.type) {
    case 'INITIALIZE_SUCCESS':
      return { isLoading: false, error: null, state: action.payload };
    case 'INITIALIZE_FAILURE':
      return { isLoading: false, error: action.payload, state: null };
    case 'SET_PAUSED':
      if (!state.state) return state;
      return { ...state, state: { ...state.state, isPaused: action.payload } };
    case 'UPDATE_STATE':
        if (!state.state) return state;
        return { ...state, state: action.payload };
    default:
      return state;
  }
}

export const useSimulation = () => {
  const [simulation, dispatch] = useReducer(simulationReducer, initialState);
  const tickCounter = useRef(0);
  const stateRef = useRef(simulation.state);
  stateRef.current = simulation.state;

  const runSimulationTick = useCallback(async () => {
    const currentState = stateRef.current;
    if (!currentState || currentState.isPaused) return;

    // Create a new state object for this tick to avoid mutation.
    let nextState: SimulationState = {
        ...currentState,
        agents: currentState.agents.map(a => ({...a})),
        resources: {...currentState.resources},
        // Start with the same events array reference. A new array will be created only if an event is added.
        events: currentState.events, 
    };

    tickCounter.current++;
    
    // Daily updates
    if (tickCounter.current >= DAY_LENGTH) {
      tickCounter.current = 0;
      nextState.day++;
      
      const dailyFoodConsumption = nextState.agents.length * 0.5;
      nextState.resources.food = Math.max(0, nextState.resources.food - dailyFoodConsumption);

      nextState.agents.forEach(agent => {
          agent.hunger += 5; 
          if(agent.hunger > 80 || nextState.resources.food === 0) agent.mood -= 5;
      });

      if (nextState.day % AI_EVENT_INTERVAL_DAYS === 0) {
        const newEventData = await generateDynamicEvent({
            day: nextState.day, 
            resources: nextState.resources, 
            events: nextState.events.slice(-1) 
        });
        const newEvent = {
            ...newEventData,
            id: `event-${Date.now()}`,
            timestamp: Date.now(),
        };
        // Create a new events array when adding a new event
        nextState.events = [...nextState.events, newEvent];
      }
    }

    // Per-tick updates for agents
    nextState.agents.forEach(agent => {
      agent.hunger = Math.min(100, agent.hunger + 0.1);
      agent.mood = Math.max(0, agent.mood - 0.05);

      if (agent.task === 'Foraging') {
          nextState.resources.food += 0.2;
          if (Math.random() < 0.02) {
               agent.isMoving = true;
               agent.targetX = clamp(agent.x + (Math.random() - 0.5) * 10, 0, WORLD_WIDTH);
               agent.targetY = clamp(agent.y + (Math.random() - 0.5) * 10, 0, WORLD_HEIGHT);
          }
      }

      if (agent.isMoving) {
          const dx = agent.targetX - agent.x;
          const dy = agent.targetY - agent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1) { // Stop when close enough
              agent.isMoving = false;
          } else {
              agent.x += dx / dist; // Move 1 unit per tick
              agent.y += dy / dist;
          }
      } else if (agent.task === 'Idle') {
          if (Math.random() < 0.01) {
              agent.isMoving = true;
              agent.targetX = clamp(Math.random() * WORLD_WIDTH, 0, WORLD_WIDTH);
              agent.targetY = clamp(Math.random() * WORLD_HEIGHT, 0, WORLD_HEIGHT);
          }
      }
    });

    dispatch({ type: 'UPDATE_STATE', payload: nextState });
  }, []);

  // Initialization Effect
  useEffect(() => {
    const startWorldGeneration = async () => {
      try {
        const genesisData = await generateGenesis();
        
        const initialAgents: Agent[] = genesisData.agents.map(a => ({
            ...a,
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            targetX: Math.random() * WORLD_WIDTH,
            targetY: Math.random() * WORLD_HEIGHT,
            isMoving: true,
            relationships: {},
        }));

        const initialState: SimulationState = {
            agents: initialAgents,
            resources: { food: 50, wood: 20, stability: 80 },
            culturalValues: genesisData.culturalValues,
            events: [{
                ...genesisData.startingEvent,
                id: `event-${Date.now()}`,
                timestamp: Date.now(),
            }],
            day: 1,
            isPaused: false, // Start unpaused
            biomes: genesisData.biomes,
            structures: genesisData.structures,
            creatures: genesisData.creatures,
        };
        
        dispatch({ type: 'INITIALIZE_SUCCESS', payload: initialState });
      } catch (err) {
        let errorMessage = "An unknown error occurred.";
        if (err instanceof Error) errorMessage = err.message;
        dispatch({ type: 'INITIALIZE_FAILURE', payload: errorMessage });
      }
    };
    startWorldGeneration();
  }, []); 
  
  // Game Loop Effect
  useEffect(() => {
    if (simulation.state && !simulation.state.isPaused) {
      const intervalId = setInterval(runSimulationTick, TICK_RATE);
      return () => clearInterval(intervalId);
    }
  }, [simulation.state?.isPaused, runSimulationTick]);


  const togglePause = useCallback(() => {
    dispatch({ type: 'SET_PAUSED', payload: !stateRef.current?.isPaused });
  }, []);

  return { 
      state: simulation.state, 
      isLoading: simulation.isLoading, 
      error: simulation.error, 
      togglePause 
  };
};
