
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SimulationState } from '../types.ts';
import GameCanvas from './GameCanvas.tsx';
import HudSidebar from './HudSidebar.tsx';
import CommandBar from './CommandBar.tsx';
import AgentListModal from './AgentListModal.tsx';
import { TILE_RENDER_SIZE } from '../gameConstants.ts';

interface SimulationViewportProps {
  simulationState: SimulationState;
  onTogglePause: () => void;
}

const SimulationViewport: React.FC<SimulationViewportProps> = ({ simulationState, onTogglePause }) => {
  const [camera, setCamera] = useState({ x: 50 * TILE_RENDER_SIZE, y: 50 * TILE_RENDER_SIZE, zoom: 0.5 });
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isAgentListVisible, setIsAgentListVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastDragPoint = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);
  
  const handleSelectAgent = useCallback((id: string) => {
    setSelectedAgentId(id);
    const agent = simulationState.agents.find(a => a.id === id);
    if(agent) {
        // Center camera on agent
        setCamera(prev => ({ ...prev, x: agent.x * TILE_RENDER_SIZE, y: agent.y * TILE_RENDER_SIZE, zoom: Math.max(prev.zoom, 1.0) }));
    }
    setIsAgentListVisible(false); // Close modal on selection
  }, [simulationState.agents]);

  // Effect to follow the selected agent
  useEffect(() => {
      if (selectedAgentId) {
          const agent = simulationState.agents.find(a => a.id === selectedAgentId);
          if (agent) {
               setCamera(prev => ({ ...prev, x: agent.x * TILE_RENDER_SIZE, y: agent.y * TILE_RENDER_SIZE }));
          }
      }
  }, [simulationState.tick, selectedAgentId, simulationState.agents]);

  // Effect for camera controls
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const worldPixelWidth = simulationState.world.width * TILE_RENDER_SIZE;
    const worldPixelHeight = simulationState.world.height * TILE_RENDER_SIZE;
    
    // Constants for isometric panning calculation
    const TILE_WIDTH = TILE_RENDER_SIZE;
    const TILE_HEIGHT = TILE_RENDER_SIZE / 2;

    const clampCamera = (cam: {x:number, y:number, zoom:number}) => {
        const buffer = 200 / cam.zoom;
        return {
            ...cam,
            x: Math.max(0 - buffer, Math.min(worldPixelWidth + buffer, cam.x)),
            y: Math.max(0 - buffer, Math.min(worldPixelHeight + buffer, cam.y)),
        }
    };

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const zoomSpeed = 0.001;
        setCamera(prev => {
            const newZoom = Math.max(0.2, Math.min(2.0, prev.zoom - e.deltaY * zoomSpeed));
            return clampCamera({ ...prev, zoom: newZoom });
        });
    };
    
    const handleMouseDown = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('.z-10, .z-20')) return;
        isDragging.current = true;
        lastDragPoint.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => { isDragging.current = false; };
    
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const dx_screen = e.clientX - lastDragPoint.current.x;
        const dy_screen = e.clientY - lastDragPoint.current.y;
        lastDragPoint.current = { x: e.clientX, y: e.clientY };

        // Convert 2D screen delta to isometric world delta
        const dx_world = (dx_screen / TILE_WIDTH + dy_screen / TILE_HEIGHT) * TILE_RENDER_SIZE;
        const dy_world = (dy_screen / TILE_HEIGHT - dx_screen / TILE_WIDTH) * TILE_RENDER_SIZE;
        
        setCamera(prev => clampCamera({ ...prev, x: prev.x - dx_world / prev.zoom, y: prev.y - dy_world / prev.zoom }));
    };

    const getTouchDistance = (e: TouchEvent) => {
        return Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
        if ((e.target as HTMLElement).closest('.z-10, .z-20')) return;
        if (e.touches.length === 1) {
            isDragging.current = true;
            lastDragPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
            isDragging.current = false;
            lastPinchDist.current = getTouchDistance(e);
        }
    };
    
    const handleTouchEnd = () => { isDragging.current = false; lastPinchDist.current = 0; };

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging.current) {
             const dx_screen = e.touches[0].clientX - lastDragPoint.current.x;
             const dy_screen = e.touches[0].clientY - lastDragPoint.current.y;
             lastDragPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
             
             const dx_world = (dx_screen / TILE_WIDTH + dy_screen / TILE_HEIGHT) * TILE_RENDER_SIZE;
             const dy_world = (dy_screen / TILE_HEIGHT - dx_screen / TILE_WIDTH) * TILE_RENDER_SIZE;
             
             setCamera(prev => clampCamera({ ...prev, x: prev.x - dx_world / prev.zoom, y: prev.y - dy_world / prev.zoom }));
        } else if (e.touches.length === 2) {
            const newDist = getTouchDistance(e);
            if(lastPinchDist.current > 0) {
                const zoomFactor = newDist / lastPinchDist.current;
                setCamera(prev => {
                    const newZoom = Math.max(0.2, Math.min(2.0, prev.zoom * zoomFactor));
                    return clampCamera({ ...prev, zoom: newZoom });
                });
            }
            lastPinchDist.current = newDist;
        }
    };
    
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    viewport.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    viewport.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
        viewport.removeEventListener('wheel', handleWheel);
        viewport.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mousemove', handleMouseMove);
        viewport.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('touchcancel', handleTouchEnd);
        viewport.removeEventListener('touchmove', handleTouchMove);
    };
  }, [simulationState.world.width, simulationState.world.height]);

  return (
    <div ref={viewportRef} className="relative w-full h-full bg-slate-800 overflow-hidden" style={{ touchAction: 'none' }}>
      <GameCanvas 
        simulationState={simulationState} 
        camera={camera} 
        selectedAgentId={selectedAgentId} 
      />
      <HudSidebar 
        simulationState={simulationState} 
        selectedAgentId={selectedAgentId} 
        onSelectAgent={handleSelectAgent} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      <CommandBar 
        isPaused={simulationState.isPaused} 
        onTogglePause={onTogglePause} 
        onShowAgentList={() => setIsAgentListVisible(true)}
      />
      <AgentListModal
        isOpen={isAgentListVisible}
        onClose={() => setIsAgentListVisible(false)}
        agents={simulationState.agents}
        onSelectAgent={handleSelectAgent}
      />
    </div>
  );
};

export default SimulationViewport;
