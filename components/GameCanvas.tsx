// Fix: Implement the GameCanvas component for simulation visualization.
import React, { useRef, useEffect } from 'react';
import { Agent } from '../types';
import Phaser from 'phaser';
import { heartIcon } from '../assets';

interface GameCanvasProps {
  agents: Agent[];
  day: number;
}

class GameScene extends Phaser.Scene {
  private agentsData: Agent[] = [];
  private agentSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private agentLabels: Map<string, Phaser.GameObjects.Text> = new Map();
  private interactionEffects: Phaser.GameObjects.Group;

  constructor() {
    super({ key: 'GameScene' });
  }

  // Used to pass initial data from React to Phaser
  init(data: { agents: Agent[] }) {
    this.agentsData = data.agents;
  }

  preload() {
    // A simple placeholder for agent visualization
    this.load.spritesheet('agent', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAFaUExURQAAAAEBAQICAgMDAwQEBAUFBQYGBgcHBwgICAkJCQoKCgsLCwwMDA0NDQ4ODg8PDxAQEBERERISEhMTExQUFBUVFRYWFhcXFxgYGBkZGRoaGhsbGxwcHB0dHR4eHh8fHyAgICEhISIiIiMjIyQkJCUlJSYmJicnJygpKSkpKSoqKisrKywsLC0tLS4uLi8vLzAwMDExMTIyMjMzMzQ0NDU1NTY2Njc3Nzg4ODk5OTo6Ojs7Ozw8PD09PT4+Pj8/P0BAQEFBQUJCQkNDQ0REREVFRUZGRkdHR0hISElJSUpKSktLS0xMTE1NTU5OTk9PT1BQUFFRUVJSUlNTU1RUVFVVVVZWVldXV1hYWFlZWVpaWltbW1xcXF1dXV5eXl9fX2BgYGFhYWJiYmNjY2RkZGVlZWZmZmdnZ2hoaGlpaWpqamtra2xsbG1ubm5ubm9vb3BwcHFxcXJycnNzc3R0dHV1dXZ2dnd3d3h4eHl5eXp6ent7e3x8fH19fX5+fn9/f4CAgIKCgoODg4SEhIWFhYaGhoeHh4iIiImJiYqKiouLi4yMjI2NjY6Ojo+Pj5CQkJGRkZKSkpOTk5SUlJWVlZaWlpeXl5iYmJmZmZqampubm5ycnJ2dnZ6enp+fn6CgoKGhoaKioqOjo6SkpKWlpaampqenp6ioqKmpqaqqqqurq6ysrK2tra6urq+vr7CwsLGxsbKysrOzs7S0tLW1tba2tre3t7i4uLm5ubq6uru7u7y8vL29vb6+vr+/v8DAwMHBwcLCwsPDw8TExMXFxcbGxsfHx8jIyMnJycrKysvLy8zMzM3Nzc7Ozs/Pz9DQ0NHR0dLS0tPT09TU1NXV1dbW1tfX19jY2NnZ2dra2tvb29zc3N3d3d7e3t/f3+Dh4eHi4uLj4+Pk5OTl5ebm5ufn5+jo6Onp6erq6uvr6+zs7O3t7e7u7u/v7/Dw8PHx8fLy8vPz8/T09PX19fb29vf39/j4+Pn5+fr6+vv7+/z8/P39/f7+/v///+G/s58AAABb0lEQVR42uzY2w6CMBAF0BuK//+X0xJvKQtp0nPTs/c0B4ASZ56g6aT3VlRUVDQ2FhUVzY2FRUWzY2FR0RwHq4lFRc2xxr2VoqJmWePey6/f3780NFoatf6tXl/ffzS0WBo171Vv1gSlSVo0g6oV696qVgyLVo16V60aMawac69aNSJYNeZerWrEsGrMvWpVj2LVmXuhavkkW1kOa95Lta3U5GjVeS/VtgpZkvYAWbZ/DWTZ/jWQZf2vq2bL+gZssqxvymZLNmnN2U7LlmzKmjfTFstmjbnvpi2XzdZsz7stn03ZpDWfls8mZcvWfFo+m5AtW/Np+WxCtuwtqnnL/D8iW/ZW1Tz30wZky96mmt/0EZAte48lW/Y+yLK+x5Js2SssWbY/yLIWWLIWWLJ+YMk6YMk6YOkaYOk6YOkaYOlaYGmbYOl6YOl6YOl6YOl6YOl6YOl6YGmbYGm7YGlrgKWtA5a2Dljy3wE+AVVj+0t6A6x/AAAAAElFTkSuQmCC', { frameWidth: 16, frameHeight: 16 });
    this.load.image('heart', heartIcon);
  }

  create() {
    // Background color
    this.cameras.main.setBackgroundColor('#1e293b');
    
    // Group for interaction effects
    this.interactionEffects = this.add.group();

    // Create sprites and labels for initial agents
    this.agentsData.forEach(agent => {
      this.createOrUpdateAgentSprite(agent);
    });
  }

  update() {
    // Clear old interaction effects
    this.interactionEffects.clear(true, true);
    
    const interactingPairs: [Agent, Agent][] = [];

    // Update sprites based on new data
    this.agentsData.forEach(agent => {
      this.createOrUpdateAgentSprite(agent);

      if (agent.task === 'Interacting') {
          const other = this.agentsData.find(a => a.id !== agent.id && a.task === 'Interacting' && a.targetX === agent.x && a.targetY === agent.y);
          if (other) {
              const pairExists = interactingPairs.some(p => (p[0].id === agent.id && p[1].id === other.id) || (p[0].id === other.id && p[1].id === agent.id));
              if (!pairExists) {
                  interactingPairs.push([agent, other]);
              }
          }
      }
    });
    
    // Draw interaction effects for pairs
    interactingPairs.forEach(([agentA, agentB]) => {
        const midX = (agentA.x + agentB.x) / 2;
        const midY = (agentA.y + agentB.y) / 2 - 15;
        const heart = this.interactionEffects.create(midX, midY, 'heart');
        heart.setScale(0.05);
        this.tweens.add({
            targets: heart,
            y: midY - 10,
            alpha: 0,
            duration: 1000,
            ease: 'Power2'
        });
    });

    // Remove sprites for agents that no longer exist
    this.agentSprites.forEach((sprite, id) => {
      if (!this.agentsData.some(a => a.id === id)) {
        sprite.destroy();
        this.agentSprites.delete(id);
        this.agentLabels.get(id)?.destroy();
        this.agentLabels.delete(id);
      }
    });
  }

  createOrUpdateAgentSprite(agent: Agent) {
    let sprite = this.agentSprites.get(agent.id);
    let label = this.agentLabels.get(agent.id);

    if (!sprite) {
      sprite = this.add.sprite(agent.x, agent.y, 'agent', 0);
      this.agentSprites.set(agent.id, sprite);
      
      label = this.add.text(agent.x, agent.y - 12, agent.name, {
        font: '12px sans-serif',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
      this.agentLabels.set(agent.id, label);
    }

    // Tween movement for smoothness
    this.tweens.add({
        targets: [sprite, label],
        x: agent.targetX,
        y: agent.targetY,
        duration: 1000, // Make it slower
        ease: 'Power1',
        onUpdate: () => {
            label?.setPosition(sprite!.x, sprite!.y - 12);
        }
    });

    // Update internal position for next tick's logic
    agent.x = agent.targetX;
    agent.y = agent.targetY;
  }

  // Method to update scene data from React
  updateAgents(newAgents: Agent[]) {
    this.agentsData = newAgents;
  }
}


const GameCanvas: React.FC<GameCanvasProps> = ({ agents, day }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GameScene | null>(null);

  useEffect(() => {
    if (gameRef.current) return; // Initialize only once

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 300,
      parent: 'game-container',
      backgroundColor: '#1e293b',
      scene: GameScene,
      audio: {
        noAudio: true, // Forcefully disable audio to prevent security errors
      },
    };
    
    const game = new Phaser.Game(config);
    gameRef.current = game;
    
    // Pass initial data to the scene
    game.scene.start('GameScene', { agents });

    // Store reference to the scene instance
     game.events.on('ready', () => {
        const scene = game.scene.getScene('GameScene');
        if (scene instanceof GameScene) {
            sceneRef.current = scene;
        }
    });


    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    // Update the scene with new agent data when props change
    if (sceneRef.current) {
        sceneRef.current.updateAgents(agents);
    }
  }, [agents]);


  return <div id="game-container" className="w-full h-[300px] bg-slate-800 rounded-lg border border-slate-700" />;
};

export default GameCanvas;
