
import React, { useState } from 'react';
import { SimulationState } from '../types.ts';
import ColonyInfoPanel from './ColonyInfoPanel.tsx';
import AgentSelectionPanel from './AgentSelectionPanel.tsx';
import AgentCard from './AgentCard.tsx';
import ResearchPanel from './ResearchPanel.tsx';
import { InfoIcon, UsersIcon, BookOpenIcon, ChevronLeftIcon, ChevronRightIcon } from './common/Icons.tsx';

interface HudSidebarProps {
  simulationState: SimulationState;
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
}

type ActiveTab = 'colony' | 'agents' | 'research';

const HudSidebar: React.FC<HudSidebarProps> = ({ simulationState, selectedAgentId, onSelectAgent, isCollapsed, onToggleCollapse }) => {
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
      onClick={() => { if (!isCollapsed) setActiveTab(tabId); else onToggleCollapse(false); }}
      className={`flex items-center p-2 rounded-lg transition-colors text-xs ${activeTab === tabId && !isCollapsed ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:bg-slate-700'} ${isCollapsed ? 'w-12 h-12 justify-center' : 'flex-1 flex-col'}`}
      aria-label={`Switch to ${label} tab`}
      title={label}
    >
      {icon}
      {!isCollapsed && <span className="mt-1">{label}</span>}
    </button>
  );
  
  const day = Math.floor(simulationState.tick / 2400) + 1;
  const hour = Math.floor((simulationState.tick % 2400) / 100);

  return (
    <div className={`absolute top-0 left-0 h-screen bg-slate-900/50 backdrop-blur-lg border-r border-slate-700 flex flex-col z-10 shadow-2xl transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-full md:w-96'}`}>
       <button 
        onClick={() => onToggleCollapse(!isCollapsed)} 
        className="absolute top-1/2 -translate-y-1/2 w-8 h-16 bg-slate-800/80 hover:bg-slate-700 border-y border-r border-slate-600 rounded-r-lg flex items-center justify-center text-slate-300 z-20 transition-all duration-300"
        style={{ left: isCollapsed ? '4rem' : '24rem' }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </button>

      <div className={`flex flex-col h-full min-w-0 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="p-4 border-b border-slate-700 text-center flex-shrink-0">
          <h2 className="text-xl font-bold text-amber-400">Project MANUS</h2>
          <p className="text-xs text-slate-400 font-mono">Day {day} | {String(hour).padStart(2, '0')}:00</p>
        </div>
        
        <div className="flex justify-center p-2 bg-slate-800/50 border-b border-slate-700 space-x-2 flex-shrink-0">
            <TabButton tabId="colony" icon={<InfoIcon />} label="Colony" />
            <TabButton tabId="agents" icon={<UsersIcon />} label="Agents" />
            <TabButton tabId="research" icon={<BookOpenIcon />} label="Research" />
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>

       {/* Visible only when collapsed */}
       <div className={`absolute top-0 left-0 h-full w-full flex flex-col items-center transition-opacity duration-300 ${isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="p-4 border-b border-slate-700 flex-shrink-0 w-full">
            <div className="w-8 h-8 mx-auto bg-amber-500/20 text-amber-400 font-bold rounded-full flex items-center justify-center text-lg">P</div>
          </div>
          <div className="flex flex-col items-center p-2 bg-slate-800/50 border-b border-slate-700 space-y-2 flex-shrink-0 w-full">
            <TabButton tabId="colony" icon={<InfoIcon />} label="Colony" />
            <TabButton tabId="agents" icon={<UsersIcon />} label="Agents" />
            <TabButton tabId="research" icon={<BookOpenIcon />} label="Research" />
          </div>
       </div>
    </div>
  );
};

export default HudSidebar;
