import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SimulationState, Agent } from '../types';
import { loadAssets, getCharacterSpriteSheet, SpriteSheet } from '../assets';

const WORLD_WIDTH = 800;
const WORLD_HEIGHT = 600;
const AGENT_CLICK_RADIUS = 20;

interface GameCanvasProps {
  state: SimulationState;
  onAgentClick: (agentId: string) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ state, onAgentClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [assetsReady, setAssetsReady] = useState(false);
  const animationFrameId = useRef<number>();
  const frameCounter = useRef(0);

  useEffect(() => {
    loadAssets().then(() => {
      setAssetsReady(true);
    });
  }, []);

  const drawAgent = useCallback((ctx: CanvasRenderingContext2D, agent: Agent, spriteSheet: SpriteSheet) => {
    const { frameWidth, frameHeight, image, animations } = spriteSheet;

    let animation = animations[agent.direction];
    if (!animation) animation = animations['down'];
    
    let frameIndex = 0;
    if (agent.isMoving) {
      const frameSpeed = Math.floor(animation.speed / 16); // ~60fps
      frameIndex = animation.frames[Math.floor(frameCounter.current / frameSpeed) % animation.frames.length];
    } else {
      frameIndex = animation.frames[1]; // Idle frame
    }

    const sheetX = frameIndex % 3; // 3 columns for sprites
    const sheetY = Math.floor(frameIndex / 3);
    
    const sx = sheetX * frameWidth;
    const sy = sheetY * frameHeight;

    // Draw sprite
    ctx.drawImage(
      image,
      sx,
      sy,
      frameWidth,
      frameHeight,
      agent.x - frameWidth / 2,
      agent.y - frameHeight, // Draw from feet
      frameWidth,
      frameHeight
    );

    // Draw name tag
    ctx.fillStyle = 'white';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(agent.name, agent.x, agent.y - frameHeight - 2);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state || !assetsReady) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spriteSheet = getCharacterSpriteSheet();

    // Clear canvas
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)'; // slate-600
    ctx.lineWidth = 1;
    for (let x = 0; x <= WORLD_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WORLD_WIDTH, y);
        ctx.stroke();
    }


    // Draw agents
    if (spriteSheet) {
      state.agents.forEach(agent => drawAgent(ctx, agent, spriteSheet));
    } else {
        // Fallback drawing if sprites fail to load
        state.agents.forEach(agent => {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(agent.x, agent.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(agent.name, agent.x, agent.y - 10);
        });
    }

    frameCounter.current += 1;
    animationFrameId.current = requestAnimationFrame(draw);
  }, [state, assetsReady, drawAgent]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(draw);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [draw]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !state) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    
    // Find clicked agent (simple distance check)
    let clickedAgent = null;
    for (const agent of state.agents) {
        const dx = agent.x - x;
        const dy = agent.y - y + 8; // Adjust for sprite height
        if (Math.sqrt(dx * dx + dy * dy) < AGENT_CLICK_RADIUS) {
            clickedAgent = agent;
            break;
        }
    }

    if (clickedAgent) {
        onAgentClick(clickedAgent.id);
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-slate-900">
      <canvas
        ref={canvasRef}
        width={WORLD_WIDTH}
        height={WORLD_HEIGHT}
        onClick={handleCanvasClick}
        className="bg-slate-800 border border-slate-700"
      />
    </div>
  );
};

export default GameCanvas;
