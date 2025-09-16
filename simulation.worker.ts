// simulation.worker.ts
// Fix: Added .ts extension to resolve module import error.
import { runSimulationTick } from './simulation/simulationEngine.ts';
// Fix: Added .ts extension to resolve module import error.
import { runColonyAI } from './simulation/colonyAI.ts';
// Fix: Added .ts extension to resolve module import error.
import { SimulationState } from './types.ts';
import { generateMap, spawnResourceNodes, spawnLootContainers } from './services/mapGenerationService';

let simulationState: SimulationState | null = null;
let intervalId: number | null = null;
const TICK_RATE_MS = 100; // 10 ticks per second

self.onmessage = (e: MessageEvent<{ type: string; payload?: any }>) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'start':
      simulationState = payload as SimulationState;
      // Generate the world map and resource nodes when the simulation starts
      if (simulationState) {
        simulationState.world.tileMap = generateMap(simulationState.world.width, simulationState.world.height);
        simulationState.world.resourceNodes = spawnResourceNodes(simulationState.world.tileMap, 20); // Tambah 20 node sumber daya
        simulationState.world.lootContainers = spawnLootContainers(simulationState.world.tileMap, 15);
        simulationState.world.placedStructures = [];
      }
      if (simulationState && !simulationState.isPaused) {
        startSimulation();
      }
      break;
    case 'pause':
      stopSimulation();
      if (simulationState) {
          simulationState.isPaused = true;
      }
      break;
    case 'resume':
      if (simulationState) {
        simulationState.isPaused = false;
        startSimulation();
      }
      break;
    // Menghapus case 'place_structure' karena sekarang ditangani oleh AI
  }
};

function startSimulation() {
  if (intervalId !== null) return; // Already running
  
  intervalId = self.setInterval(() => {
    if (simulationState) {
      // Jalankan AI Perencana Koloni secara berkala (misal, setiap jam dalam game)
      if (simulationState.tick === 0) {
        simulationState = runColonyAI(simulationState);
      }
      simulationState = runSimulationTick(simulationState);
      self.postMessage(simulationState);
    }
  }, TICK_RATE_MS);
}

function stopSimulation() {
  if (intervalId !== null) {
    self.clearInterval(intervalId);
    intervalId = null;
  }
}