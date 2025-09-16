
import React from 'react';
import Header from './components/Header';
import GenesisInfo from './components/GenesisInfo';
import SimulationDashboard from './components/SimulationDashboard';
import { useSimulation } from './hooks/useSimulation';
import Card from './components/common/Card';
import Spinner from './components/common/Spinner';
import { GameEventType } from './types';

const App: React.FC = () => {
  const { state, isLoading, error, togglePause } = useSimulation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans flex items-center justify-center">
        <Card>
          <div className="flex flex-col items-center justify-center h-96 gap-4 w-96">
            <Spinner />
            <h2 className="text-xl font-bold text-white animate-pulse">Menciptakan Dunia Baru...</h2>
            <p className="text-slate-400 text-center">AI sedang menenun takdir awal untuk kolonimu.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
       <div className="min-h-screen bg-slate-900 font-sans flex items-center justify-center">
        <Card>
          <div className="flex flex-col items-center justify-center h-96 gap-4 text-center w-96">
            <h2 className="text-xl font-bold text-red-500">Gagal Menciptakan Dunia</h2>
            <p className="text-slate-300 max-w-md">Terjadi kesalahan saat berkomunikasi dengan AI. Silakan periksa kunci API Anda dan coba muat ulang halaman.</p>
            <p className="text-sm bg-red-900/50 text-red-300 p-3 rounded-md border border-red-700 mt-2">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const genesisEvent = state.events.find(e => e.type === GameEventType.NARRATIVE && e.isAiGenerated);
  const foundingAgents = state.agents; // Assuming initial agents are the founders

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-1">
            <GenesisInfo
              colonyName={state.events.find(e => e.isAiGenerated)?.title || 'The Colony'} // Heuristic to get name
              genesisEvent={genesisEvent}
              culturalValues={state.culturalValues}
              foundingAgents={foundingAgents}
            />
          </div>
          <div className="lg:col-span-2">
            <SimulationDashboard state={state} togglePause={togglePause} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
