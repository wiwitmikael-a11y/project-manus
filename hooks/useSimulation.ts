import { useEffect, useRef, useReducer, useCallback } from 'react';
import { SimulationState, AgentVitals, ColonyStats, GameEvent } from '../types';
import { generateGenesis, generateDynamicEvent } from '../services/geminiService';

type SimulationAction =
  | { type: 'INITIALIZE_SUCCESS'; payload: SimulationState }
  | { type: 'INITIALIZE_FAILURE'; payload: string }
  | { type: 'UPDATE_AGENTS'; payload: AgentVitals[] }
  | { type: 'UPDATE_STATS'; payload: ColonyStats }
  | { type: 'ADD_EVENT'; payload: GameEvent }
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
    case 'UPDATE_AGENTS':
      if (!state.state) return state;
      const agentMap = new Map(state.state.agents.map(a => [a.id, a]));
      for (const vital of action.payload) {
        const agent = agentMap.get(vital.id);
        if (agent) {
          Object.assign(agent, vital);
        }
      }
      return { ...state, state: { ...state.state, agents: [...agentMap.values()] } };
    case 'UPDATE_STATS':
      if (!state.state) return state;
      return { ...state, state: { ...state.state, ...action.payload } };
    case 'ADD_EVENT':
      if (!state.state) return state;
      return { ...state, state: { ...state.state, events: [...state.state.events, action.payload] } };
    case 'SET_PAUSED':
       if (!state.state) return state;
       return { ...state, state: {...state.state, isPaused: action.payload }};
    default:
      return state;
  }
}

export const useSimulation = () => {
  const [simulation, dispatch] = useReducer(simulationReducer, initialState);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const startWorldGeneration = async () => {
      try {
        const genesisData = await generateGenesis();
        const worker = new Worker('/simulation.worker.ts', { type: 'module' });
        workerRef.current = worker;

        worker.onmessage = async (e: MessageEvent) => {
          const { type, payload } = e.data;
          switch (type) {
            case 'INITIAL_STATE':
              dispatch({ type: 'INITIALIZE_SUCCESS', payload });
              // Unpause the simulation immediately after initialization.
              worker.postMessage({ type: 'TOGGLE_PAUSE' });
              break;
            case 'AGENT_UPDATE':
              dispatch({ type: 'UPDATE_AGENTS', payload });
              break;
            case 'STATS_UPDATE':
              dispatch({ type: 'UPDATE_STATS', payload });
              break;
            case 'NEW_EVENT':
                dispatch({ type: 'ADD_EVENT', payload });
                break;
            case 'PAUSE_CHANGE':
                dispatch({ type: 'SET_PAUSED', payload });
                break;
            case 'REQUEST_AI_EVENT':
                const newEventData = await generateDynamicEvent(payload);
                const newEvent: GameEvent = {
                    ...newEventData,
                    id: `event-${Date.now()}`,
                    timestamp: Date.now(),
                };
                worker.postMessage({ type: 'ADD_EVENT', payload: newEvent });
                break;
          }
        };

        worker.postMessage({ type: 'INITIALIZE', payload: genesisData });

      } catch (err) {
        let errorMessage = "An unknown error occurred.";
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        dispatch({ type: 'INITIALIZE_FAILURE', payload: errorMessage });
      }
    };

    startWorldGeneration();

    return () => {
      workerRef.current?.terminate();
    };
  }, []); 

  const togglePause = useCallback(() => {
    workerRef.current?.postMessage({ type: 'TOGGLE_PAUSE' });
  }, []);

  return { 
      state: simulation.state, 
      isLoading: simulation.isLoading, 
      error: simulation.error, 
      togglePause 
  };
};
