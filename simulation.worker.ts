// simulation.worker.ts
import { SimulationState } from './types.ts';
import { tick } from './simulation/simulationEngine.ts';
import { generateMap, spawnResourceNodes, spawnLootContainers } from './mapGenerationService.ts';

let simulationState: SimulationState | null = null;
let intervalId: number | null = null;

const SIMULATION_SPEED_MS = 50; // Each tick is 50ms, so ~20 ticks/sec

function runSimulation() {
  if (simulationState && !simulationState.isPaused) {
    simulationState = tick(simulationState);
    // Post the updated state back to the main thread
    self.postMessage({ type: 'stateUpdate', payload: simulationState });
  }
}

self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'init':
      simulationState = payload;
      
      // Perform heavy initialization tasks within the worker
      if (simulationState) {
          simulationState.world.tileMap = generateMap(simulationState.world.width, simulationState.world.height);
          simulationState.world.resourceNodes = spawnResourceNodes(simulationState.world.tileMap, 30);
          simulationState.world.lootContainers = spawnLootContainers(simulationState.world.tileMap, 10);
      }

      // Send the fully initialized state back once
      self.postMessage({ type: 'stateUpdate', payload: simulationState });
      
      // Start the simulation loop
      if (intervalId) clearInterval(intervalId);
      intervalId = self.setInterval(runSimulation, SIMULATION_SPEED_MS);
      break;

    case 'togglePause':
      if (simulationState) {
        simulationState.isPaused = !simulationState.isPaused;
        // Immediately notify main thread of pause state change
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