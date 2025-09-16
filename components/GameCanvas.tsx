// Fix: Implement the GameCanvas component to render the simulation.
import React, { useRef, useEffect, useState } from 'react';
import { SimulationState, Agent } from '../types';
import { assets, loadAssets } from '../assets';

interface GameCanvasProps {
  state: SimulationState;
  onAgentClick: (agentId: string) => void;
  selectedAgentId: string | null;
}

const SPRITE_SIZE = 16; // The size of a single sprite in the spritesheet (64x64 sheet with 4x4 sprites)
const SPRITE_SHEET_COLS = 4;
const RENDER_SPRITE_SIZE = 32; // The size to render the sprite on the canvas

const DIRECTION_MAP: Record<Agent['direction'], number> = {
    down: 0,
    up: 1,
    left: 2,
    right: 3,
};

const GameCanvas: React.FC<GameCanvasProps> = ({ state, onAgentClick, selectedAgentId }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameId = useRef<number | null>(null);
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const frameCounter = useRef(0);

    useEffect(() => {
        loadAssets().then(() => {
            setAssetsLoaded(true);
        }).catch(err => {
            console.error("Failed to load game assets for canvas.", err);
        });
    }, []);

    const draw = (ctx: CanvasRenderingContext2D, agents: Agent[]) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw background
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (!assets.agentSpritesheet) {
            console.warn("Agent spritesheet not loaded, skipping agent draw.");
            return;
        }

        agents.forEach(agent => {
            // Draw selection indicator if agent is selected
            if (agent.id === selectedAgentId) {
                ctx.beginPath();
                ctx.arc(agent.x, agent.y + RENDER_SPRITE_SIZE / 4, RENDER_SPRITE_SIZE / 2, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            const frameIndex = agent.isMoving ? Math.floor(frameCounter.current / 15) % SPRITE_SHEET_COLS : 0;
            const directionRow = DIRECTION_MAP[agent.direction];

            // Draw sprite
            ctx.drawImage(
                assets.agentSpritesheet!,
                frameIndex * SPRITE_SIZE, // sx
                directionRow * SPRITE_SIZE, // sy
                SPRITE_SIZE, // sWidth
                SPRITE_SIZE, // sHeight
                agent.x - RENDER_SPRITE_SIZE / 2, // dx
                agent.y - RENDER_SPRITE_SIZE / 2, // dy
                RENDER_SPRITE_SIZE, // dWidth
                RENDER_SPRITE_SIZE  // dHeight
            );

            // Draw name tag
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(agent.name, agent.x, agent.y - RENDER_SPRITE_SIZE / 2 - 4);
        });
    };

    useEffect(() => {
        if (!assetsLoaded) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            frameCounter.current = (frameCounter.current + 1) % 60; // Loop counter every second at 60fps
            draw(ctx, state.agents);
            animationFrameId.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [state.agents, assetsLoaded, selectedAgentId]); // Re-run effect if agents, assets, or selection change

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Find clicked agent (simple bounding box check)
        const clickedAgent = state.agents.find(agent => 
            x >= agent.x - RENDER_SPRITE_SIZE / 2 &&
            x <= agent.x + RENDER_SPRITE_SIZE / 2 &&
            y >= agent.y - RENDER_SPRITE_SIZE / 2 &&
            y <= agent.y + RENDER_SPRITE_SIZE / 2
        );

        if (clickedAgent) {
            onAgentClick(clickedAgent.id);
        }
    };

    return (
        <canvas
            ref={canvasRef}
            width={800} // Corresponds to WORLD_WIDTH in worker
            height={600} // Corresponds to WORLD_HEIGHT in worker
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-slate-700 rounded-lg"
            onClick={handleCanvasClick}
        />
    );
};

export default GameCanvas;
