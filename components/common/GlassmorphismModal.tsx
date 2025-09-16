import React from 'react';

interface GlassmorphismModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const GlassmorphismModal: React.FC<GlassmorphismModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md m-auto bg-slate-800/50 backdrop-blur-lg border border-slate-600/50 rounded-xl shadow-2xl text-slate-100 overflow-hidden"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Aurora Gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-500/10 via-transparent to-indigo-500/10 opacity-50 z-0"></div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-center p-4 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-sky-300">{title}</h2>
                <button 
                    onClick={onClose} 
                    className="text-slate-400 hover:text-white transition-colors text-2xl"
                    aria-label="Close"
                >
                    &times;
                </button>
            </div>
            <div className="p-4">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismModal;
