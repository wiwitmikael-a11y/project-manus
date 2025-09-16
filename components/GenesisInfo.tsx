
import React from 'react';
import Card from './common/Card';
import { Agent, CulturalValues, GameEvent } from '../types';

interface GenesisInfoProps {
  colonyName: string;
  genesisEvent?: GameEvent;
  culturalValues: CulturalValues;
  foundingAgents: Agent[];
}

const TraitDisplay: React.FC<{ label: string; value: number; icon: string }> = ({ label, value, icon }) => (
    <div className="flex items-center text-xs bg-slate-700/50 rounded-full px-2 py-1 flex-1 justify-center">
        <span>{icon}</span>
        <span className="ml-1.5 mr-2 text-slate-300">{label}</span>
        <span className="font-mono font-semibold text-white">{value}</span>
    </div>
);

const GenesisInfo: React.FC<GenesisInfoProps> = ({ colonyName, genesisEvent, culturalValues, foundingAgents }) => {
  return (
    <Card>
      <div className="flex flex-col gap-6">
        {/* Genesis Event */}
        <div>
          <p className="text-sm text-sky-400">Genesis Log</p>
          <h2 className="text-2xl font-bold text-white">{genesisEvent?.title || colonyName}</h2>
          <p className="text-sm text-slate-300 mt-2 italic">
            {genesisEvent?.description || "The story of this colony is about to begin."}
          </p>
        </div>

        {/* Founding Principles */}
        <div className="border-t border-slate-700 pt-4">
            <h3 className="text-lg font-semibold text-white mb-3">Founding Principles</h3>
             <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Collectivism vs Individualism</span>
                  <span className="font-mono text-purple-400">{culturalValues.collectivism.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${culturalValues.collectivism}%` }}></div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-300">Pragmatism vs Idealism</span>
                  <span className="font-mono text-orange-400">{culturalValues.pragmatism.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${culturalValues.pragmatism}%` }}></div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-300">Spirituality vs Materialism</span>
                  <span className="font-mono text-teal-400">{culturalValues.spirituality.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${culturalValues.spirituality}%` }}></div>
                </div>
            </div>
        </div>

        {/* Founding Colonists */}
        <div className="border-t border-slate-700 pt-4">
            <h3 className="text-lg font-semibold text-white mb-3">Founding Colonists</h3>
            <div className="space-y-4">
                {foundingAgents.map(agent => (
                    <div key={agent.id} className="bg-slate-800/50 p-3 rounded-md">
                        <p className="font-semibold text-slate-100">{agent.name}</p>
                        <div className="flex gap-2 mt-2">
                            <TraitDisplay label="Creative" value={agent.personality.creativity} icon="🎨" />
                            <TraitDisplay label="Pragmatic" value={agent.personality.pragmatism} icon="🛠️" />
                            <TraitDisplay label="Social" value={agent.personality.social} icon="💬" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </Card>
  );
};

export default GenesisInfo;
