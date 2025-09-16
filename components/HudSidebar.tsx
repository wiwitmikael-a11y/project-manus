import React, { useState } from 'react';
import { SimulationState } from '../types.ts';
import ColonyInfoPanel from './ColonyInfoPanel.tsx';
import AgentSelectionPanel from './AgentSelectionPanel.tsx';
import AgentCard from './AgentCard.tsx';
import ResearchPanel from './ResearchPanel.tsx';
import { InfoIcon, UsersIcon, BookOpenIcon } from './common/Icons.tsx';

interface HudSidebarProps {
  simulationState: SimulationState;
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
}

type ActiveTab = 'colony' | 'agents' | 'research';

const HudSidebar: React.FC<HudSidebarProps> = ({ simulationState, selectedAgentId, onSelectAgent }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('colony');
  
  const selectedAgent = simulationState.agents.find(a => a.id === selectedAgentId) || null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'colony':
        return <ColonyInfoPanel resources={simulationState.resources} culturalValues={simulationState.culturalValues} world={simulationState.world} />;
      case 'agents':
        return (
          <div>
            <AgentSelectionPanel agents={simulationState.agents} selectedAgentId={selectedAgentId} onSelectAgent={onSelectAgent} />
            {selectedAgent && (
              <div className="mt-4 border-t border-slate-700 pt-4">
                <h4 className="font-semibold text-slate-200 mb-2">Selected Survivor</h4>
                <AgentCard agent={selectedAgent} />
              </div>
            )}
          </div>
        );
      case 'research':
        return <ResearchPanel simulationState={simulationState} />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabId: ActiveTab; icon: React.ReactNode; label: string }> = ({ tabId, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex-1 flex flex-col items-center p-2 rounded-lg transition-colors text-xs ${activeTab === tabId ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:bg-slate-700'}`}
      aria-label={`Switch to ${label} tab`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );
  
  const day = Math.floor(simulationState.tick / 2400) + 1;
  const hour = Math.floor((simulationState.tick % 2400) / 100);

  return (
    <div className="absolute top-0 left-0 h-screen w-96 bg-slate-900/50 backdrop-blur-lg border-r border-slate-700 flex flex-col z-10 shadow-2xl">
      <div className="p-4 border-b border-slate-700 text-center">
        <h2 className="text-xl font-bold text-amber-400">Project MANUS</h2>
        <p className="text-xs text-slate-400 font-mono">Day {day} | {String(hour).padStart(2, '0')}:00</p>
      </div>
      
      <div className="flex justify-center p-2 bg-slate-800/50 border-b border-slate-700 space-x-2">
          <TabButton tabId="colony" icon={<InfoIcon />} label="Colony" />
          <TabButton tabId="agents" icon={<UsersIcon />} label="Agents" />
          <TabButton tabId="research" icon={<BookOpenIcon />} label="Research" />
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default HudSidebar;
