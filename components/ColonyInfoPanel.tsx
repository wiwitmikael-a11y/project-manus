import React from 'react';
// Fix: Added .ts extension to resolve module import error.
import { ColonyResources, CulturalValues, Biome, Structure, Creature, WorldData } from '../types.ts';

interface ColonyInfoPanelProps {
    resources: ColonyResources;
    culturalValues: CulturalValues;
    world: WorldData;
}

const StatDisplay: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
    <div className="flex items-center justify-between text-sm py-2 border-b border-slate-700/50 last:border-b-0">
        <div className="flex items-center">
            <span className="text-lg mr-3">{icon}</span>
            <span className="text-slate-300">{label}</span>
        </div>
        <span className="font-mono font-semibold text-white">{value}</span>
    </div>
);

const WorldElementList: React.FC<{ title: string; items: (Biome | Structure | Creature)[]; icon:string }> = ({ title, items, icon }) => (
    <div>
        <h4 className="font-semibold text-slate-200 mb-2 mt-4 flex items-center">
            <span className="text-lg mr-2">{icon}</span>
            {title}
        </h4>
        <div className="space-y-2">
            {items.map(item => (
                <div key={item.id} className="bg-slate-700/30 p-2 rounded-md border border-slate-700/50">
                    <p className="font-semibold text-slate-100 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                </div>
            ))}
             {items.length === 0 && <p className="text-xs text-slate-500 pl-2">None discovered yet.</p>}
        </div>
    </div>
);


const ColonyInfoPanel: React.FC<ColonyInfoPanelProps> = ({ resources, culturalValues, world }) => {
    return (
        <div className="space-y-4">
             <div>
                <h4 className="font-semibold text-slate-200 mb-1">Resources</h4>
                <div className="bg-slate-800/50 p-2 rounded-lg">
                    <StatDisplay label="Food" value={resources.food.toFixed(1)} icon="🍎" />
                    <StatDisplay label="Wood" value={resources.wood.toFixed(1)} icon="🌲" />
                    <StatDisplay label="Scrap" value={resources.scrap.toFixed(1)} icon="🔩" />
                    <StatDisplay label="Research" value={resources.researchPoints.toFixed(1)} icon="🧪" />
                    <StatDisplay label="Stability" value={`${resources.stability.toFixed(1)}%`} icon="🛡️" />
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-slate-200 mb-1 mt-2">Cultural Values</h4>
                 <div className="bg-slate-800/50 p-2 rounded-lg">
                    <StatDisplay label="Collectivism" value={culturalValues.collectivism.toFixed(1)} icon="🤝" />
                    <StatDisplay label="Pragmatism" value={culturalValues.pragmatism.toFixed(1)} icon="🛠️" />
                    <StatDisplay label="Spirituality" value={culturalValues.spirituality.toFixed(1)} icon="🙏" />
                </div>
            </div>

            <div className="pt-2 border-t border-slate-700/50">
                <WorldElementList title="Known Biomes" items={world.biomes} icon="🗺️" />
                <WorldElementList title="Colony Structures" items={world.structures} icon="🏕️" />
                <WorldElementList title="Local Fauna" items={world.creatures} icon="🐾" />
            </div>
        </div>
    );
};

export default ColonyInfoPanel;