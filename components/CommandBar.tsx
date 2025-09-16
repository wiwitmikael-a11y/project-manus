import React from 'react';
import Button from './common/Button.tsx';

interface CommandBarProps {
    isPaused: boolean;
    onTogglePause: () => void;
    onShowAgentList: () => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ isPaused, onTogglePause, onShowAgentList }) => {
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-lg p-2 flex items-center space-x-2 shadow-2xl z-20">
            <Button onClick={onTogglePause} className="w-24">
                {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button onClick={onShowAgentList} variant="secondary">
                View Agents
            </Button>
            {/* Add more command buttons here in the future */}
        </div>
    );
};

export default CommandBar;
