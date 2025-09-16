import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState } from '../types.ts';

export const useSimulation = (initialState: SimulationState) => {
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create and initialize the worker. 
    // The { type: 'module' } is important for Vite and modern bundlers.
    workerRef.current = new Worker(new URL('../simulation.worker.ts', import.meta.url), { type: 'module' });

    // Handle messages from the worker (e.g., state updates)
    workerRef.current.onmessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (type === 'stateUpdate') {
        setSimulationState(payload);
      }
    };

    // Send the initial state to the worker to kick things off
    workerRef.current.postMessage({ type: 'init', payload: initialState });

    // Cleanup: Terminate the worker when the component unmounts
    return () => {
      workerRef.current?.postMessage({ type: 'stop' });
      workerRef.current?.terminate();
    };
  }, [initialState]); // The hook re-initializes if the initial state prop ever changes

  const togglePause = useCallback(() => {
    workerRef.current?.postMessage({ type: 'togglePause' });
  }, []);

  return { simulationState, togglePause };
};
