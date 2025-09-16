import React, { useRef, useEffect } from 'react';
import Phaser from 'phaser';
import { SimulationState } from '../types';

// The spritesheet URL is now a local constant since assets.ts is removed.
const AGENT_SPRITESHEET_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKVSURBVHhe7ZfRbhw1EIYdlhVwAStcIM8k7yTfJH8kHyTfJHcSKpAgkKyAuUKgK1AVGgCuwBVYACsI4jAw42APwxy3s3v2u6dnmekf2e+TGWv27G0bhuE4I/A+gWcIvOfws4AfA3iEwHkCrwP8eA/g4wAeIvA0gU/g1/4LwGkCrwN8CPgwwKcDvA3gTwP8CeBTAB8BfA7gswB/BvAnAI8Q+DjA5wE+DvA0gY8BfAvgcwCfAvgYwAcCnxL4GMDnAD4A8AmAjwA+D/BtAH8B8CmAjwD8CeBTAB8H+AzgYwAfBfgh4GcAnwP4GMDHAD4C8BmATwD8C8CfAj5C4CPAuwA/A3wY4HMAHwP4FMBnAD4B8AGA/wL8CeBTAB8C/BTws4BPgU8B/BTAnwA+BPgwwKcBvA3gTwP8GMDHAb4M8GmATwM8D+AjAC8Q+GkAnwB4hMDbAH4I+DnAJwA+C/CtAXwI4FEA7wH8eBfABwHeIfA+gU8BPETgA/gGgHcIfBDgEwB/BvBxgP8E8AmAtwH8CPAngM8BfA7gwwA+AvgwwM8APg3waQAfAvgcgLcA/AvgEwDfAvgl4OcAnwD4IcCfAT4M8AGA/wL8CeAjAI8QeI/ADwDeIfAvgM8BfAvgrQF8COBvAF8A+GLAbwD+CPAggA8B/BTARwA+C/DbgL8F/CXgZwB/AvgwwM8APg3waQAfA7gL8LkAbwP4FMC3AfwI4CMAjwB4hMDHAb4M8AmAjwA+A/BxgHcAfArgUwAfAnhH4HcAnwL4A78A8CeBTwF8COAPAHwI4GMANwJ8CGAzAC8Q+CnAPwV8COA/AvgwwM8APg3waQAfA/gYwM8A3gJ4L8AfAvghwG8BvA3ghwA+BPAfgP8F/CngFwB/Cfgp8LeAbwL4A/gIwKcBvA3gTwP8GMDHAd/M3X/s51gAAAAASUVORK5CYII=';

// --- Phaser Scene ---
class GameScene extends Phaser.Scene {
    private agentSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
    private selectionCircle: Phaser.GameObjects.Graphics | null = null;
    private onAgentClick: (agentId: string) => void = () => {};

    // Fix: Explicitly declare properties inherited from Phaser.Scene to resolve TypeScript errors.
    public scene: Phaser.Scenes.ScenePlugin;
    public add: Phaser.GameObjects.GameObjectFactory;
    public load: Phaser.Loader.LoaderPlugin;
    public anims: Phaser.Animations.AnimationManager;
    public cameras: Phaser.Cameras.Scene2D.CameraManager;

    constructor() {
        super({ key: 'GameScene' });
    }

    // Custom method to receive data from React
    public updateState(state: SimulationState, selectedAgentId: string | null, onAgentClick: (id: string) => void) {
        if (!this.scene.isActive()) return;
        this.onAgentClick = onAgentClick;

        const agentIdsInState = new Set(state.agents.map(a => a.id));

        // 1. Remove sprites for agents that no longer exist
        for (const [agentId, sprite] of this.agentSprites.entries()) {
            if (!agentIdsInState.has(agentId)) {
                sprite.destroy();
                this.agentSprites.delete(agentId);
            }
        }

        // 2. Update existing sprites and create new ones
        for (const agent of state.agents) {
            let sprite = this.agentSprites.get(agent.id);

            // Create sprite if it doesn't exist
            if (!sprite) {
                sprite = this.add.sprite(agent.x, agent.y, 'agent').setInteractive();
                sprite.on('pointerdown', () => this.onAgentClick(agent.id));
                this.agentSprites.set(agent.id, sprite);
            }

            // Update sprite properties
            sprite.setPosition(agent.x, agent.y);
            sprite.setDepth(agent.y); // Smart layering based on Y-axis

            // Update animation
            const direction = agent.direction;
            const animKey = agent.isMoving ? `${direction}-walk` : `${direction}-idle`;
            if (sprite.anims.currentAnim?.key !== animKey) {
                sprite.play(animKey);
            }
        }

        // 3. Update selection indicator
        this.selectionCircle?.clear();
        const selectedAgent = state.agents.find(a => a.id === selectedAgentId);
        if (selectedAgent && this.selectionCircle) {
            this.selectionCircle.fillStyle(0xffffff, 0.25);
            this.selectionCircle.fillCircle(selectedAgent.x, selectedAgent.y + 8, 16);
            this.selectionCircle.setDepth(selectedAgent.y - 1); // Render just behind the agent
        }
    }

    preload() {
        this.load.spritesheet('agent', AGENT_SPRITESHEET_URL, { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        this.cameras.main.setBackgroundColor('#1e293b'); // slate-800
        this.selectionCircle = this.add.graphics();

        const directions = ['down', 'up', 'left', 'right'];
        directions.forEach((dir, index) => {
            // Walking animations
            this.anims.create({
                key: `${dir}-walk`,
                frames: this.anims.generateFrameNumbers('agent', { start: index * 4, end: index * 4 + 3 }),
                frameRate: 8,
                repeat: -1,
            });
            // Idle "animations" (single frame)
            this.anims.create({
                key: `${dir}-idle`,
                frames: [{ key: 'agent', frame: index * 4 }],
                frameRate: 1,
            });
        });
    }
}

// --- React Component ---
interface GameCanvasProps {
    state: SimulationState;
    onAgentClick: (agentId: string) => void;
    selectedAgentId: string | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ state, onAgentClick, selectedAgentId }) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameContainerRef.current || gameInstanceRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: gameContainerRef.current,
            scene: [GameScene],
            pixelArt: true, // Crucial for crisp pixel art
            backgroundColor: '#1e293b',
        };

        gameInstanceRef.current = new Phaser.Game(config);

        return () => {
            gameInstanceRef.current?.destroy(true);
            gameInstanceRef.current = null;
        };
    }, []);

    useEffect(() => {
        const scene = gameInstanceRef.current?.scene.getScene('GameScene') as GameScene | undefined;
        if (scene?.scene.isActive()) {
            scene.updateState(state, selectedAgentId, onAgentClick);
        }
    }, [state, selectedAgentId, onAgentClick]);

    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-slate-700 rounded-lg overflow-hidden">
        <div ref={gameContainerRef} />
      </div>
    );
};

export default GameCanvas;