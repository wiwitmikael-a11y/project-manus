
// components/AgentCard.tsx
import React from 'react';
import { Agent } from '../types.ts';

interface AgentCardProps {
  agent: Agent;
}

const StatBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
    <div>
        <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-slate-300">{label}</span>
            <span className="font-mono text-slate-400">{value.toFixed(0)} / {max}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
            <div className={`${color} h-2 rounded-full`} style={{ width: `${(value / max) * 100}%` }}></div>
        </div>
    </div>
);

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
        <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-3xl font-bold text-amber-400 border-2 border-slate-600">
                {agent.name.charAt(0)}
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                <p className="text-sm text-slate-400 capitalize">{agent.gender}</p>
            </div>
        </div>
        <div className="mt-4 space-y-3">
            <StatBar label="Health" value={agent.health.current} max={agent.health.max} color="bg-red-500" />
            <StatBar label="Morale" value={agent.morale.current} max={agent.morale.max} color="bg-sky-500" />
            <StatBar label="Energy" value={agent.energy.current} max={agent.energy.max} color="bg-yellow-500" />
        </div>
    </div>
  );
};

export default AgentCard;
