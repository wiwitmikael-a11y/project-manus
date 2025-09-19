
import React, { useRef, useEffect, useState } from 'react';
import { SimulationState } from '../types.ts';
import { IllusionEngine } from '../IllusionEngine.ts';
import { TILE_RENDER_SIZE } from '../gameConstants.ts';

interface GameCanvasProps {
  simulationState: SimulationState;
  camera: { x: number; y: number; zoom: number };
  selectedAgentId: string | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ simulationState, camera, selectedAgentId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<IllusionEngine | null>(null);

  // Initialize the rendering engine once the canvas is available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !engine) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setEngine(new IllusionEngine(ctx));
      }
    }
  }, [engine]);

  // The main rendering loop, driven by requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engine) return;
    
    let animationFrameId: number;

    const render = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Ensure canvas resolution matches its display size for sharpness
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        }

        const effectiveWidth = rect.width;
        const effectiveHeight = rect.height;

        // Set dynamic background color based on in-game time
        canvas.style.backgroundColor = engine.getAtmosphereColor(simulationState.tick);

        // --- Camera and Scene Transformation ---
        const camGridX = camera.x / TILE_RENDER_SIZE;
        const camGridY = camera.y / TILE_RENDER_SIZE;
        const { screenX: camScreenX, screenY: camScreenY } = engine.worldToScreen(camGridX, camGridY);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        
        // Center the view and apply zoom and camera position
        ctx.translate(effectiveWidth / 2, effectiveHeight / 2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camScreenX, -camScreenY);
        
        // Render the entire scene using the engine
        engine.render(simulationState, camera, selectedAgentId);
        
        ctx.restore();
        animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [simulationState, camera, selectedAgentId, engine]);
  
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default GameCanvas;
