import React, { useState, useEffect, useCallback } from 'react';
import { SimulationState } from '../types.ts';
import GameCanvas from './GameCanvas.tsx';
import HudSidebar from './HudSidebar.tsx';
import CommandBar from './CommandBar.tsx';
import AgentListModal from './AgentListModal.tsx';

interface SimulationViewportProps {
  simulationState: SimulationState;
  onTogglePause: () => void;
}

const TILE_RENDER_SIZE = 64; // Must match canvas render size

const SimulationViewport: React.FC<SimulationViewportProps> = ({ simulationState, onTogglePause }) => {
  const [camera, setCamera] = useState({ x: 50 * TILE_RENDER_SIZE, y: 50 * TILE_RENDER_SIZE, zoom: 0.5 });
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isAgentListVisible, setIsAgentListVisible] = useState(false);
  
  const handleSelectAgent = useCallback((id: string) => {
    setSelectedAgentId(id);
    const agent = simulationState.agents.find(a => a.id === id);
    if(agent) {
        // Center camera on agent
        setCamera(prev => ({ ...prev, x: agent.x * TILE_RENDER_SIZE, y: agent.y * TILE_RENDER_SIZE }));
    }
    setIsAgentListVisible(false); // Close modal on selection
  }, [simulationState.agents]);

  // Effect to follow the selected agent
  useEffect(() => {
      if (selectedAgentId) {
          const agent = simulationState.agents.find(a => a.id === selectedAgentId);
          if (agent) {
               setCamera(prev => ({ ...prev, x: agent.x * TILE_RENDER_SIZE, y: agent.y * TILE_RENDER_SIZE }));
          }
      }
  }, [simulationState.tick, selectedAgentId, simulationState.agents]);

  return (
    <div className="relative w-full h-full bg-slate-800 overflow-hidden">
      <GameCanvas 
        simulationState={simulationState} 
        camera={camera} 
        selectedAgentId={selectedAgentId} 
      />
      <HudSidebar 
        simulationState={simulationState} 
        selectedAgentId={selectedAgentId} 
        onSelectAgent={handleSelectAgent} 
      />
      <CommandBar 
        isPaused={simulationState.isPaused} 
        onTogglePause={onTogglePause} 
        onShowAgentList={() => setIsAgentListVisible(true)}
      />
      <AgentListModal
        isOpen={isAgentListVisible}
        onClose={() => setIsAgentListVisible(false)}
        agents={simulationState.agents}
        onSelectAgent={handleSelectAgent}
      />
    </div>
  );
};

export default SimulationViewport;
