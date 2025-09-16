import React from 'react';
import { ColonyResources, CulturalValues } from '../types';

interface ColonyInfoPanelProps {
    resources: ColonyResources;
    culturalValues: CulturalValues;
}

const StatDisplay: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
    <div className="flex items-center justify-between text-sm py-2 border-b border-slate-700/50">
        <div className="flex items-center">
            <span className="text-lg mr-3">{icon}</span>
            <span className="text-slate-300">{label}</span>
        </div>
        <span className="font-mono font-semibold text-white">{value}</span>
    </div>
);

const ColonyInfoPanel: React.FC<ColonyInfoPanelProps> = ({ resources, culturalValues }) => {
    return (
        <div className="space-y-4">
             <div>
                <h4 className="font-semibold text-slate-200 mb-1">Resources</h4>
                <StatDisplay label="Food" value={resources.food.toFixed(1)} icon="🍎" />
                <StatDisplay label="Wood" value={resources.wood.toFixed(1)} icon="🌲" />
                <StatDisplay label="Stability" value={`${resources.stability.toFixed(1)}%`} icon="🛡️" />
            </div>

            <div>
                <h4 className="font-semibold text-slate-200 mb-1 mt-4">Cultural Values</h4>
                <StatDisplay label="Collectivism" value={culturalValues.collectivism.toFixed(1)} icon="🤝" />
                <StatDisplay label="Pragmatism" value={culturalValues.pragmatism.toFixed(1)} icon="🛠️" />
                <StatDisplay label="Spirituality" value={culturalValues.spirituality.toFixed(1)} icon="🙏" />
            </div>
        </div>
    );
};

export default ColonyInfoPanel;
