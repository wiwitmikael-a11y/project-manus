import React, { useState, useCallback } from 'react';
import { useSimulation } from './hooks/useSimulation';
import Spinner from './components/common/Spinner';
import Card from './components/common/Card';
import GameCanvas from './components/GameCanvas';
import GlassmorphismModal from './components/common/GlassmorphismModal';
import CommandBar from './components/CommandBar';
import AgentCard from './components/AgentCard';
import EventLog from './components/EventLog';
import ColonyInfoPanel from './components/ColonyInfoPanel';
import { Agent } from './types';

const App: React.FC = () => {
  const { state, isLoading, error, togglePause } = useSimulation();
  
  const [isColonyPanelOpen, setColonyPanelOpen] = useState(false);
  const [isEventsPanelOpen, setEventsPanelOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleAgentClick = useCallback((agentId: string) => {
    if (state) {
      const agent = state.agents.find(a => a.id === agentId);
      setSelectedAgent(agent || null);
    }
  }, [state]);

  const handleCloseAgentModal = () => setSelectedAgent(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900">
        <Spinner />
        <h2 className="text-xl font-semibold text-sky-400 mt-4">Menciptakan Dunia Baru...</h2>
        <p className="text-slate-400 mt-2">Sang AI sedang merajut takdir awal kolonimu.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="max-w-md w-full p-4">
            <Card title="Gagal Menciptakan Dunia">
            <p className="text-red-400">Terjadi kesalahan saat berkomunikasi dengan AI.</p>
            <p className="text-slate-400 mt-2">Silakan periksa kunci API Anda dan coba muat ulang halaman.</p>
            <p className="text-xs text-slate-500 mt-4">Detail Error: {error}</p>
            </Card>
        </div>
      </div>
    );
  }

  if (!state) {
    return <div className="text-center p-8">State simulasi tidak tersedia.</div>;
  }

  return (
    <div className="h-screen w-screen bg-slate-900 overflow-hidden">
      <GameCanvas 
        state={state} 
        onAgentClick={handleAgentClick} 
        selectedAgentId={selectedAgent?.id || null}
      />
      
      <CommandBar 
        isPaused={state.isPaused}
        onTogglePause={togglePause}
        onColonyClick={() => setColonyPanelOpen(true)}
        onEventsClick={() => setEventsPanelOpen(true)}
      />

      {/* Colony Status Modal */}
      <GlassmorphismModal 
        isOpen={isColonyPanelOpen} 
        onClose={() => setColonyPanelOpen(false)} 
        title={`Status Koloni (Hari ke-${state.day})`}
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <ColonyInfoPanel 
              resources={state.resources} 
              culturalValues={state.culturalValues}
              biomes={state.biomes}
              structures={state.structures}
              creatures={state.creatures}
          />
        </div>
      </GlassmorphismModal>

      {/* Event Log Modal */}
      <GlassmorphismModal 
        isOpen={isEventsPanelOpen} 
        onClose={() => setEventsPanelOpen(false)} 
        title="Log Peristiwa"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2">
            <EventLog events={state.events} />
        </div>
      </GlassmorphismModal>

      {/* Selected Agent Modal */}
      <GlassmorphismModal 
        isOpen={!!selectedAgent} 
        onClose={handleCloseAgentModal} 
        title={selectedAgent ? `Detail Kolonis: ${selectedAgent.name}` : ''}
      >
        {selectedAgent && <AgentCard agent={selectedAgent} />}
      </GlassmorphismModal>
    </div>
  );
};

export default App;
