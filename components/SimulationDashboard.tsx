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
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-amber-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
            <p>Initializing Simulation Engine...</p>
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
