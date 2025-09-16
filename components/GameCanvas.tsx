// Fix: Implement the GameCanvas component for simulation visualization.
import React, { useRef, useEffect } from 'react';
import { Agent } from '../types';

interface GameCanvasProps {
  agents: Agent[];
  day: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ agents, day }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set canvas size based on its container
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 300; // Fixed height

    // Animate frame by frame
    let animationFrameId: number;

    const render = () => {
        // Clear canvas
        context.fillStyle = '#1e293b'; // slate-800
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw agents
        agents.forEach(agent => {
            // Move agent towards target
            const dx = agent.targetX - agent.x;
            const dy = agent.targetY - agent.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 1) {
                agent.x += dx / dist * 0.5; // Slower movement
                agent.y += dy / dist * 0.5;
            }

            context.beginPath();
            context.arc(agent.x, agent.y, 8, 0, 2 * Math.PI, false);
            context.fillStyle = '#67e8f9'; // sky-300
            context.fill();
            
            context.font = '12px sans-serif';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.fillText(agent.name, agent.x, agent.y - 12);
            context.font = '10px sans-serif';
            context.fillStyle = '#cbd5e1'; // slate-300
            context.fillText(`(${agent.task})`, agent.x, agent.y + 18);
        });
        animationFrameId = window.requestAnimationFrame(render);
    }
    render();

    return () => {
        window.cancelAnimationFrame(animationFrameId);
    }

  }, [agents]); // Re-setup animation when agents array changes.

  return <canvas ref={canvasRef} className="w-full h-[300px] bg-slate-800 rounded-lg border border-slate-700" />;
};

export default GameCanvas;
