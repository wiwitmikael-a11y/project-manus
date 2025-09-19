import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState } from '../types.ts';

export const useSimulation = (initialState: SimulationState) => {
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // We define these here so the cleanup function can close over them.
    let worker: Worker | null = null;
    let workerUrl: string | null = null;

    const initializeWorker = async () => {
      try {
        // Fix: To prevent "SecurityError: The operation is insecure." in sandboxed
        // environments, fetch the worker script and create a Blob URL. This ensures
        // the worker has the same origin as the app.
        const response = await fetch('/simulation.worker.ts');
        if (!response.ok) {
          throw new Error(`Failed to fetch worker script: ${response.statusText}`);
        }
        const scriptText = await response.text();
        const blob = new Blob([scriptText], { type: 'application/javascript' });
        workerUrl = URL.createObjectURL(blob);
        
        worker = new Worker(workerUrl, { type: 'module' });
        workerRef.current = worker;

        // Handle messages from the worker (e.g., state updates)
        worker.onmessage = (event: MessageEvent) => {
          const { type, payload } = event.data;
          if (type === 'stateUpdate') {
            setSimulationState(payload);
          }
        };

        // Send the initial state to the worker to kick things off
        worker.postMessage({ type: 'init', payload: initialState });
      } catch (error) {
        console.error("Error initializing simulation worker:", error);
      }
    };

    initializeWorker();

    // Cleanup: Terminate the worker and revoke the Blob URL when the component unmounts
    return () => {
      // Use the local 'worker' and 'workerUrl' variables from this effect's closure for cleanup.
      if (worker) {
        worker.postMessage({ type: 'stop' });
        worker.terminate();
      }
      if (workerUrl) {
        URL.revokeObjectURL(workerUrl);
      }
    };
  }, [initialState]); // The hook re-initializes if the initial state prop ever changes

  const togglePause = useCallback(() => {
    workerRef.current?.postMessage({ type: 'togglePause' });
  }, []);

  return { simulationState, togglePause };
};
