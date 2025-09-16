import React, { useEffect, useState, useMemo } from 'react';
// Fix: Use named imports for @pixi/react components, as the namespace import was incorrect.
import { Stage, Sprite, TilingSprite, useApp, Container } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { SimulationState, Agent } from '../types';
import { loadAssets, getAgentTexture, createGrassTexture } from '../assets';

const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 1000;

interface AgentSpriteProps {
  agent: Agent;
  onAgentClick: (agentId: string) => void;
}

const AgentSprite: React.FC<AgentSpriteProps> = ({ agent, onAgentClick }) => {
  const [texture, setTexture] = useState(() => getAgentTexture(agent.direction));
  
  // Update texture when direction changes
  useEffect(() => {
    setTexture(getAgentTexture(agent.direction));
  }, [agent.direction]);

  return (
    <Sprite
      texture={texture}
      x={agent.x}
      y={agent.y}
      anchor={0.5}
      scale={2} // Make 16x16 sprite bigger
      interactive={true}
      pointerdown={() => onAgentClick(agent.id)}
    />
  );
};

interface GameCanvasProps {
  state: SimulationState;
  onAgentClick: (agentId: string) => void;
}

const GameContent: React.FC<GameCanvasProps> = ({ state, onAgentClick }) => {
    const app = useApp(); // Get the PIXI Application instance from context
    const grassTexture = useMemo(() => createGrassTexture(app.renderer), [app.renderer]);

    return (
        <>
            <TilingSprite
                texture={grassTexture}
                width={WORLD_WIDTH}
                height={WORLD_HEIGHT}
                tilePosition={{ x: 0, y: 0 }}
            />
            <Container>
                {state.agents.map(agent => (
                    <AgentSprite key={agent.id} agent={agent} onAgentClick={onAgentClick} />
                ))}
            </Container>
        </>
    );
};


const GameCanvas: React.FC<GameCanvasProps> = (props) => {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  
  useEffect(() => {
    const init = async () => {
      await loadAssets();
      setAssetsLoaded(true);
    };
    init();
  }, []);

  if (!assetsLoaded) {
    return <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-sky-400">Loading Assets...</div>;
  }

  return (
    <div className="absolute inset-0">
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        options={{ backgroundColor: 0x0a192f }}
      >
          <GameContent {...props} />
      </Stage>
    </div>
  );
};

export default GameCanvas;