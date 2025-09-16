import React, { useState, useCallback, useEffect } from 'react';
import { useSimulation } from './hooks/useSimulation';
import GameCanvas from './components/GameCanvas';
import CommandBar from './components/CommandBar';
import AgentCard from './components/AgentCard';
import EventLog from './components/EventLog';
import ColonyInfoPanel from './components/ColonyInfoPanel';
import WelcomeScreen from './components/WelcomeScreen';
import LoadingScreen from './components/LoadingScreen';
import GlassmorphismModal from './components/common/GlassmorphismModal';
import { Agent } from './types';

type GameState = 'welcome' | 'loading' | 'playing';

const App: React.FC = () => {
  // --- CORE ENGINE HOOKS (dimulai segera saat aplikasi dimuat) ---
  const { state, isLoading, error, togglePause } = useSimulation();
  const [isPhaserReady, setPhaserReady] = useState(false);

  // --- UI STATE ---
  const [appState, setAppState] = useState<GameState>('welcome');
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  // --- MODAL & SELECTION STATE ---
  const [isColonyPanelOpen, setColonyPanelOpen] = useState(false);
  const [isEventsPanelOpen, setEventsPanelOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // --- LOGIKA TRANSISI ---
  useEffect(() => {
    // Saat berada di layar pemuatan, periksa apakah AI dan Phaser sudah siap.
    if (appState === 'loading' && !isLoading && isPhaserReady) {
      setIsFadingOut(true);
      // Tunggu animasi fade-out selesai sebelum beralih ke game.
      const timer = setTimeout(() => {
        setAppState('playing');
        setIsFadingOut(false); // Reset untuk penggunaan di masa depan
      }, 500); // Durasi ini harus cocok dengan animasi CSS.
      return () => clearTimeout(timer);
    }
  }, [appState, isLoading, isPhaserReady]);

  // --- HANDLERS ---
  const handleAgentClick = useCallback((agentId: string) => {
    if (state) {
      const agent = state.agents.find(a => a.id === agentId);
      setSelectedAgent(agent || null);
    }
  }, [state]);

  const handleCloseAgentModal = () => setSelectedAgent(null);
  
  const startGame = () => {
    setAppState('loading');
  };

  // --- RENDER ---
  return (
    <div className="h-screen w-screen bg-slate-900 overflow-hidden">
      {/*
        GameCanvas dan container-nya selalu ada di DOM untuk memungkinkan Phaser diinisialisasi.
        Kita menggunakan CSS untuk menyembunyikannya secara visual hingga game berada dalam state 'playing'.
        Menggunakan 'visibility' lebih baik daripada 'display: none' karena tidak mempengaruhi layout atau re-inisialisasi.
      */}
      <div 
        className={`w-full h-full transition-opacity duration-500 ${appState === 'playing' ? 'opacity-100' : 'opacity-0'}`}
        style={{ visibility: appState === 'playing' ? 'visible' : 'hidden' }}
        aria-hidden={appState !== 'playing'}
      >
        <GameCanvas 
          state={state} 
          onAgentClick={handleAgentClick} 
          selectedAgentId={selectedAgent?.id || null}
          onReady={() => setPhaserReady(true)}
        />
      </div>
      
      {/* Layar yang menutupi kanvas yang tersembunyi */}
      {appState === 'welcome' && <WelcomeScreen onBegin={startGame} />}
      {(appState === 'loading' || isFadingOut) && <LoadingScreen isFadingOut={isFadingOut} />}

      {/* UI game utama, hanya dirender saat bermain */}
      {appState === 'playing' && state && (
        <div className="animate-fade-in">
          <CommandBar 
            isPaused={state.isPaused}
            onTogglePause={togglePause}
            onColonyClick={() => setColonyPanelOpen(true)}
            onEventsClick={() => setEventsPanelOpen(true)}
          />

          <GlassmorphismModal 
            isOpen={isColonyPanelOpen} 
            onClose={() => setColonyPanelOpen(false)} 
            title={`Status Koloni (Hari ke-${state.day})`}
          >
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <ColonyInfoPanel 
                  resources={state.resources} 
                  culturalValues={state.culturalValues}
                  biomes={state.biomes}
                  structures={state.structures}
                  creatures={state.creatures}
              />
            </div>
          </GlassmorphismModal>

          <GlassmorphismModal 
            isOpen={isEventsPanelOpen} 
            onClose={() => setEventsPanelOpen(false)} 
            title="Log Peristiwa"
          >
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                <EventLog events={state.events} />
            </div>
          </GlassmorphismModal>

          <GlassmorphismModal 
            isOpen={!!selectedAgent} 
            onClose={handleCloseAgentModal} 
            title={selectedAgent ? `Detail Kolonis: ${selectedAgent.name}` : ''}
          >
            {selectedAgent && <AgentCard agent={selectedAgent} />}
          </GlassmorphismModal>
        </div>
      )}

      {/* Tampilan error global */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="text-center p-8 text-red-400 bg-slate-800 rounded-lg border border-red-500/50">
            <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan Kritis</h2>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
