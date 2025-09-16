import React from 'react';
import Button from './common/Button';

interface WelcomeScreenProps {
  onBegin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onBegin }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 animate-fade-in">
      <div className="text-center max-w-2xl p-8">
        <h1 className="text-4xl md:text-5xl font-bold text-sky-400 tracking-tight">
          Project MANUS
        </h1>
        <p className="text-lg text-slate-300 mt-4">
          Sebuah prototipe simulasi dan dasbor interaktif untuk konsep game 'Project MANUS', sebuah sandbox naratif.
        </p>
        <p className="text-md text-slate-400 mt-2">
          Aplikasi ini memvisualisasikan pilar desain inti game dan menggunakan AI lokal untuk menghasilkan peristiwa naratif yang dinamis.
        </p>
        <div className="mt-8">
          <Button 
            onClick={onBegin}
            variant="primary"
            className="px-8 py-3 text-lg"
          >
            Mulai Simulasi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
