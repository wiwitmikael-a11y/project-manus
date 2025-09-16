import { useEffect, useReducer, useCallback, useRef } from 'react';
import { SimulationState, Agent, GenesisData, GameEvent } from '../types';
import { generateGenesis, generateDynamicEvent } from '../services/geminiService';

const TICK_RATE = 1000; // ms per tick
const DAY_LENGTH = 60; // ticks per day
const AI_EVENT_INTERVAL_DAYS = 3; // Request a new AI event every 3 days
const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 600;

type SimulationAction =
  | { type: 'INITIALIZE_SUCCESS'; payload: SimulationState }
  | { type: 'INITIALIZE_FAILURE'; payload: string }
  | { type: 'TICK'; payload: { newEvent?: GameEvent } }
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
    case 'TICK':
        if (!state.state) return state;
        const newState = { ...state.state };
        if(action.payload.newEvent) {
            newState.events = [...newState.events, action.payload.newEvent];
        }
        return { ...state, state: newState };
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

    tickCounter.current++;
    let newEvent: GameEvent | undefined = undefined;
    
    // Daily updates
    if (tickCounter.current >= DAY_LENGTH) {
      tickCounter.current = 0;
      currentState.day++;
      
      const dailyFoodConsumption = currentState.agents.length * 0.5;
      currentState.resources.food = Math.max(0, currentState.resources.food - dailyFoodConsumption);

      currentState.agents.forEach(agent => {
          agent.hunger += 5; 
          if(agent.hunger > 80 || currentState.resources.food === 0) agent.mood -= 5;
      });

      if (currentState.day % AI_EVENT_INTERVAL_DAYS === 0) {
        const newEventData = await generateDynamicEvent({
            day: currentState.day, 
            resources: currentState.resources, 
            events: currentState.events.slice(-1) 
        });
        newEvent = {
            ...newEventData,
            id: `event-${Date.now()}`,
            timestamp: Date.now(),
        };
      }
    }

    // Per-tick updates for agents
    currentState.agents.forEach(agent => {
      agent.hunger = Math.min(100, agent.hunger + 0.1);
      agent.mood = Math.max(0, agent.mood - 0.05);

      if (agent.task === 'Foraging') {
          currentState.resources.food += 0.2;
          if (Math.random() < 0.02) {
               agent.isMoving = true;
               agent.targetX = agent.x + (Math.random() - 0.5) * 50;
               agent.targetY = agent.y + (Math.random() - 0.5) * 50;
          }
      }

      if (agent.isMoving) {
          const dx = agent.targetX - agent.x;
          const dy = agent.targetY - agent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 2) {
              agent.isMoving = false;
          } else {
              agent.x += dx / dist;
              agent.y += dy / dist;
              if (Math.abs(dx) > Math.abs(dy)) agent.direction = dx > 0 ? 'right' : 'left';
              else agent.direction = dy > 0 ? 'down' : 'up';
          }
      } else if (agent.task === 'Idle') {
          if (Math.random() < 0.01) {
              agent.isMoving = true;
              agent.targetX = Math.random() * WORLD_WIDTH;
              agent.targetY = Math.random() * WORLD_HEIGHT;
          }
      }
    });

    dispatch({ type: 'TICK', payload: { newEvent } });
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
            direction: 'down',
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