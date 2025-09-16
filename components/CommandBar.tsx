// Fix: Implement the CommandBar component with UI controls.
import React from 'react';
import { PlayIcon, PauseIcon, ColonyIcon, EventsIcon } from './common/Icons';

interface CommandBarProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onColonyClick: () => void;
  onEventsClick: () => void;
}

const CommandBarButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string }> = ({ onClick, children, 'aria-label': ariaLabel }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className="h-12 w-12 rounded-full bg-slate-700/50 backdrop-blur-sm text-slate-300 hover:bg-sky-500/50 hover:text-white transition-all duration-200 flex items-center justify-center border border-slate-600/50"
    >
        {children}
    </button>
);


const CommandBar: React.FC<CommandBarProps> = ({ isPaused, onTogglePause, onColonyClick, onEventsClick }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-3 p-2 bg-slate-800/50 backdrop-blur-lg border border-slate-600/50 rounded-full shadow-lg">
            <CommandBarButton onClick={onTogglePause} aria-label={isPaused ? "Play Simulation" : "Pause Simulation"}>
                {isPaused ? <PlayIcon className="h-6 w-6" /> : <PauseIcon className="h-6 w-6" />}
            </CommandBarButton>
            
            <div className="w-px h-8 bg-slate-600/50"></div>

            <CommandBarButton onClick={onColonyClick} aria-label="Open Colony Status">
                <ColonyIcon className="h-6 w-6" />
            </CommandBarButton>
            <CommandBarButton onClick={onEventsClick} aria-label="Open Event Log">
                <EventsIcon className="h-6 w-6" />
            </CommandBarButton>
        </div>
    </div>
  );
};

export default CommandBar;
