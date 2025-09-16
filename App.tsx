// Fix: Implement the main App component to manage application state and simulation lifecycle.
import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import LoadingScreen from './components/LoadingScreen';
import SimulationViewport from './components/SimulationViewport';
import { generateGenesis } from './services/markovService';
import { SimulationState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'welcome' | 'generating' | 'running'>('welcome');
  const [initialState, setInitialState] = useState<SimulationState | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleBeginSimulation = async () => {
    setGameState('generating');
    const genesisData = await generateGenesis();
    
    const simState: SimulationState = {
      agents: genesisData.agents,
      resources: { food: 50, wood: 20, scrap: 10, stability: 75 },
      culturalValues: genesisData.culturalValues,
      events: [genesisData.startingEvent],
      world: {
        biomes: genesisData.biomes,
        structures: genesisData.structures,
        creatures: genesisData.creatures,
        resourceNodes: [], // Akan diisi oleh worker
        width: 50, // World dimensions
        height: 50,
        tileMap: null,
      },
      day: 1,
      hour: 7, // Mulai di pagi hari
      timeOfDay: 'day',
      tick: 0,
      isPaused: true,
    };

    setInitialState(simState);
    
    setIsFadingOut(true);
    setTimeout(() => {
        setGameState('running');
    }, 500); // Match fade-out duration
  };

  if (gameState === 'welcome') {
    return <WelcomeScreen onBegin={handleBeginSimulation} />;
  }

  if (gameState === 'generating' || !initialState) {
    return <LoadingScreen isFadingOut={isFadingOut} />;
  }
  
  if (gameState === 'running' && initialState) {
    return <SimulationViewport initialState={initialState} />;
  }

  return null;
};

export default App;
