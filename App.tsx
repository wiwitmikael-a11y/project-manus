import React, { useState, useEffect, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';
import SimulationDashboard from './components/SimulationDashboard.tsx';
import { generateWorldElements } from './services/geminiService.ts';
import { SimulationState, Agent, Gender, GameEvent, GameEventType } from './types.ts';
import { generateMarkovName } from './services/markovService.ts';
import { assetLoader } from './assets.ts';

type AppPhase = 'welcome' | 'genesis' | 'simulation';

const generateInitialAgents = (count: number): Agent[] => {
  const agents: Agent[] = [];
  for (let i = 0; i < count; i++) {
    const gender: Gender = Math.random() > 0.5 ? 'male' : 'female';
    agents.push({
      id: `agent-${i}`,
      name: generateMarkovName(gender),
      gender: gender,
      x: 50 + (Math.random() - 0.5) * 10,
      y: 50 + (Math.random() - 0.5) * 10,
      sprite: gender === 'male' ? 'colonist_male_1' : 'colonist_female_1',
      state: 'idle',
      state_timer: Math.random() * 100,
      destination: null,
      path: null,
      task: null,
      health: { current: 100, max: 100 },
      morale: { current: Math.floor(Math.random() * 20) + 50, max: 100 },
      energy: { current: Math.floor(Math.random() * 40) + 60, max: 100 },
    });
  }
  return agents;
};

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>('welcome');
  const [initialState, setInitialState] = useState<SimulationState | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleBegin = () => {
    setPhase('genesis');
  };

  const startSimulation = useCallback(async () => {
    try {
      // Fast asset loading
      await assetLoader.loadAssets();
      
      // Fast world generation
      const worldElements = await generateWorldElements();

      const initialAgents = generateInitialAgents(3);
      const genesisEvent: GameEvent = {
        id: `event-${Date.now()}`,
        timestamp: 0,
        type: GameEventType.NARRATIVE,
        title: "The Awakening",
        description: "A small group of survivors emerge from the dust, ready to rebuild.",
        isAiGenerated: true,
      };

      const state: SimulationState = {
        tick: 0,
        isPaused: false,
        agents: initialAgents,
        resources: { food: 50, wood: 20, scrap: 10, stability: 75, researchPoints: 0 },
        events: [genesisEvent],
        world: {
            width: 100,
            height: 100,
            tileMap: Array(100).fill(null).map(() => Array(100).fill(0)),
            resourceNodes: [],
            lootContainers: [],
            placedStructures: [],
            biomes: worldElements.biomes.map((b, i) => ({ ...b, id: `biome-${i}` })),
            structures: worldElements.structures.map((s, i) => ({ ...s, id: `structure-${i}` })),
            creatures: worldElements.creatures.map((c, i) => ({ ...c, id: `creature-${i}` })),
        },
        culturalValues: {
            collectivism: 50,
            pragmatism: 50,
            spirituality: 50,
        },
        completedResearchIds: [],
        knownBlueprintIds: ['shelter_1'],
        activeResearchId: null,
      };

      setInitialState(state);
      setIsFadingOut(true);
      setTimeout(() => setPhase('simulation'), 300);

    } catch (err) {
      console.error("Genesis failed:", err);
      // Continue anyway with minimal state
      setPhase('simulation');
    }
  }, []);

  useEffect(() => {
    if (phase === 'genesis') {
      startSimulation();
    }
  }, [phase, startSimulation]);

  if (phase === 'welcome') {
    return <WelcomeScreen onBegin={handleBegin} />;
  }
  
  if (phase === 'genesis') {
    return <LoadingScreen isFadingOut={isFadingOut} />;
  }

  if (phase === 'simulation' && initialState) {
    return <SimulationDashboard initialState={initialState} />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
      <p>Loading...</p>
    </div>
  );
};

export default App;