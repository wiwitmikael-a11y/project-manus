import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState } from '../types.ts';

export const useSimulation = (initialState: SimulationState) => {
  const [simulationState, setSimulationState] = useState<SimulationState | null>(initialState);
  const intervalRef = useRef<number | null>(null);

  const tick = useCallback((state: SimulationState): SimulationState => {
    return {
      ...state,
      tick: state.tick + 1,
      agents: state.agents.map(agent => ({
        ...agent,
        state_timer: Math.max(0, agent.state_timer - 1),
        energy: {
          ...agent.energy,
          current: Math.max(0, agent.energy.current - 0.01)
        }
      }))
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = window.setInterval(() => {
      setSimulationState(prevState => {
        if (!prevState || prevState.isPaused) return prevState;
        return tick(prevState);
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  const togglePause = useCallback(() => {
    setSimulationState(prev => prev ? { ...prev, isPaused: !prev.isPaused } : null);
  }, []);

  return { simulationState, togglePause };
};