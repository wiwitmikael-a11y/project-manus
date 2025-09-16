// Fix: Implement the main App component to manage application state and simulation lifecycle.
import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import LoadingScreen from './components/LoadingScreen';
import SimulationViewport from './components/SimulationViewport';
// Fix: Added .ts extension to resolve module import error.
import { generateGenesis } from './services/markovService.ts';
// Fix: Added .ts extension to resolve module import error.
import { SimulationState } from './types.ts';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'welcome' | 'generating' | 'running'>('welcome');
  const [initialState, setInitialState] = useState<SimulationState | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleBeginSimulation = async () => {
    setGameState('generating');
    const genesisData = await generateGenesis();
    
    const simState: SimulationState = {
      agents: genesisData.agents,
      resources: { food: 50, wood: 20, scrap: 10, stability: 75, researchPoints: 0 },
      culturalValues: genesisData.culturalValues,
      events: [genesisData.startingEvent],
      world: {
        // FIX: Add unique IDs to world elements from genesis data to match the required types.
        biomes: genesisData.biomes.map((biome, i) => ({ ...biome, id: `biome_${i}` })),
        structures: genesisData.structures.map((structure, i) => ({ ...structure, id: `structure_${i}` })),
        creatures: genesisData.creatures.map((creature, i) => ({ ...creature, id: `creature_${i}` })),
        resourceNodes: [], // Akan diisi oleh worker
        lootContainers: [], 
        placedStructures: [], 
        width: 50, // World dimensions
        height: 50,
        tileMap: null,
      },
      day: 1,
      hour: 7, // Mulai di pagi hari
      timeOfDay: 'day',
      tick: 0,
      isPaused: true,
      // State baru untuk otonomi
      knownBlueprintIds: ['shelter_1'], // Mulai dengan mengetahui cara membuat shelter dasar
      activeResearchId: null,
      completedResearchIds: [],
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