import React, { useRef, useEffect } from 'react';
import { SimulationState } from '../types.ts';
import { assetLoader } from '../assets.ts';
import { TILE_RENDER_SIZE } from '../gameConstants.ts';

interface GameCanvasProps {
  simulationState: SimulationState;
  camera: { x: number; y: number; zoom: number };
  selectedAgentId: string | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ simulationState, camera, selectedAgentId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Apply camera transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(camera.zoom, camera.zoom);
      ctx.translate(-camera.x, -camera.y);

      // Draw simple grid background
      drawGrid(ctx, simulationState);
      drawAgents(ctx, simulationState, selectedAgentId);
      
      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [simulationState, camera, selectedAgentId]);
  
  return <canvas ref={canvasRef} className="w-full h-full bg-slate-800" />;
};

function drawGrid(ctx: CanvasRenderingContext2D, state: SimulationState) {
  const { width, height } = state.world;
  
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  
  for (let x = 0; x <= width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_RENDER_SIZE, 0);
    ctx.lineTo(x * TILE_RENDER_SIZE, height * TILE_RENDER_SIZE);
    ctx.stroke();
  }
  
  for (let y = 0; y <= height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE_RENDER_SIZE);
    ctx.lineTo(width * TILE_RENDER_SIZE, y * TILE_RENDER_SIZE);
    ctx.stroke();
  }
}

function drawAgents(ctx: CanvasRenderingContext2D, state: SimulationState, selectedAgentId: string | null) {
  state.agents.forEach(agent => {
    const x = agent.x * TILE_RENDER_SIZE;
    const y = agent.y * TILE_RENDER_SIZE;
    
    // Draw selection indicator
    if (agent.id === selectedAgentId) {
      ctx.beginPath();
      ctx.arc(x, y, TILE_RENDER_SIZE / 2 + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Draw agent as colored circle
    ctx.beginPath();
    ctx.arc(x, y, TILE_RENDER_SIZE / 3, 0, 2 * Math.PI);
    ctx.fillStyle = agent.gender === 'male' ? '#ef4444' : '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw name
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(agent.name, x, y - TILE_RENDER_SIZE / 2 - 5);
  });
}

export default GameCanvas;