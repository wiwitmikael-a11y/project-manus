// Fix: Implement the AgentSelectionPanel component for detailed agent views.
import React from 'react';
import { Agent } from '../types';
import GlassmorphismModal from './common/GlassmorphismModal';
import AgentCard from './AgentCard';

interface AgentSelectionPanelProps {
  agent: Agent | null;
  onClose: () => void;
}

const AgentSelectionPanel: React.FC<AgentSelectionPanelProps> = ({ agent, onClose }) => {
  if (!agent) {
    return null;
  }

  return (
    <GlassmorphismModal 
      isOpen={!!agent} 
      onClose={onClose} 
      title={`Agent Details - ${agent.name}`}
    >
      <div className="max-h-[80vh] overflow-y-auto pr-2">
        <AgentCard agent={agent} />
        
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <h4 className="font-semibold text-slate-200 mb-2">Current Status</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li><strong>Position:</strong> ({agent.x.toFixed(1)}, {agent.y.toFixed(1)})</li>
            <li><strong>Target:</strong> {agent.isMoving ? `(${agent.targetX.toFixed(1)}, ${agent.targetY.toFixed(1)})` : 'None'}</li>
            <li><strong>Gender:</strong> {agent.gender.charAt(0).toUpperCase() + agent.gender.slice(1)}</li>
            <li><strong>Animation State:</strong> {agent.animationState}</li>
          </ul>
        </div>
        
        {Object.keys(agent.relationships).length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <h4 className="font-semibold text-slate-200 mb-2">Relationships</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              {Object.entries(agent.relationships).map(([agentId, value]) => (
                <li key={agentId} className="flex justify-between">
                  <span>vs. {agentId}:</span>
                  <span className="font-mono">{value.toFixed(0)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GlassmorphismModal>
  );
};

export default AgentSelectionPanel;
