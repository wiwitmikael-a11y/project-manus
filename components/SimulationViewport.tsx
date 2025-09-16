// Fix: Implement the SimulationViewport component to display the main simulation UI.
import React, { useState, useEffect } from 'react';
// Fix: Added .ts extension to resolve module import error.
// FIX: Removed unused 'Blueprint' type, as it is not exported from types.ts.
import { SimulationState, Agent } from '../types.ts';
// Fix: Added .ts extension to resolve module import error.
import { useSimulation } from '../hooks/useSimulation.ts';
// Fix: Added .tsx extension to resolve module import error.
import GameCanvas, { Camera } from './GameCanvas.tsx';
import CommandBar from './CommandBar';
import EventLog from './EventLog';
import ColonyInfoPanel from './ColonyInfoPanel';
import GlassmorphismModal from './common/GlassmorphismModal';
import AgentSelectionPanel from './AgentSelectionPanel';
import { assetLoader } from '../assets';
import Spinner from './common/Spinner';
import ResearchPanel from './ResearchPanel'; // Baru

interface SimulationViewportProps {
  initialState: SimulationState;
}

type ActiveModal = 'colony' | 'events' | 'research' | 'none';

const SimulationViewport: React.FC<SimulationViewportProps> = ({ initialState }) => {
  const { simulationState, togglePause } = useSimulation(initialState);
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(assetLoader.loaded);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1.5 });

  useEffect(() => {
    if (!assetLoader.loaded) {
      assetLoader.loadAssets().then(() => {
        setAssetsLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    if(selectedAgent) {
        setCamera(prev => ({...prev, targetX: selectedAgent.x, targetY: selectedAgent.y, zoom: 2.5 }));
    } else {
        setCamera(prev => ({...prev, targetX: initialState.world.width / 2, targetY: initialState.world.height / 2, zoom: 1.5 }));
    }
  }, [selectedAgent, initialState.world.width, initialState.world.height]);
  
  if (!assetsLoaded) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900">
            <div className="flex items-center">
              <Spinner />
              <p className="text-amber-400 text-xl ml-4">Loading assets...</p>
            </div>
        </div>
    );
  }

  const { agents, events, isPaused } = simulationState;

  return (
    <div className="relative w-screen h-screen bg-slate-900 text-white overflow-hidden">
      <GameCanvas 
        simulationState={simulationState}
        cameraState={camera}
        setCamera={setCamera}
        selectedAgent={selectedAgent}
        onAgentClick={(agent) => setSelectedAgent(agent === selectedAgent ? null : agent)} 
      />

      <CommandBar
        isPaused={isPaused}
        agents={agents}
        selectedAgent={selectedAgent}
        onTogglePause={togglePause}
        onColonyClick={() => setActiveModal('colony')}
        onEventsClick={() => setActiveModal('events')}
        onResearchClick={() => setActiveModal('research')}
        onSelectAgent={(agent) => setSelectedAgent(agent === selectedAgent ? null : agent)}
      />
      
      <GlassmorphismModal
        isOpen={activeModal === 'colony'}
        onClose={() => setActiveModal('none')}
        title="Colony Status"
      >
        <ColonyInfoPanel 
          resources={simulationState.resources}
          culturalValues={simulationState.culturalValues}
          world={simulationState.world}
        />
      </GlassmorphismModal>

      <GlassmorphismModal
        isOpen={activeModal === 'events'}
        onClose={() => setActiveModal('none')}
        title="Event Log"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-2">
            <EventLog events={events} />
        </div>
      </GlassmorphismModal>

      <GlassmorphismModal
        isOpen={activeModal === 'research'}
        onClose={() => setActiveModal('none')}
        title="Colony Research"
      >
        <ResearchPanel 
            simulationState={simulationState}
        />
      </GlassmorphismModal>

      <AgentSelectionPanel 
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />

    </div>
  );
};

export default SimulationViewport;