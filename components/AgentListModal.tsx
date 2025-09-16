// components/AgentListModal.tsx
import React from 'react';
import GlassmorphismModal from './common/GlassmorphismModal.tsx';
import { Agent } from '../types.ts';
import Button from './common/Button.tsx';

interface AgentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onSelectAgent: (id: string) => void;
}

const AgentListModal: React.FC<AgentListModalProps> = ({ isOpen, onClose, agents, onSelectAgent }) => {
  return (
    <GlassmorphismModal
      isOpen={isOpen}
      onClose={onClose}
      title="Colony Survivor Roster"
    >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {agents.map(agent => (
                <div key={agent.id} className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center border border-slate-700">
                    <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-lg font-bold text-amber-400 border-2 border-slate-500">
                            {agent.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">{agent.name}</h4>
                            <p className="text-sm text-slate-400 capitalize">{agent.gender} - {agent.state}</p>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={() => onSelectAgent(agent.id)}>
                        Focus
                    </Button>
                </div>
            ))}
            {agents.length === 0 && (
                <p className="text-slate-400 text-center py-4">No survivors found.</p>
            )}
        </div>
    </GlassmorphismModal>
  );
};

export default AgentListModal;
