import React, { useRef, useEffect } from 'react';
import { SimulationState, Agent, AgentDirection, ResourceNode } from '../types';
import { assetLoader } from '../assets';
import { spritesheetMapping } from '../assets/assetMapping';
import { terrainMapping } from '../assets/terrainAssetMapping';
import { resourceMapping } from '../assets/resourceAssetMapping';

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

const TILE_WIDTH = 128;
const TILE_HEIGHT = 64;
const TILE_WIDTH_HALF = TILE_WIDTH / 2;
const TILE_HEIGHT_HALF = TILE_HEIGHT / 2;

const worldToIso = (x: number, y: number): { isoX: number; isoY: number } => {
  const isoX = (x - y) * TILE_WIDTH_HALF;
  const isoY = (x + y) * TILE_HEIGHT_HALF;
  return { isoX, isoY };
};

type RenderableObject = (Agent | ResourceNode) & { renderType: 'agent' | 'node' };

const GameCanvas: React.FC<GameCanvasProps> = ({ simulationState, cameraState, setCamera, selectedAgent, onAgentClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const TERRAIN_ATLAS = assetLoader.getImage('terrain_atlas');
    const RESOURCE_ATLAS = assetLoader.getImage('resource_atlas');

    const draw = () => {
        const { agents, world, timeOfDay } = simulationState;
        const { tileMap, width: worldWidth, height: worldHeight, resourceNodes } = world;

        if (cameraState.targetX !== undefined && cameraState.targetY !== undefined) {
             const targetIso = worldToIso(cameraState.targetX, cameraState.targetY);
             cameraState.x += (targetIso.isoX - cameraState.x) * 0.1;
             cameraState.y += (targetIso.isoY - cameraState.y) * 0.1;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(cameraState.zoom, cameraState.zoom);
        ctx.translate(-cameraState.x, -cameraState.y);

        // --- Draw Terrain ---
        if (tileMap && TERRAIN_ATLAS) {
            const ATLAS_COLUMNS = 8; // The user-provided terrain atlas has 8 columns.
            for (let y = 0; y < worldHeight; y++) {
                for (let x = 0; x < worldWidth; x++) {
                    const tileId = tileMap[y][x];
                    const { isoX, isoY } = worldToIso(x, y);
                    const sourceX = (tileId % ATLAS_COLUMNS) * terrainMapping.tileSize;
                    const sourceY = Math.floor(tileId / ATLAS_COLUMNS) * terrainMapping.tileSize;
                    ctx.drawImage(TERRAIN_ATLAS, sourceX, sourceY, terrainMapping.tileSize, terrainMapping.tileSize, isoX, isoY - TILE_HEIGHT_HALF, TILE_WIDTH, TILE_WIDTH);
                }
            }
        }

        // --- Gabungkan dan Sortir Semua Objek Renderable ---
        const renderableObjects: RenderableObject[] = [
            ...agents.map(a => ({...a, renderType: 'agent' as const})),
            ...resourceNodes.map(n => ({...n, renderType: 'node' as const}))
        ];
        renderableObjects.sort((a, b) => (a.y + a.x) - (b.y + b.x));

        // --- Draw Objects (Agents and Resources) ---
        renderableObjects.forEach(obj => {
            const { isoX, isoY } = worldToIso(obj.x, obj.y);

            if (obj.renderType === 'agent') {
                const agent = obj as Agent;
                const sheetData = spritesheetMapping[agent.appearance.spritesheet];
                const AGENT_ATLAS = assetLoader.getImage(agent.appearance.spritesheet);
                if (!sheetData || !AGENT_ATLAS) return;

                const animData = sheetData.animations[agent.animationState];
                const dirMap: Record<AgentDirection, 'N'|'NE'|'E'|'SE'|'S'> = { 'N': 'N', 'NE': 'NE', 'E': 'E', 'SE': 'SE', 'S': 'S', 'NW': 'NE', 'W': 'E', 'SW': 'SE' };
                const row = animData.rows[dirMap[agent.direction]];
                const flip = agent.direction === 'W' || agent.direction === 'NW' || agent.direction === 'SW';
                const sx = agent.animationFrame * sheetData.frameSize;
                const sy = row * sheetData.frameSize;
                const drawX = isoX + TILE_WIDTH_HALF - sheetData.frameSize / 2;
                const drawY = isoY - (sheetData.frameSize - TILE_HEIGHT_HALF);

                ctx.save();
                if (flip) {
                    ctx.translate(drawX + sheetData.frameSize, drawY);
                    ctx.scale(-1, 1);
                } else {
                    ctx.translate(drawX, drawY);
                }
                ctx.drawImage(AGENT_ATLAS, sx, sy, sheetData.frameSize, sheetData.frameSize, 0, 0, sheetData.frameSize, sheetData.frameSize);
                ctx.restore();

                if (selectedAgent && selectedAgent.id === agent.id) {
                    ctx.beginPath();
                    ctx.ellipse(isoX + TILE_WIDTH_HALF, isoY + TILE_HEIGHT_HALF, TILE_WIDTH_HALF * 0.7, TILE_HEIGHT_HALF * 0.7, 0, 0, 2 * Math.PI);
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 3 / cameraState.zoom;
                    ctx.stroke();
                }
            } else if (obj.renderType === 'node' && RESOURCE_ATLAS) {
                const node = obj as ResourceNode;
                const mapping = resourceMapping.nodes[node.type];
                if (!mapping) return;
                const drawX = isoX + TILE_WIDTH_HALF - resourceMapping.tileSize / 2;
                const drawY = isoY - (resourceMapping.tileSize - TILE_HEIGHT_HALF);
                ctx.drawImage(RESOURCE_ATLAS, mapping.sx, mapping.sy, resourceMapping.tileSize, resourceMapping.tileSize, drawX, drawY, resourceMapping.tileSize, resourceMapping.tileSize);
            }
        });

        ctx.restore();

        // --- Draw Day/Night Overlay ---
        if (timeOfDay === 'night') {
            ctx.fillStyle = 'rgba(10, 20, 50, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleClick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left);
        const mouseY = (e.clientY - rect.top);
        const worldMouseX = (mouseX - canvas.width / 2) / cameraState.zoom + cameraState.x;
        const worldMouseY = (mouseY - canvas.height / 2) / cameraState.zoom + cameraState.y;

        let clickedAgent = null;
        for (const agent of [...simulationState.agents].reverse()) {
             const { isoX, isoY } = worldToIso(agent.x, agent.y);
             const dist = Math.sqrt(Math.pow(worldMouseX - (isoX + TILE_WIDTH_HALF), 2) + Math.pow(worldMouseY - (isoY), 2));
             if (dist < TILE_HEIGHT) {
                 clickedAgent = agent;
                 break;
             }
        }
        if (clickedAgent) onAgentClick(clickedAgent);
    };
    
    canvas.addEventListener('click', handleClick);

    return () => {
        cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('click', handleClick);
    };
  }, [simulationState, cameraState, setCamera, selectedAgent, onAgentClick]);

  return <canvas ref={canvasRef} className="w-full h-full" width={window.innerWidth} height={window.innerHeight} />;
};

export default GameCanvas;