import React, { useRef, useEffect } from 'react';
import { SimulationState } from '../types.ts';
import { assetLoader } from '../assets.ts';
import { terrainMapping } from '../assets/terrainAssetMapping.ts';
import { spritesheetMapping } from '../assets/assetMapping.ts';
import { resourceMapping } from '../assets/resourceAssetMapping.ts';

interface GameCanvasProps {
  simulationState: SimulationState;
  camera: { x: number; y: number; zoom: number };
  selectedAgentId: string | null;
}

const TILE_RENDER_SIZE = 64; // How big to draw each tile on screen

const GameCanvas: React.FC<GameCanvasProps> = ({ simulationState, camera, selectedAgentId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !assetLoader.loaded) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on display density
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const effectiveWidth = rect.width;
    const effectiveHeight = rect.height;


    let animationFrameId: number;

    const render = (time: number) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        
        // Apply camera transformations
        ctx.translate(effectiveWidth / 2, effectiveHeight / 2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);

        // Draw game elements
        drawTerrain(ctx, simulationState);
        drawResources(ctx, simulationState);
        drawAgents(ctx, simulationState, selectedAgentId, time);
        
        ctx.restore();
        animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [simulationState, camera, selectedAgentId]);

  if (!assetLoader.loaded) {
    return <div className="flex items-center justify-center h-full w-full bg-slate-900 text-amber-400">Loading graphical assets...</div>;
  }
  
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

function drawTerrain(ctx: CanvasRenderingContext2D, state: SimulationState) {
    const terrainAtlas = assetLoader.getImage('terrain_atlas');
    if (!terrainAtlas) return;

    const { tileMap, width, height } = state.world;
    const { tileSize, atlasWidthInTiles } = terrainMapping;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tileId = tileMap[y][x];
            const sourceX = (tileId % atlasWidthInTiles) * tileSize;
            const sourceY = Math.floor(tileId / atlasWidthInTiles) * tileSize;
            
            ctx.drawImage(
                terrainAtlas,
                sourceX, sourceY, tileSize, tileSize,
                x * TILE_RENDER_SIZE, y * TILE_RENDER_SIZE, TILE_RENDER_SIZE, TILE_RENDER_SIZE
            );
        }
    }
}

function drawResources(ctx: CanvasRenderingContext2D, state: SimulationState) {
    const resourceAtlas = assetLoader.getImage('resource_atlas');
    if (!resourceAtlas) return;

    const allItems = [...state.world.resourceNodes, ...state.world.lootContainers];

    allItems.forEach(item => {
        if ('isEmpty' in item && item.isEmpty) return; // Don't draw empty loot containers

        const mapping = 'amount' in item 
            ? resourceMapping.nodes[item.type] 
            : resourceMapping.containers[item.type];

        if (!mapping) return;
        
        ctx.drawImage(
            resourceAtlas,
            mapping.x, mapping.y, mapping.w, mapping.h,
            item.x * TILE_RENDER_SIZE, (item.y - 0.5) * TILE_RENDER_SIZE, // Offset slightly for perspective
            TILE_RENDER_SIZE, TILE_RENDER_SIZE
        );
    });
}


function drawAgents(ctx: CanvasRenderingContext2D, state: SimulationState, selectedAgentId: string | null, time: number) {
    state.agents.forEach(agent => {
        const spritesheetData = spritesheetMapping[agent.sprite];
        const spritesheetImage = assetLoader.getImage(agent.sprite);
        if (!spritesheetData || !spritesheetImage) return;

        const anim = spritesheetData.animations[agent.state === 'walking' ? 'walk' : 'idle'];
        // Use time for smoother animation independent of tick rate
        const frameIndex = Math.floor(time / (anim.speed * 16)) % anim.frames;
        
        // Placeholder direction
        const dir = 'S';
        const rowIndex = anim.rows[dir];

        const sourceX = frameIndex * spritesheetData.frameSize;
        const sourceY = rowIndex * spritesheetData.frameSize;

        const renderX = agent.x * TILE_RENDER_SIZE - (TILE_RENDER_SIZE / 2);
        const renderY = agent.y * TILE_RENDER_SIZE - (TILE_RENDER_SIZE / 2) - (TILE_RENDER_SIZE / 4); // Offset to stand on tile correctly
        
        // Draw selection indicator
        if (agent.id === selectedAgentId) {
            ctx.beginPath();
            ctx.ellipse(agent.x * TILE_RENDER_SIZE, agent.y * TILE_RENDER_SIZE + TILE_RENDER_SIZE/4, TILE_RENDER_SIZE / 3, TILE_RENDER_SIZE / 6, 0, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.drawImage(
            spritesheetImage,
            sourceX, sourceY, spritesheetData.frameSize, spritesheetData.frameSize,
            renderX, renderY, TILE_RENDER_SIZE, TILE_RENDER_SIZE
        );
    });
}

export default GameCanvas;
