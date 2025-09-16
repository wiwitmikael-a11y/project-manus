// Fix: Implement the CommandBar component with UI controls.
import React from 'react';
import { Agent } from '../types';
import { PlayIcon, PauseIcon, ColonyIcon, EventsIcon } from './common/Icons';

interface CommandBarProps {
  isPaused: boolean;
  agents: Agent[];
  selectedAgent: Agent | null;
  onTogglePause: () => void;
  onColonyClick: () => void;
  onEventsClick: () => void;
  onSelectAgent: (agent: Agent | null) => void;
}

const CommandBarButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string; isActive?: boolean }> = ({ onClick, children, 'aria-label': ariaLabel, isActive }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`h-12 w-12 rounded-full bg-slate-700/50 backdrop-blur-sm text-slate-300 hover:bg-sky-500/50 hover:text-white transition-all duration-200 flex items-center justify-center border border-slate-600/50 ${isActive ? 'bg-sky-500/50 text-white ring-2 ring-sky-400' : ''}`}
    >
        {children}
    </button>
);

const AgentButton: React.FC<{ agent: Agent; onClick: () => void; isSelected: boolean }> = ({ agent, onClick, isSelected }) => (
    <button
        onClick={onClick}
        aria-label={`Select ${agent.name}`}
        className={`h-12 w-12 rounded-full bg-slate-700/50 backdrop-blur-sm text-slate-100 font-bold text-lg hover:bg-sky-500/50 transition-all duration-200 flex items-center justify-center border border-slate-600/50 ${isSelected ? 'ring-2 ring-amber-400 scale-110' : 'hover:scale-110'}`}
    >
        {agent.name.charAt(0)}
    </button>
);


const CommandBar: React.FC<CommandBarProps> = ({ isPaused, agents, selectedAgent, onTogglePause, onColonyClick, onEventsClick, onSelectAgent }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-3 p-2 bg-slate-800/50 backdrop-blur-lg border border-slate-600/50 rounded-full shadow-lg">
            {/* Main Controls */}
            <CommandBarButton onClick={onTogglePause} aria-label={isPaused ? "Play Simulation" : "Pause Simulation"}>
                {isPaused ? <PlayIcon className="h-6 w-6" /> : <PauseIcon className="h-6 w-6" />}
            </CommandBarButton>
            <CommandBarButton onClick={onColonyClick} aria-label="Open Colony Status">
                <ColonyIcon className="h-6 w-6" />
            </CommandBarButton>
            <CommandBarButton onClick={onEventsClick} aria-label="Open Event Log">
                <EventsIcon className="h-6 w-6" />
            </CommandBarButton>

            {/* Agent Selector */}
            {agents.length > 0 && <div className="w-px h-8 bg-slate-600/50"></div>}
            
            <div className="flex items-center gap-2">
                {agents.map(agent => (
                    <AgentButton
                        key={agent.id}
                        agent={agent}
                        onClick={() => onSelectAgent(agent)}
                        isSelected={selectedAgent?.id === agent.id}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};

export default CommandBar;