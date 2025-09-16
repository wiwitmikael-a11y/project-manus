// components/AgentSelectionPanel.tsx
import React from 'react';
// Fix: Added .ts extension to resolve module import error.
import { Agent } from '../types.ts';

interface AgentSelectionPanelProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
}

const AgentSelectionPanel: React.FC<AgentSelectionPanelProps> = ({ agents, selectedAgentId, onSelectAgent }) => {
  return (
    <div>
      <h4 className="font-semibold text-slate-200 mb-2">Colony Survivors</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            className={`w-full text-left p-2 rounded-md transition-colors duration-200 flex items-center space-x-3 ${
              selectedAgentId === agent.id 
              ? 'bg-sky-500/30 border border-sky-500' 
              : 'bg-slate-700/50 hover:bg-slate-700 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold text-amber-400 border border-slate-500">
                {agent.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-100">{agent.name}</p>
              <p className="text-xs text-slate-400 capitalize">{agent.state}</p>
            </div>
          </button>
        ))}
         {agents.length === 0 && <p className="text-xs text-slate-500 pl-2">None.</p>}
      </div>
    </div>
  );
};

export default AgentSelectionPanel;
