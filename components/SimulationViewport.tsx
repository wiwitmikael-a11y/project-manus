// components/SimulationViewport.tsx
import React, { useState } from 'react';
import GameCanvas from './GameCanvas.tsx';
import HudSidebar from './HudSidebar.tsx';
import CommandBar from './CommandBar.tsx';
import AgentListModal from './AgentListModal.tsx';
import { SimulationState } from '../types.ts';

interface SimulationViewportProps {
  simulationState: SimulationState;
  onTogglePause: () => void;
}

const SimulationViewport: React.FC<SimulationViewportProps> = ({ simulationState, onTogglePause }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isAgentListVisible, setIsAgentListVisible] = useState(false);

  // Set the first agent as selected by default
  React.useEffect(() => {
    if (!selectedAgentId && simulationState.agents.length > 0) {
      setSelectedAgentId(simulationState.agents[0].id);
    }
  }, [simulationState.agents, selectedAgentId]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
      <GameCanvas 
        simulationState={simulationState}
        selectedAgentId={selectedAgentId}
      />
      <HudSidebar
        simulationState={simulationState}
        selectedAgentId={selectedAgentId}
        onSelectAgent={setSelectedAgentId}
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
        onSelectAgent={(agentId) => {
            setSelectedAgentId(agentId);
            setIsAgentListVisible(false); // Close modal on selection
        }}
      />
    </div>
  );
};

export default SimulationViewport;
