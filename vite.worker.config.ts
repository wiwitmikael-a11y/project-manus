import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './simulation.worker.ts',
      name: 'SimulationWorker',
      fileName: 'simulation.worker',
      formats: ['es']
    },
    outDir: 'public',
    rollupOptions: {
      external: [],
      output: {
        format: 'es'
      }
    }
  }
});