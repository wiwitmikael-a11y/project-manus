// components/GameCanvas.tsx
import React, { useRef, useEffect } from 'react';
import { SimulationState, Agent } from '../types.ts';
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

// A simple lerp function for smooth camera movement
const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

const GameCanvas: React.FC<GameCanvasProps> = ({ simulationState, cameraState, setCamera, selectedAgent, onAgentClick }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !assetLoader.loaded) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            // Smooth camera update
            let newCamX = cameraState.x;
            let newCamY = cameraState.y;
            if (cameraState.targetX !== undefined && cameraState.targetY !== undefined) {
                newCamX = lerp(cameraState.x, cameraState.targetX, 0.1);
                newCamY = lerp(cameraState.y, cameraState.targetY, 0.1);
                if (Math.abs(newCamX - cameraState.targetX) < 0.1 && Math.abs(newCamY - cameraState.targetY) < 0.1) {
                    setCamera(cam => ({ ...cam, x: cam.targetX!, y: cam.targetY!}));
                } else {
                    setCamera(cam => ({ ...cam, x: newCamX, y: newCamY }));
                }
            }


            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
            
            ctx.save();
            ctx.clearRect(0, 0, width, height);

            // Center camera and apply zoom
            ctx.translate(width / 2, height / 2);
            ctx.scale(cameraState.zoom, cameraState.zoom);
            ctx.translate(-cameraState.x * 64, -cameraState.y * 64); // Assuming tile size is 64 for rendering

            // --- START RENDERING ---
            // 1. Render Terrain (placeholder)
            if(simulationState.world.tileMap) {
                const terrainAtlas = assetLoader.getImage('terrain_atlas');
                if (terrainAtlas) {
                    const TILE_SIZE = 64; // Render size
                    const ATLAS_TILE_SIZE = terrainMapping.tileSize;
                    simulationState.world.tileMap.forEach((row, y) => {
                        row.forEach((tileId, x) => {
                            const sx = (tileId % 8) * ATLAS_TILE_SIZE;
                            const sy = Math.floor(tileId / 8) * ATLAS_TILE_SIZE;
                            ctx.drawImage(terrainAtlas, sx, sy, ATLAS_TILE_SIZE, ATLAS_TILE_SIZE, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                        });
                    });
                }
            }


            // 2. Render Agents (placeholder)
            simulationState.agents.forEach(agent => {
                ctx.fillStyle = agent.id === selectedAgent?.id ? 'yellow' : 'cyan';
                ctx.beginPath();
                ctx.arc(agent.x * 64, agent.y * 64, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'black';
                ctx.fillText(agent.name.charAt(0), agent.x * 64 - 4, agent.y * 64 + 4);
            });
            // --- END RENDERING ---

            ctx.restore();
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [simulationState, cameraState, selectedAgent, setCamera]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Convert screen coordinates to world coordinates
        const worldX = (x - rect.width / 2) / cameraState.zoom + cameraState.x * 64;
        const worldY = (y - rect.height / 2) / cameraState.zoom + cameraState.y * 64;
        
        // Find clicked agent
        for (const agent of simulationState.agents) {
            const dx = (agent.x * 64) - worldX;
            const dy = (agent.y * 64) - worldY;
            if (Math.sqrt(dx * dx + dy * dy) < 16) { // Check if click is within agent's radius
                onAgentClick(agent);
                return;
            }
        }
    };

    return <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full bg-slate-800" />;
};

export default GameCanvas;
