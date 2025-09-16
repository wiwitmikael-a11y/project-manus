import React from 'react';
import { SimulationState, Agent } from '../types';
import { spritesheetMapping } from '../assets/assetMapping';

// --- KONFIGURASI VISUAL ---
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const TILE_WIDTH_HALF = TILE_WIDTH / 2;
const TILE_HEIGHT_HALF = TILE_HEIGHT / 2;
const AGENT_VISUAL_WIDTH = 128; // Lebar frame di spritesheet
const AGENT_VISUAL_HEIGHT = 128; // Tinggi frame di spritesheet

// --- FUNGSI UTILITAS ---

/**
 * Mengonversi koordinat grid dunia ke koordinat piksel isometrik di layar.
 */
const worldToIsometric = (x: number, y: number) => ({
  x: (x - y) * TILE_WIDTH_HALF,
  y: (x + y) * TILE_HEIGHT_HALF,
});

interface SimulationViewportProps {
  state: SimulationState | null;
  onAgentClick: (agentId: string) => void;
  selectedAgentId: string | null;
}

const SimulationViewport: React.FC<SimulationViewportProps> = ({ state, onAgentClick, selectedAgentId }) => {
    if (!state) return null;

    const viewportCenter = worldToIsometric(state.world.width / 2, state.world.height / 2);

    return (
        <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden bg-slate-800" style={{ perspective: '1000px' }}>
            <div 
                className="absolute transition-transform duration-500 ease-in-out"
                style={{
                    left: '50%',
                    top: '50%',
                    transform: `translateX(-${viewportCenter.x}px) translateY(-${viewportCenter.y}px)`,
                }}
            >
                {state.agents.map(agent => {
                    const screenPos = worldToIsometric(agent.x, agent.y);
                    const zIndex = Math.round(screenPos.y);

                    const { direction, appearance, animationState, animationFrame } = agent;

                    // Tentukan arah sprite dari spritesheet & apakah perlu di-flip
                    const shouldFlip = ['W', 'SW', 'NW'].includes(direction);
                    let displayDirection: 'S' | 'SE' | 'E' | 'NE' | 'N' = 'S';
                    if (direction === 'N') displayDirection = 'N';
                    else if (direction === 'E' || direction === 'W') displayDirection = 'E';
                    else if (direction === 'SE' || direction === 'SW') displayDirection = 'SE';
                    else if (direction === 'NE' || direction === 'NW') displayDirection = 'NE';

                    // Siapkan style untuk sprite
                    let spriteStyle: React.CSSProperties = {};
                    const sheetData = spritesheetMapping[appearance.spritesheet];
                    if (sheetData) {
                        const animKey = animationState as keyof typeof sheetData.animations;
                        const animData = sheetData.animations[animKey];
                        if (animData) {
                            const row = animData.rows[displayDirection];
                            const col = animationFrame;
                            spriteStyle = {
                                width: `${sheetData.frameSize}px`,
                                height: `${sheetData.frameSize}px`,
                                backgroundImage: `url(${sheetData.url})`,
                                backgroundPosition: `-${col * sheetData.frameSize}px -${row * sheetData.frameSize}px`,
                                transform: `scaleX(${shouldFlip ? -1 : 1})`,
                            };
                        }
                    }
                    
                    return (
                        <div
                            key={agent.id}
                            className={`absolute transition-transform duration-200 ease-linear cursor-pointer group`}
                            style={{
                                width: `${AGENT_VISUAL_WIDTH}px`,
                                height: `${AGENT_VISUAL_HEIGHT}px`,
                                transform: `translateX(${screenPos.x - (AGENT_VISUAL_WIDTH / 2)}px) translateY(${screenPos.y - (AGENT_VISUAL_HEIGHT - TILE_HEIGHT_HALF)}px)`,
                                zIndex: zIndex,
                            }}
                            onClick={() => onAgentClick(agent.id)}
                            aria-label={`Agent ${agent.name}`}
                        >
                            {/* Sprite yang dianimasikan */}
                            <div style={spriteStyle} />

                            {/* Indikator Seleksi */}
                            {selectedAgentId === agent.id && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-5 rounded-full bg-sky-400/40 border border-sky-300"></div>
                            )}
                             {/* Label Nama saat Hover */}
                             <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-max px-2 py-0.5 rounded-full bg-black/40 text-white text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                {agent.name}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SimulationViewport;
