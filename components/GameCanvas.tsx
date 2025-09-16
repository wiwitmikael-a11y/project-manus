// components/GameCanvas.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SimulationState, Agent } from '../types.ts';
import { assetLoader } from '../assets.ts';
import { spritesheetMapping } from '../assets/assetMapping.ts';
import { terrainMapping } from '../assets/terrainAssetMapping.ts';

interface GameCanvasProps {
  simulationState: SimulationState;
  selectedAgentId: string | null;
}

const TILE_SIZE = terrainMapping.tileSize; // e.g., 128
const DRAW_TILE_SIZE = 64; // Size to draw tiles on screen
const CAMERA_SMOOTHING = 0.05;

const GameCanvas: React.FC<GameCanvasProps> = ({ simulationState, selectedAgentId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camera, setCamera] = useState({ x: 50 * DRAW_TILE_SIZE, y: 50 * DRAW_TILE_SIZE });
  // Fix: The `useRef` hook requires an initial value but was called without one.
  // Provided `null` as the initial value and updated the type to `number | null`.
  const animationFrameId = useRef<number | null>(null);

  const getAgentDirection = (dx: number, dy: number): { dir: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW', flip: boolean } => {
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    // This logic maps angles to the 5 directions available in the spritesheet (S, SE, E, NE, N)
    // and determines if the sprite needs to be flipped horizontally for W, SW, NW.
    if (angle >= -22.5 && angle < 22.5) return { dir: 'E', flip: false }; // East
    if (angle >= 22.5 && angle < 67.5) return { dir: 'SE', flip: false }; // South-East
    if (angle >= 67.5 && angle < 112.5) return { dir: 'S', flip: false }; // South
    if (angle >= 112.5 && angle < 157.5) return { dir: 'SE', flip: true }; // South-West (Flipped SE)
    if (angle >= 157.5 || angle < -157.5) return { dir: 'E', flip: true }; // West (Flipped E)
    if (angle >= -157.5 && angle < -112.5) return { dir: 'NE', flip: true }; // North-West (Flipped NE)
    if (angle >= -112.5 && angle < -67.5) return { dir: 'N', flip: false }; // North
    if (angle >= -67.5 && angle < -22.5) return { dir: 'NE', flip: false }; // North-East
    return { dir: 'S', flip: false }; // Default
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !assetLoader.loaded) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.imageSmoothingEnabled = false;

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    let targetX = camera.x;
    let targetY = camera.y;
    const selectedAgent = simulationState.agents.find(a => a.id === selectedAgentId);

    if (selectedAgent) {
        targetX = selectedAgent.x * DRAW_TILE_SIZE;
        targetY = selectedAgent.y * DRAW_TILE_SIZE;
    }
    
    // Smooth camera movement
    const newCameraX = camera.x + (targetX - camera.x) * CAMERA_SMOOTHING;
    const newCameraY = camera.y + (targetY - camera.y) * CAMERA_SMOOTHING;
    
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2 - newCameraX, height / 2 - newCameraY);

    // --- Draw Terrain ---
    const terrainAtlas = assetLoader.getImage('terrain_atlas');
    if (terrainAtlas && simulationState.world.tileMap.length > 0) {
      const startCol = Math.floor((newCameraX - width / 2) / DRAW_TILE_SIZE);
      const endCol = Math.ceil((newCameraX + width / 2) / DRAW_TILE_SIZE);
      const startRow = Math.floor((newCameraY - height / 2) / DRAW_TILE_SIZE);
      const endRow = Math.ceil((newCameraY + height / 2) / DRAW_TILE_SIZE);

      for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
          if (y < 0 || y >= simulationState.world.tileMap.length || x < 0 || x >= simulationState.world.tileMap[0].length) continue;
          const tileId = simulationState.world.tileMap[y][x];
          const sx = (tileId % terrainMapping.atlasWidthInTiles) * TILE_SIZE;
          const sy = Math.floor(tileId / terrainMapping.atlasWidthInTiles) * TILE_SIZE;
          ctx.drawImage(terrainAtlas, sx, sy, TILE_SIZE, TILE_SIZE, x * DRAW_TILE_SIZE, y * DRAW_TILE_SIZE, DRAW_TILE_SIZE, DRAW_TILE_SIZE);
        }
      }
    }
    
    // --- Draw Agents ---
    simulationState.agents.forEach((agent: Agent) => {
      const spritesheet = assetLoader.getImage(agent.sprite);
      if (!spritesheet) return;

      const animType = agent.state === 'moving' ? 'walk' : 'idle';
      const animData = spritesheetMapping[agent.sprite].animations[animType];
      const frame = Math.floor(simulationState.tick / animData.speed) % animData.frames;

      let directionInfo = { dir: 'S' as 'N' | 'NE' | 'E' | 'SE' | 'S' , flip: false };
      if (agent.destination) {
          const dx = agent.destination.x - agent.x;
          const dy = agent.destination.y - agent.y;
          if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
              const result = getAgentDirection(dx, dy);
              directionInfo = { dir: result.dir as any, flip: result.flip };
          }
      }
      
      const row = animData.rows[directionInfo.dir];
      const sx = frame * spritesheetMapping[agent.sprite].frameSize;
      const sy = row * spritesheetMapping[agent.sprite].frameSize;
      
      ctx.save();
      const drawX = agent.x * DRAW_TILE_SIZE;
      const drawY = agent.y * DRAW_TILE_SIZE;
      
      if (directionInfo.flip) {
          ctx.translate(drawX, 0);
          ctx.scale(-1, 1);
          ctx.translate(-drawX, 0);
      }
      
      // Draw selection circle
      if (agent.id === selectedAgentId) {
          ctx.beginPath();
          ctx.arc(drawX, drawY + DRAW_TILE_SIZE / 4, DRAW_TILE_SIZE / 3, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
          ctx.fill();
      }

      ctx.drawImage(
        spritesheet, sx, sy,
        spritesheetMapping[agent.sprite].frameSize,
        spritesheetMapping[agent.sprite].frameSize,
        drawX - DRAW_TILE_SIZE / 2,
        drawY - DRAW_TILE_SIZE / 2,
        DRAW_TILE_SIZE,
        DRAW_TILE_SIZE
      );
      ctx.restore();
    });

    ctx.restore();
    animationFrameId.current = requestAnimationFrame(draw);
  }, [simulationState, camera.x, camera.y, selectedAgentId]);

  useEffect(() => {
    // Update camera state without causing re-renders of the component itself
    let cam = { x: camera.x, y: camera.y };
    const selectedAgent = simulationState.agents.find(a => a.id === selectedAgentId);
    if (selectedAgent) {
        const targetX = selectedAgent.x * DRAW_TILE_SIZE;
        const targetY = selectedAgent.y * DRAW_TILE_SIZE;
        cam.x += (targetX - cam.x) * CAMERA_SMOOTHING;
        cam.y += (targetY - cam.y) * CAMERA_SMOOTHING;
        setCamera(cam);
    }
  }, [simulationState.tick, selectedAgentId]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [draw]);

  return <canvas ref={canvasRef} className="w-full h-full bg-slate-900" />;
};

export default GameCanvas;