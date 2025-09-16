
// components/GameCanvas.tsx
import React, { useRef, useEffect, useCallback } from 'react';
// Fix: Added .ts extension to resolve module import error.
import { SimulationState, Agent } from '../types.ts';
import { assetLoader } from '../assets';
// Fix: Added .ts extension to resolve module import error.
import { spritesheetMapping, SpritesheetData } from '../assets/assetMapping.ts';
// Fix: Added .ts extension to resolve module import error.
import { terrainMapping } from '../assets/terrainAssetMapping.ts';
// Fix: Added .ts extension to resolve module import error.
import { resourceMapping } from '../assets/resourceAssetMapping.ts';

export interface Camera {
  x: number;
  y: number;
  zoom: number;
  targetX?: number;
  targetY?: number;
}

interface GameCanvasProps {
  simulationState: SimulationState;
  cameraState: Camera;
  setCamera: React.Dispatch<React.SetStateAction<Camera>>;
  selectedAgent: Agent | null;
  onAgentClick: (agent: Agent) => void;
}

const TILE_SIZE = 128; // The base size of tiles in the assets
const AGENT_CLICK_RADIUS = 0.5; // In world units (tiles)

const GameCanvas: React.FC<GameCanvasProps> = ({ simulationState, cameraState, setCamera, selectedAgent, onAgentClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const draw = useCallback((ctx: CanvasRenderingContext2D, camera: Camera) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Camera Transform ---
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x * TILE_SIZE, -camera.y * TILE_SIZE);

    const worldView = {
      left: camera.x - (canvas.width / 2 / camera.zoom / TILE_SIZE),
      right: camera.x + (canvas.width / 2 / camera.zoom / TILE_SIZE),
      top: camera.y - (canvas.height / 2 / camera.zoom / TILE_SIZE),
      bottom: camera.y + (canvas.height / 2 / camera.zoom / TILE_SIZE),
    };
    
    // --- Render Terrain ---
    const terrainAtlas = assetLoader.getImage('terrain_atlas');
    if (terrainAtlas && simulationState.world.tileMap) {
      const { tileMap } = simulationState.world;
      const startY = Math.max(0, Math.floor(worldView.top));
      const endY = Math.min(tileMap.length, Math.ceil(worldView.bottom));
      const startX = Math.max(0, Math.floor(worldView.left));
      const endX = Math.min(tileMap[0].length, Math.ceil(worldView.right));

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const tileId = tileMap[y][x];
          const sx = (tileId % 8) * terrainMapping.tileSize;
          const sy = Math.floor(tileId / 8) * terrainMapping.tileSize;
          ctx.drawImage(terrainAtlas, sx, sy, terrainMapping.tileSize, terrainMapping.tileSize, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // --- Render Resources ---
    const resourceAtlas = assetLoader.getImage('resource_atlas');
    if (resourceAtlas) {
        simulationState.world.resourceNodes.forEach(node => {
            if (node.x > worldView.left && node.x < worldView.right && node.y > worldView.top && node.y < worldView.bottom) {
                const spriteData = resourceMapping.nodes[node.type];
                ctx.drawImage(resourceAtlas, spriteData.sx, spriteData.sy, resourceMapping.tileSize, resourceMapping.tileSize, (node.x - 0.5) * TILE_SIZE, (node.y - 0.5) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        });
    }

    // --- Render Agents (sorted by Y for correct layering) ---
    const sortedAgents = [...simulationState.agents].sort((a, b) => a.y - b.y);
    sortedAgents.forEach(agent => {
        // Draw selection circle
        if (selectedAgent?.id === agent.id) {
            ctx.beginPath();
            ctx.arc(agent.x * TILE_SIZE, agent.y * TILE_SIZE, (TILE_SIZE / 2) * 0.7, 0, Math.PI * 2);
            ctx.strokeStyle = '#f59e0b'; // amber-500
            ctx.lineWidth = 4 / camera.zoom;
            ctx.stroke();
        }

        const spritesheet = assetLoader.getImage(agent.spritesheetKey);
        const sheetData = spritesheetMapping[agent.spritesheetKey];
        if (spritesheet && sheetData) {
            drawAgent(ctx, agent, spritesheet, sheetData);
        }
    });

    ctx.restore();
  }, [simulationState, selectedAgent]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Smooth camera movement
      setCamera(prev => {
        const targetX = prev.targetX ?? prev.x;
        const targetY = prev.targetY ?? prev.y;
        const newX = prev.x + (targetX - prev.x) * 0.1;
        const newY = prev.y + (targetY - prev.y) * 0.1;
        const newCam = { ...prev, x: newX, y: newY };
        draw(ctx, newCam);
        return newCam;
      });
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, setCamera]);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  
  // --- Input Handlers ---
  const getMouseWorldPos = (e: React.MouseEvent<HTMLCanvasElement>): { x: number, y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = cameraState.x + (mouseX - canvas.width / 2) / cameraState.zoom / TILE_SIZE;
    const worldY = cameraState.y + (mouseY - canvas.height / 2) / cameraState.zoom / TILE_SIZE;
    
    return { x: worldX, y: worldY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging.current && (e.clientX !== lastMousePos.current.x || e.clientY !== lastMousePos.current.y)) {
        // This was a drag, not a click
        isDragging.current = false;
        return;
    }
    isDragging.current = false;
    
    const worldPos = getMouseWorldPos(e);
    const clickedAgent = simulationState.agents.find(agent => {
        const dx = agent.x - worldPos.x;
        const dy = agent.y - worldPos.y;
        return Math.sqrt(dx*dx + dy*dy) < AGENT_CLICK_RADIUS;
    });

    if (clickedAgent) {
        onAgentClick(clickedAgent);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setCamera(prev => ({
        ...prev,
        x: prev.x - dx / prev.zoom / TILE_SIZE,
        y: prev.y - dy / prev.zoom / TILE_SIZE,
        targetX: prev.x - dx / prev.zoom / TILE_SIZE, // Update target to stop interpolation
        targetY: prev.y - dy / prev.zoom / TILE_SIZE,
    }));
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    setCamera(prev => {
        const newZoom = e.deltaY < 0 ? prev.zoom * zoomFactor : prev.zoom / zoomFactor;
        return { ...prev, zoom: Math.max(0.5, Math.min(4, newZoom)) };
    });
  };

  return <canvas 
    ref={canvasRef} 
    className="w-full h-full"
    onMouseDown={handleMouseDown}
    onMouseUp={handleMouseUp}
    onMouseMove={handleMouseMove}
    onMouseLeave={() => isDragging.current = false}
    onWheel={handleWheel}
  />;
};

// Helper function to draw a single agent
function drawAgent(ctx: CanvasRenderingContext2D, agent: Agent, spritesheet: HTMLImageElement, sheetData: SpritesheetData) {
    const { frameSize, animations } = sheetData;
    const anim = animations[agent.animationState] || animations.idle;

    // --- Determine row based on direction ---
    // Normalize angle to [0, 2PI]
    let angle = agent.direction % (2 * Math.PI);
    if (angle < 0) angle += 2 * Math.PI;

    // Slice PI*2 into 8 sections for 8 directions
    const slice = Math.PI / 4;
    let dir: keyof typeof anim.rows;
    let flip = false;

    if (angle >= 0 && angle <= slice * 1) dir = 'E'; // E
    else if (angle > slice * 1 && angle <= slice * 3) dir = 'SE'; // SE to S
    else if (angle > slice * 3 && angle <= slice * 5) { dir = 'E'; flip = true; } // SW to W
    else if (angle > slice * 5 && angle <= slice * 7) { dir = 'NE'; flip = true; } // NW to N
    else dir = 'E'; // N to NE is just E in this spritesheet

    // Refined logic for N/S which are more distinct
    if (angle > slice * 2 && angle <= slice * 3) dir = 'S';
    else if (angle > slice * 6 && angle <= slice * 7) dir = 'N';


    const sy = anim.rows[dir] * frameSize;
    const sx = agent.animationFrame * frameSize;

    ctx.save();
    ctx.translate(agent.x * TILE_SIZE, agent.y * TILE_SIZE);
    if (flip) {
      ctx.scale(-1, 1);
    }
    
    // Draw the sprite centered on the agent's position
    ctx.drawImage(
      spritesheet,
      sx, sy, frameSize, frameSize,
      -frameSize / 2, -frameSize, // Offset to make feet at y=0
      frameSize, frameSize
    );
    ctx.restore();
}

export default GameCanvas;
