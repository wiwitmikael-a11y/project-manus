// Fix: Implement the useSimulation custom hook to manage simulation state via a web worker.
import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState } from '../types';

export function useSimulation(initialState: SimulationState) {
  const [simulationState, setSimulationState] = useState<SimulationState>(initialState);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    // This async function fetches the worker script and creates a worker from a Blob URL.
    // This is a robust workaround for "SecurityError: The operation is insecure," which can happen
    // in sandboxed environments or when worker paths are restricted by security policies.
    const createWorkerFromBlob = async () => {
      try {
        const response = await fetch('/simulation.worker.ts');
        if (!response.ok) {
          throw new Error(`Failed to fetch worker script: ${response.statusText}`);
        }
        const scriptContent = await response.text();
        const blob = new Blob([scriptContent], { type: 'application/javascript' });
        objectUrl = URL.createObjectURL(blob);
        
        const worker = new Worker(objectUrl, { type: 'module' });
        workerRef.current = worker;

        worker.postMessage({ type: 'start', payload: initialState });
        
        worker.onmessage = (e: MessageEvent<SimulationState>) => {
          setSimulationState(e.data);
        };
      } catch (error) {
        console.error("Failed to create simulation worker:", error);
      }
    };

    createWorkerFromBlob();

    // Cleanup function to terminate the worker and revoke the blob URL
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [initialState]);

  const togglePause = useCallback(() => {
    if (workerRef.current) {
      const nextPausedState = !simulationState.isPaused;
      
      setSimulationState(prevState => ({ ...prevState, isPaused: nextPausedState }));

      if (nextPausedState) {
        workerRef.current.postMessage({ type: 'pause' });
      } else {
        workerRef.current.postMessage({ type: 'resume' });
      }
    }
  }, [simulationState.isPaused]);
  
  return {
    simulationState,
    togglePause,
  };
}