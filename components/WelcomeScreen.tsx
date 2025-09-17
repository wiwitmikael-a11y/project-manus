import React from 'react';
import Button from './common/Button.tsx';

interface WelcomeScreenProps {
  onBegin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onBegin }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 animate-fade-in">
      <div className="text-center max-w-2xl p-8">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-400 tracking-tight">
          Project MANUS
        </h1>
        <p className="text-lg text-slate-300 mt-4">
          Sebuah simulasi bertahan hidup dan membangun kembali di dunia yang telah direbut oleh kehancuran.
        </p>
        <p className="text-md text-slate-400 mt-2">
          Pimpin sekelompok penyintas, kelola sumber daya, dan hadapi bahaya di lanskap pasca-apokaliptik yang dihasilkan oleh AI.
        </p>
        <div className="mt-8">
          <Button 
            onClick={onBegin}
            variant="primary"
            className="px-8 py-3 text-lg bg-amber-600 hover:bg-amber-500 focus:ring-amber-500"
          >
            Mulai Bertahan Hidup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;