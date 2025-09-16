import React from 'react';
import { Agent } from '../types';

const ProgressBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <div className="w-full bg-slate-700 rounded-full h-2.5">
    <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
  </div>
);

const TraitDisplay: React.FC<{ label: string; value: number; icon: string }> = ({ label, value, icon }) => (
    <div className="flex items-center text-xs bg-slate-700/50 rounded-full px-2 py-1">
        <span>{icon}</span>
        <span className="ml-1.5 mr-2 text-slate-300">{label}</span>
        <span className="font-mono font-semibold text-white">{value}</span>
    </div>
);


const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const moodColor = agent.mood > 60 ? 'bg-green-500' : agent.mood > 30 ? 'bg-yellow-500' : 'bg-red-500';
  const hungerColor = agent.hunger > 50 ? 'bg-red-500' : agent.hunger > 20 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col gap-3">
      <div>
        <h3 className="font-bold text-white">{agent.name}</h3>
        <p className="text-sm text-slate-400 italic">Task: {agent.task}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
          <TraitDisplay label="Creative" value={agent.personality.creativity} icon="🎨" />
          <TraitDisplay label="Pragmatic" value={agent.personality.pragmatism} icon="🛠️" />
          <TraitDisplay label="Social" value={agent.personality.social} icon="💬" />
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Mood</span>
              <span className="font-mono">{agent.mood.toFixed(0)}%</span>
            </div>
            <ProgressBar value={agent.mood} color={moodColor} />
        </div>

        <div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Hunger</span>
              <span className="font-mono">{agent.hunger.toFixed(0)}%</span>
            </div>
            <ProgressBar value={agent.hunger} color={hungerColor} />
        </div>
      </div>

      <div className="text-xs space-y-1 pt-2 border-t border-slate-700/50">
          <p className="flex justify-between"><span>Foraging:</span> <span className="font-mono">{agent.skills.foraging}</span></p>
          <p className="flex justify-between"><span>Woodcutting:</span> <span className="font-mono">{agent.skills.woodcutting}</span></p>
          <p className="flex justify-between"><span>Crafting:</span> <span className="font-mono">{agent.skills.crafting}</span></p>
      </div>
    </div>
  );
};

export default AgentCard;
