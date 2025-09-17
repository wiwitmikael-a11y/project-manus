// simulation.worker.js - Compiled worker for production
import { tick } from './simulation/simulationEngine.js';
import { generateMap, spawnResourceNodes, spawnLootContainers } from './services/mapGenerationService.js';

let simulationState = null;
let intervalId = null;

const SIMULATION_SPEED_MS = 50;

function runSimulation() {
  if (simulationState && !simulationState.isPaused) {
    simulationState = tick(simulationState);
    self.postMessage({ type: 'stateUpdate', payload: simulationState });
  }
}

self.onmessage = (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'init':
      simulationState = payload;
      
      if (simulationState) {
          simulationState.world.tileMap = generateMap(simulationState.world.width, simulationState.world.height);
          simulationState.world.resourceNodes = spawnResourceNodes(simulationState.world.tileMap, 30);
          simulationState.world.lootContainers = spawnLootContainers(simulationState.world.tileMap, 10);
      }

      self.postMessage({ type: 'stateUpdate', payload: simulationState });
      
      if (intervalId) clearInterval(intervalId);
      intervalId = self.setInterval(runSimulation, SIMULATION_SPEED_MS);
      break;

    case 'togglePause':
      if (simulationState) {
        simulationState.isPaused = !simulationState.isPaused;
        self.postMessage({ type: 'stateUpdate', payload: simulationState });
      }
      break;

    case 'stop':
      if (intervalId) {
        self.clearInterval(intervalId);
        intervalId = null;
      }
      break;

    default:
      console.warn('Unknown message type received in worker:', type);
  }
};