import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState, GameEvent, GameEventType } from '../types';
import { GenesisData, generateGenesis } from '../services/geminiService';

const INITIAL_STATE: SimulationState = {
  agents: [],
  resources: { food: 0, wood: 0, stability: 100 },
  culturalValues: { collectivism: 50, pragmatism: 50, spirituality: 50 },
  events: [],
  day: 1,
  isPaused: true,
};

export const useSimulation = () => {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // 1. Generate the world's DNA from the AI
        const genesisData = await generateGenesis();
        
        // 2. Create the worker using a robust path relative to the document root.
        // This avoids issues with `import.meta.url` in certain environments.
        const worker = new Worker('simulation.worker.ts', { type: 'module' });
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent) => {
          const { type, payload } = e.data;
          if (type === 'STATE_UPDATE') {
            setState(payload);
          }
        };

        // 3. Send the genesis data to the worker to start the simulation
        worker.postMessage({ type: 'INITIALIZE_SIMULATION', payload: genesisData });
        
        // Let the simulation run unpaused initially
        worker.postMessage({ type: 'TOGGLE_PAUSE' });


      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred during world generation.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Cleanup function to terminate the worker when the component unmounts.
    return () => {
      workerRef.current?.terminate();
    };
  }, []); // Empty dependency array ensures this runs only once

  const togglePause = useCallback(() => {
    workerRef.current?.postMessage({ type: 'TOGGLE_PAUSE' });
  }, []);

  return { state, isLoading, error, togglePause };
};