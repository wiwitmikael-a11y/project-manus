import React, { useState, useCallback, useEffect, useRef } from 'react';
import SimulationViewport from './components/SimulationViewport';
import CommandBar from './components/CommandBar';
import AgentCard from './components/AgentCard';
import EventLog from './components/EventLog';
import ColonyInfoPanel from './components/ColonyInfoPanel';
import WelcomeScreen from './components/WelcomeScreen';
import LoadingScreen from './components/LoadingScreen';
import GlassmorphismModal from './components/common/GlassmorphismModal';
import { Agent, SimulationState } from './types';
import { generateGenesis } from './services/markovService';
import { runSimulationTick } from './simulation/simulationEngine';

type AppFlowState = 'welcome' | 'loading' | 'playing';

const TICK_RATE = 1000; // ms per tick

const App: React.FC = () => {
  // --- STATE MANAGEMENT TERPUSAT ---
  const [appFlowState, setAppFlowState] = useState<AppFlowState>('welcome');
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // --- UI State ---
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isColonyPanelOpen, setColonyPanelOpen] = useState(false);
  const [isEventsPanelOpen, setEventsPanelOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // --- GAME LOOP / SIMULATION TICK LOGIC ---
  useEffect(() => {
    if (appFlowState === 'playing' && simulationState && !simulationState.isPaused) {
      const intervalId = setInterval(() => {
        // Panggil mesin simulasi murni untuk menghitung state berikutnya
        const nextState = runSimulationTick(simulationState);
        setSimulationState(nextState);
      }, TICK_RATE);
      return () => clearInterval(intervalId);
    }
  }, [appFlowState, simulationState]);

  // --- ALUR STARTUP SEKUENSIAL YANG DIPERKUAT ---
  const startGame = useCallback(() => {
    setAppFlowState('loading');
    setError(null);
    setSimulationState(null);

    // TAHAP 2: GENERASI DUNIA (HANYA AI)
    generateGenesis()
      .then(genesisData => {
        const initialState: SimulationState = {
          agents: genesisData.agents,
          resources: { food: 50, wood: 20, stability: 80 },
          culturalValues: genesisData.culturalValues,
          events: [genesisData.startingEvent],
          day: 1,
          tick: 0,
          isPaused: false,
          world: {
            biomes: genesisData.biomes,
            structures: genesisData.structures,
            creatures: genesisData.creatures,
            width: 50,
            height: 50,
          }
        };
        // AI Selesai. Data dunia sekarang ada. Ini akan memicu transisi.
        setSimulationState(initialState);
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err.message : "Gagal menghasilkan dunia AI.";
        setError(errorMessage);
        setAppFlowState('welcome'); // Kembali ke welcome screen jika gagal
      });
  }, []);

  // Transisi dari loading ke playing HANYA SETELAH AI siap.
  useEffect(() => {
    if (simulationState && appFlowState === 'loading') {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setAppFlowState('playing');
        setIsFadingOut(false);
      }, 500); // Waktu untuk animasi fade-out
      return () => clearTimeout(timer);
    }
  }, [simulationState, appFlowState]);

  // --- HANDLERS ---
  const handleAgentClick = useCallback((agentId: string) => {
    if (simulationState) {
      const agent = simulationState.agents.find(a => a.id === agentId);
      setSelectedAgent(agent || null);
    }
  }, [simulationState]);

  const togglePause = useCallback(() => {
    setSimulationState(currentState => 
      currentState ? { ...currentState, isPaused: !currentState.isPaused } : null
    );
  }, []);

  const handleCloseAgentModal = () => setSelectedAgent(null);

  // --- RENDER ---
  const showGameUI = appFlowState === 'playing' && simulationState;

  return (
    <div className="h-screen w-screen bg-slate-900 overflow-hidden">
      {appFlowState === 'welcome' && <WelcomeScreen onBegin={startGame} />}
      
      {(appFlowState === 'loading' || isFadingOut) && <LoadingScreen isFadingOut={isFadingOut} />}

      {/* Viewport berbasis DOM yang baru dan stabil */}
      {simulationState && appFlowState !== 'welcome' && (
         <SimulationViewport 
            state={simulationState} 
            onAgentClick={handleAgentClick} 
            selectedAgentId={selectedAgent?.id || null}
          />
      )}

      {showGameUI && (
        <div className="animate-fade-in">
          <CommandBar 
            isPaused={simulationState.isPaused}
            onTogglePause={togglePause}
            onColonyClick={() => setColonyPanelOpen(true)}
            onEventsClick={() => setEventsPanelOpen(true)}
          />
          <GlassmorphismModal 
            isOpen={isColonyPanelOpen} 
            onClose={() => setColonyPanelOpen(false)} 
            title={`Status Koloni (Hari ke-${simulationState.day})`}
          >
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <ColonyInfoPanel 
                  resources={simulationState.resources} 
                  culturalValues={simulationState.culturalValues}
                  world={simulationState.world}
              />
            </div>
          </GlassmorphismModal>
          <GlassmorphismModal 
            isOpen={isEventsPanelOpen} 
            onClose={() => setEventsPanelOpen(false)} 
            title="Log Peristiwa"
          >
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                <EventLog events={simulationState.events} />
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

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="text-center p-8 text-red-400 bg-slate-800 rounded-lg border border-red-500/50">
            <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan Kritis Saat Startup</h2>
            <p>{error}</p>
             <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-500">
                Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;