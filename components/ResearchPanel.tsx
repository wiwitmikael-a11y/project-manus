// components/ResearchPanel.tsx
import React from 'react';
// Fix: Added .ts extension to resolve module import error.
import { SimulationState } from '../types.ts';
// Fix: Corrected import path to use the new unambiguous constants file.
import { RESEARCH_TREE } from '../gameConstants.ts';

interface ResearchPanelProps {
  simulationState: SimulationState;
}

const ResearchNode: React.FC<{ project: typeof RESEARCH_TREE[0], state: SimulationState }> = ({ project, state }) => {
    const isCompleted = state.completedResearchIds.includes(project.id);
    const isActive = state.activeResearchId === project.id;
    const isLocked = !project.requiredProjectIds.every(reqId => state.completedResearchIds.includes(reqId));
    
    let nodeClasses = 'p-3 border rounded-lg transition-all ';
    if (isCompleted) {
        nodeClasses += 'bg-green-500/20 border-green-500';
    } else if (isActive) {
        nodeClasses += 'bg-sky-500/20 border-sky-500 animate-pulse';
    } else if (isLocked) {
        nodeClasses += 'bg-slate-700/50 border-slate-600 opacity-50';
    } else {
        nodeClasses += 'bg-slate-700/80 border-slate-600';
    }

    const progress = isActive ? (state.resources.researchPoints / project.cost) * 100 : 0;

    return (
        <div className={nodeClasses}>
            <h4 className="font-bold text-white">{project.name}</h4>
            <p className="text-xs text-slate-300 mt-1">{project.description}</p>
            <div className="text-xs font-mono mt-2 flex justify-between items-center">
                <span className="text-sky-300">Cost: {project.cost} 🧪</span>
                {isCompleted && <span className="text-green-400 font-bold">COMPLETED</span>}
            </div>
            {isActive && (
                 <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
            )}
        </div>
    );
};

const ResearchPanel: React.FC<ResearchPanelProps> = ({ simulationState }) => {
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <p className="text-sm text-slate-400">
        The colony researches new technologies autonomously when a Research Bench is built and basic needs are met.
      </p>
      {RESEARCH_TREE.map(project => (
        <ResearchNode key={project.id} project={project} state={simulationState} />
      ))}
    </div>
  );
};

export default ResearchPanel;
