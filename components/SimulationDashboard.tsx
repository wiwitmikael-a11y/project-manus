import React from 'react';
import { SimulationState } from '../types.ts';
import { useSimulation } from '../hooks/useSimulation.ts';
import SimulationViewport from './SimulationViewport.tsx';

interface SimulationDashboardProps {
  initialState: SimulationState;
}

const SimulationDashboard: React.FC<SimulationDashboardProps> = ({ initialState }) => {
  const { simulationState, togglePause } = useSimulation(initialState);

  if (!simulationState) {
    // This could show a loading spinner or a placeholder
    // while the worker is initializing.
    return (
        <div className="flex items-center justify-center h-screen bg-slate-900 text-amber-400">
            Initializing Simulation Engine...
        </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <SimulationViewport 
        simulationState={simulationState} 
        onTogglePause={togglePause} 
      />
    </div>
  );
};

export default SimulationDashboard;
