
import React from 'react';
import { ColonyResources, CulturalValues, SimulationState } from '../types';

import Card from './common/Card';
import Button from './common/Button';
import AgentCard from './AgentCard';
import EventLog from './EventLog';
import GameCanvas from './GameCanvas';

const ResourceDisplay: React.FC<{ resources: ColonyResources }> = ({ resources }) => (
  <div className="grid grid-cols-3 gap-4 text-center">
    <div>
      <p className="text-sm text-slate-400">Food</p>
      <p className="text-xl font-bold text-green-400">{Math.floor(resources.food)}</p>
    </div>
    <div>
      <p className="text-sm text-slate-400">Wood</p>
      <p className="text-xl font-bold text-yellow-600">{Math.floor(resources.wood)}</p>
    </div>
    <div>
      <p className="text-sm text-slate-400">Stability</p>
      <p className="text-xl font-bold text-sky-400">{Math.floor(resources.stability)}%</p>
    </div>
  </div>
);

const CulturalValuesDisplay: React.FC<{ values: CulturalValues }> = ({ values }) => (
  <div>
      <h3 className="text-lg font-bold text-white mb-3">Cultural DNA</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-300">Collectivism</span>
          <span className="font-mono">{values.collectivism.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className={`bg-purple-500 h-2.5 rounded-full`} style={{ width: `${values.collectivism}%` }}></div>
        </div>
         <div className="flex justify-between items-center pt-1">
          <span className="text-slate-300">Pragmatism</span>
          <span className="font-mono">{values.pragmatism.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className={`bg-orange-500 h-2.5 rounded-full`} style={{ width: `${values.pragmatism}%` }}></div>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-slate-300">Spirituality</span>
          <span className="font-mono">{values.spirituality.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className={`bg-teal-500 h-2.5 rounded-full`} style={{ width: `${values.spirituality}%` }}></div>
        </div>
      </div>
  </div>
);

interface SimulationDashboardProps {
  state: SimulationState;
  togglePause: () => void;
}

const SimulationDashboard: React.FC<SimulationDashboardProps> = ({ state, togglePause }) => {
  return (
    <div className="flex flex-col gap-6">
       <Card>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Simulation View - Day {state.day}</h2>
             <Button onClick={togglePause} variant={state.isPaused ? 'secondary' : 'primary'}>
                {state.isPaused ? 'Resume' : 'Pause'} Simulation
            </Button>
        </div>
        <GameCanvas agents={state.agents} day={state.day} />
      </Card>

      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white">Colony Status</h2>
            <p className="text-sm text-slate-400">Overview of your colony's resources and culture.</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <ResourceDisplay resources={state.resources} />
            <CulturalValuesDisplay values={state.culturalValues} />
        </div>
      </Card>

      <Card title="Colonists">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </Card>

      <EventLog events={state.events} />
    </div>
  );
};

export default SimulationDashboard;
